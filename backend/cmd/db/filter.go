package db

import (
	"context"
	"fmt"
	"strings"

	"github.com/miffi/nautilus/backend/cmd/api/types"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func (db *database) Filter(ctx context.Context, options types.FilterOptions) (types.Graph, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	nodes, err := neo4j.ExecuteRead(ctx, session, filterNodesTxFunc(ctx, options))
	if err != nil {
		return types.Graph{}, err
	}

	var names []string
	for _, node := range nodes {
		names = append(names, node.Name)
	}

	links, err := neo4j.ExecuteRead(ctx, session, filterLinksTxFunc(ctx, names))
	if err != nil {
		return types.Graph{}, err
	}

	return types.Graph{Nodes: nodes, Links: links}, err
}

func filterNodesTxFunc(ctx context.Context, options types.FilterOptions) neo4j.ManagedTransactionWorkT[[]types.Node] {
	return func(tx neo4j.ManagedTransaction) ([]types.Node, error) {
		result, err := tx.Run(ctx, buildFilterQuery(options), map[string]any{
			"names":       options.Courses,
			"departments": options.Departments,
			"semester":    options.Semester,
		})
		if err != nil {
			return nil, err
		}

		var nodes []types.Node
		for result.Next(ctx) {
			value := result.Record().AsMap()
			nodes = append(nodes, types.Node{
				Name:       value["name"].(string),
				Department: value["department"].(string),
				IsCluster:  value["cluster"].(bool),
				Indirect:   value["indirect"].(bool),
			})
		}

		if err = result.Err(); err != nil {
			return nil, err
		}

		return nodes, nil
	}
}

func buildFilterQuery(options types.FilterOptions) string {
	hasDepartments := options.Departments != nil && len(options.Departments) != 0
	hasCourses := options.Courses != nil && len(options.Courses) != 0
	limit := options.Limit

	var sb strings.Builder
	if hasCourses {
		sb.WriteString(`UNWIND $names AS courseName
MATCH (:Course {name: courseName})`)
		requiresClause(&sb, limit)
		sb.WriteString("(course:Course)")
		departmentClause(&sb, hasDepartments)

		sb.WriteString(`RETURN DISTINCT course.name as name,
	dep.name as department,
	false as cluster,
	NOT $semester IN course.semester AS indirect
`)
		sb.WriteString(`UNION
UNWIND $names AS courseName
MATCH (:Course {name: courseName})`)
		requiresClause(&sb, limit)

		sb.WriteString("(cluster:Cluster)<-[:REQUIRES*]-(:Course)")
		departmentClause(&sb, hasDepartments)
		sb.WriteString(`RETURN DISTINCT cluster.name AS name,
	"" AS department,
	true AS cluster,
	false AS indirect`)

		sb.WriteString(`
UNION
UNWIND $names AS courseName
MATCH (course:Course {name: courseName})`)
		departmentClause(&sb, hasDepartments)

		sb.WriteString(`RETURN DISTINCT course.name AS name,
	dep.name AS department,
	false AS cluster,
	NOT $semester IN course.semester AS indirect
`)

	} else if hasDepartments {
		sb.WriteString(`MATCH (course:Course)`)

		departmentClause(&sb, hasDepartments)

		sb.WriteString(`RETURN course.name AS name,
	dep.name AS department,
	false AS cluster,
	NOT $semester IN course.semester AS indirect
UNION
MATCH (cluster:Cluster)-[:REQUIRES]-(:Course)`)

		departmentClause(&sb, hasDepartments)

		sb.WriteString(`RETURN cluster.name AS name, "" AS department, true AS cluster, false AS indirect`)
	}

	return sb.String()
}

func departmentClause(writer *strings.Builder, hasDepartments bool) {
	writer.WriteString("-[:IN_DEPARTMENT]->(dep:Department")
	if hasDepartments {
		writer.WriteString(" WHERE dep.name IN $departments")
	}
	writer.WriteString(")\n")
}

func requiresClause(writer *strings.Builder, limit int) {
	writer.WriteString("<-[:REQUIRES")
	if limit == 0 {
		writer.WriteRune('*')
	} else {
		fmt.Fprintf(writer, "*..%d", limit)
	}
	writer.WriteString("]-")
}

func filterLinksTxFunc(ctx context.Context, nodeNames []string) neo4j.ManagedTransactionWorkT[[]types.Link] {
	const query = `
		WITH $names as names
		MATCH (start:Main WHERE start.name IN names)-[r:REQUIRES]-(end:Main WHERE end.name IN names)
		RETURN startnode(r).name as target, endnode(r).name as source
	`

	return func(tx neo4j.ManagedTransaction) ([]types.Link, error) {
		result, err := tx.Run(ctx, query, map[string]any{
			"names": nodeNames,
		})
		if err != nil {
			return nil, err
		}

		var links []types.Link
		for result.Next(ctx) {
			value := result.Record().AsMap()
			links = append(links, types.Link{
				SourceName: value["source"].(string),
				TargetName: value["target"].(string),
			})
		}

		if err = result.Err(); err != nil {
			return nil, err
		}

		return links, nil
	}
}
