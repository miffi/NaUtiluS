package db

import (
	"context"

	"github.com/miffi/nautilus/backend/cmd/api/types"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/rs/zerolog"
)

type DbQuery interface {
	QueryFullGraph(ctx context.Context) (types.Graph, error)
	Close(ctx context.Context) error
	MakeOr(ctx context.Context) (string, error)
	CourseSummaries(ctx context.Context) ([]types.Summary, error)
	CourseDetail(ctx context.Context, code string) (types.Detail, error)
	Departments(ctx context.Context) ([]string, error)
	Filter(ctx context.Context, options types.FilterOptions) (types.Graph, error)
	ExpandNode(ctx context.Context, neighbors types.NodeNeighbors) (types.Graph, error)
}

type DbModify interface {
	AddCourse(ctx context.Context, details types.CourseDetails) error
	AddCluster(ctx context.Context, howMany int, courseNames []string) (string, error)
	AddRequires(ctx context.Context, source, target, grade string) error
	Close(ctx context.Context) error
}

type Db interface {
	DbQuery
	DbModify
}

type database struct {
	driver neo4j.DriverWithContext
	logger zerolog.Logger
}

func NewDb(uri, username, password string, logger zerolog.Logger) (Db, error) {
	var db database
	var err error
	db.driver, err = getNeo4jDriver(uri, username, password)
	db.logger = logger.With().Str("component", "DbQuery").Logger()

	return &db, err
}

func NewDbQuery(uri, username, password string, logger zerolog.Logger) (DbQuery, error) {
	return NewDb(uri, username, password, logger)
}

func NewDbModify(uri, username, password string, logger zerolog.Logger) (DbModify, error) {
	return NewDb(uri, username, password, logger)
}

func (db *database) Close(ctx context.Context) error {
	return db.driver.Close(ctx)
}

func getLinksTxFunc(ctx context.Context) neo4j.ManagedTransactionWorkT[[]types.Link] {
	return func(tx neo4j.ManagedTransaction) ([]types.Link, error) {
		getLinksCypher := `
			MATCH ()-[r:REQUIRES]-()
			RETURN startNode(r).name AS target, endNode(r).name AS source
		`
		result, err := tx.Run(ctx, getLinksCypher, nil)
		if err != nil {
			return nil, err
		}

		var links []types.Link = nil
		for result.Next(ctx) {
			recordMap := result.Record().AsMap()
			link := types.Link{
				SourceName: recordMap["source"].(string),
				TargetName: recordMap["target"].(string),
			}
			links = append(links, link)
		}

		if err = result.Err(); err != nil {
			return nil, err
		}

		return links, nil
	}
}

func getNodesTxFunc(ctx context.Context) neo4j.ManagedTransactionWorkT[[]types.Node] {
	return func(tx neo4j.ManagedTransaction) ([]types.Node, error) {
		getNodesCypher := `
			MATCH (n:Cluster)
			RETURN n.name AS name, "" AS department, true AS cluster
			UNION ALL
			MATCH (n:Course)-[:IN_DEPARTMENT]->(department:Department)
			RETURN n.name AS name, department.name AS department, false AS cluster
		`
		result, err := tx.Run(ctx, getNodesCypher, nil)
		if err != nil {
			return nil, err
		}

		var nodes []types.Node = nil
		for result.Next(ctx) {
			recordMap := result.Record().AsMap()
			node := types.Node{
				Name:       recordMap["name"].(string),
				Department: recordMap["department"].(string),
				IsCluster:  recordMap["cluster"].(bool),
			}
			nodes = append(nodes, node)
		}

		if err = result.Err(); err != nil {
			return nil, err
		}

		return nodes, nil
	}
}

func (db *database) QueryFullGraph(ctx context.Context) (types.Graph, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	var graph types.Graph

	nodes, err := neo4j.ExecuteRead(ctx, session, getNodesTxFunc(ctx))
	if err != nil {
		return graph, err
	}

	links, err := neo4j.ExecuteRead(ctx, session, getLinksTxFunc(ctx))
	if err != nil {
		return graph, err
	}

	graph = types.Graph{
		Nodes: nodes,
		Links: links,
	}

	return graph, nil
}

func addCourseTxFunc(ctx context.Context, details types.CourseDetails) neo4j.ManagedTransactionWork {
	return func(tx neo4j.ManagedTransaction) (any, error) {
		var semesters []string
		for _, data := range details.SemesterData {
			semesters = append(semesters, parseSemester(data.Number))
		}

		const courseAddQuery = `
			MERGE (course:Course:Main {name: $name})
			SET course.title = $title,
				course.faculty = $faculty,
				course.description = $description,
				course.preclusion = $preclusion,
			    course.prerequisite = $prerequisite,
				course.credit = $credit,
				course.semester = $semester
			MERGE (department:Department {name: $department})
			MERGE (course)-[:IN_DEPARTMENT]->(department)
			RETURN course.name
		`
		result, err := tx.Run(ctx, courseAddQuery,
			map[string]any{
				"name":         details.CourseCode,
				"faculty":      details.Faculty,
				"department":   details.Department,
				"title":        details.Title,
				"description":  details.Description,
				"preclusion":   details.Preclusion,
				"prerequisite": details.Prerequisite,
				"credit":       details.CourseCredit,
				"semester":     semesters,
			})
		if err != nil {
			return nil, err
		}
		return result.Consume(ctx)
	}
}

func parseSemester(num int) string {
	switch num {
	case 2:
		return "Semester 2"
	case 3:
		return "Special Semester 1"
	case 4:
		return "Special Semester 2"
	// no obvious way to handle other numbers
	default:
		return "Semester 1"
	}
}

func (db *database) AddCourse(ctx context.Context, details types.CourseDetails) error {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, addCourseTxFunc(ctx, details))
	return err
}

func findClusterWithOnlyCoursesTxFunc(ctx context.Context, howMany int, regexes []string) neo4j.ManagedTransactionWorkT[string] {
	const query = `
		MATCH (c:Cluster)-[:REQUIRES]->(n:Course)
		WITH c, collect(n.name) as names
		WHERE ALL(
			name IN names
			WHERE ANY(regex in $regexes WHERE name =~ regex))
		RETURN c.name as uuid
		LIMIT 1
	`
	return func(tx neo4j.ManagedTransaction) (string, error) {
		result, err := tx.Run(ctx, query, map[string]any{
			"howMany": howMany,
			"regexes": regexes,
		})
		if err != nil {
			return "", err
		}

		value, err := result.Single(ctx)
		if err != nil {
			// There are no entries. The match failed. This is expected
			// behaviour and "" should be returned
			return "", nil
		}

		uuid := value.Values[0].(string)
		return uuid, nil
	}
}

func addClusterTxFunc(ctx context.Context, howMany int, nodeNames []string) neo4j.ManagedTransactionWorkT[string] {
	const query = `
		CREATE (c:Cluster:Main { howMany: $howMany, name: randomUUID() })
		WITH c
		UNWIND $names as name
		MATCH (n:Main { name: name })
		CREATE (c)-[:REQUIRES]->(n)
		RETURN c.name, count(n)
	`
	return func(tx neo4j.ManagedTransaction) (string, error) {
		result, err := tx.Run(ctx, query, map[string]any{
			"howMany": howMany,
			"names":   nodeNames,
		})
		if err != nil {
			return "", err
		}

		value, err := result.Single(ctx)
		if err != nil {
			// One of the courses does not exist. Sadly this is defined
			// behaviour. There are no checks done in the prerequisiteRule from
			// NUSMods' end.
			return "", nil
		}

		uuid := value.Values[0].(string)
		return uuid, nil
	}
}

func (db *database) AddCluster(ctx context.Context, howMany int, courseNames []string) (string, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	uuid, err := neo4j.ExecuteRead(ctx, session, findClusterWithOnlyCoursesTxFunc(ctx, howMany, courseNames))
	if err != nil {
		return "", err
	}
	if uuid != "" {
		return uuid, nil
	}

	uuid, err = neo4j.ExecuteWrite(ctx, session, addClusterTxFunc(ctx, howMany, courseNames))
	if err != nil {
		return "", err
	}
	return uuid, nil
}

func addRequiresTxFunc(ctx context.Context, source, target, grade string) neo4j.ManagedTransactionWorkT[neo4j.ResultSummary] {
	if source == target {
		panic("addRequiresTxFunc: source should not equal target")
	}

	const query = `
		MATCH (source:Main WHERE source.name =~ $source), (target:Main WHERE target.name =~ $target)
		MERGE (source)-[:REQUIRES {grade: $grade}]->(target)
	    RETURN source.name
	    LIMIT 1
	`

	return func(tx neo4j.ManagedTransaction) (neo4j.ResultSummary, error) {
		result, err := tx.Run(ctx, query, map[string]any{
			"source": source,
			"target": target,
			"grade":  grade,
		})
		if err != nil {
			return nil, err
		}

		return result.Consume(ctx)
	}
}

func (db *database) AddRequires(ctx context.Context, source, target, grade string) error {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	// Nothing happens if source is target: self-dependency is a circular
	// dependency, therefore it's treated as a no-op.
	if source == target {
		// TODO setup logging and bark at whoever thought making passing in
		// self-dependencies was a good idea.

		return nil
	}

	summary, err := neo4j.ExecuteWrite(ctx, session, addRequiresTxFunc(ctx, source, target, grade))
	db.logger.Trace().Interface("summary", summary).Msgf("")
	return err
}

func (db *database) MakeOr(ctx context.Context) (string, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	return neo4j.ExecuteWrite(ctx, session, func(tx neo4j.ManagedTransaction) (string, error) {
		const query = `
			CREATE (n:Cluster:Main {name: randomUUID(), howMany: -1})
			RETURN n.name
		`
		result, err := tx.Run(ctx, query, nil)
		if err != nil {
			return "", err
		}

		value, err := result.Single(ctx)
		if err != nil {
			return "", err
		}

		return value.Values[0].(string), nil
	})
}

func (db *database) CourseSummaries(ctx context.Context) ([]types.Summary, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	return neo4j.ExecuteWrite(ctx, session, func(tx neo4j.ManagedTransaction) ([]types.Summary, error) {
		const query = `
			MATCH (n:Course)
			RETURN n.name as code, n.title as title
		`
		result, err := tx.Run(ctx, query, nil)
		if err != nil {
			return nil, err
		}

		var summaries []types.Summary
		for result.Next(ctx) {
			value := result.Record().AsMap()
			summaries = append(summaries, types.Summary{
				Code:  value["code"].(string),
				Title: value["title"].(string),
			})
		}

		if err = result.Err(); err != nil {
			return nil, err
		}

		return summaries, nil
	})
}

func (db *database) CourseDetail(ctx context.Context, code string) (types.Detail, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	db.logger.Debug().Str("Code", code).Str("Function", "CourseDetail").Msg("")

	detail, err := neo4j.ExecuteWrite(ctx, session, func(tx neo4j.ManagedTransaction) (types.Detail, error) {
		const query = `
			MATCH (n:Course {name: $name})-[:IN_DEPARTMENT]->(department:Department)
			RETURN n, department.name as department
		`
		result, err := tx.Run(ctx, query, map[string]any{
			"name": code,
		})
		if err != nil {
			return types.Detail{}, err
		}

		value, err := result.Single(ctx)
		if err != nil {
			return types.Detail{}, err
		}

		node := value.Values[0].(neo4j.Node)
		props := node.Props

		department := value.Values[1].(string)

		var semesters []string
		for _, semester := range props["semester"].([]any) {
			semesters = append(semesters, semester.(string))
		}

		return types.Detail{
			Preclusion:   props["preclusion"].(string),
			Prerequisite: props["prerequisite"].(string),
			Description:  props["description"].(string),
			Title:        props["title"].(string),
			Department:   department,
			Faculty:      props["faculty"].(string),
			Code:         code,
			Credit:       props["credit"].(string),
			Semesters:    semesters,
		}, nil
	})
	if err != nil {
		return types.Detail{}, err
	}

	return detail, nil
}

func (db *database) Departments(ctx context.Context) ([]string, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	return neo4j.ExecuteRead(ctx, session, func(tx neo4j.ManagedTransaction) ([]string, error) {
		const query = `
		    MATCH (department:Department)
		    RETURN department.name as names
		`

		result, err := tx.Run(ctx, query, nil)
		if err != nil {
			return nil, err
		}

		var names []string
		for result.Next(ctx) {
			name := result.Record().Values[0].(string)
			names = append(names, name)
		}

		if err = result.Err(); err != nil {
			return nil, err
		}

		return names, nil
	})
}

func (db *database) ExpandNode(ctx context.Context, neighbors types.NodeNeighbors) (types.Graph, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	return neo4j.ExecuteRead(ctx, session, findNeighborsTxFunc(ctx, neighbors))
}

func findNeighborsTxFunc(ctx context.Context, neighbors types.NodeNeighbors) neo4j.ManagedTransactionWorkT[types.Graph] {
	return func(tx neo4j.ManagedTransaction) (types.Graph, error) {
		const query = `
			MATCH (:Main {name: $name})-[r:REQUIRES]-(cluster:Cluster)
			WHERE NOT cluster.name IN $neighbors
			RETURN startNode(r).name AS target, endNode(r).name AS source, cluster.name AS name, "" AS department, true AS cluster, false AS indirect
			UNION
			MATCH (:Main {name: $name})-[r:REQUIRES]-(course:Course)-[:IN_DEPARTMENT]->(dep:Department)
			WHERE NOT course.name IN $neighbors
			RETURN startNode(r).name AS target, endNode(r).name AS source, course.name AS name, dep.name AS department, false AS cluster, false AS indirect
		`

		result, err := tx.Run(ctx, query, map[string]any{
			"name":      neighbors.Name,
			"neighbors": neighbors.Neighbors,
		})
		if err != nil {
			return types.Graph{}, err
		}

		graph := types.Graph{}
		for result.Next(ctx) {
			value := result.Record().AsMap()

			graph.Links = append(graph.Links, types.Link{
				SourceName: value["source"].(string),
				TargetName: value["target"].(string),
			})

			graph.Nodes = append(graph.Nodes, types.Node{
				Name:       value["name"].(string),
				Department: value["department"].(string),
				IsCluster:  value["cluster"].(bool),
				Indirect:   value["indirect"].(bool),
			})
		}

		if err = result.Err(); err != nil {
			return types.Graph{}, err
		}

		return graph, nil
	}
}
