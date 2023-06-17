package db

import (
	"context"

	"github.com/miffi/nautilus/backend/cmd/types"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/rs/zerolog"
)

type DbQuery interface {
	QueryFullGraph(ctx context.Context) (Graph, error)
	Close(ctx context.Context) error
}

type query struct {
	driver neo4j.DriverWithContext
	logger zerolog.Logger
}

type FilterOptions struct {
	Departments []string `json:"departments,omitempty"`
	Courses     []string `json:"courses,omitempty"`
	Semester    string   `json:"semester,omitempty"`
}

type Graph struct {
	Nodes []types.Node `json:"nodes"`
	Links []types.Link `json:"links"`
}

func NewDbQuery(uri, username, password string, logger zerolog.Logger) (DbQuery, error) {
	auth := neo4j.BasicAuth(username, password, "")

	var db query
	var err error
	db.driver, err = neo4j.NewDriverWithContext(uri, auth)
	db.logger = logger.With().Str("component", "DbQuery").Logger()

	db.logger.Info().Msgf("Started DbQuery to address %s", uri)

	return &db, err
}

func (db *query) Close(ctx context.Context) error {
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
			MATCH (n:Cluster|Course)
			OPTIONAL MATCH (n)-[:IN_DEPARTMENT]->(department)
			RETURN n.name AS name, coalesce(department.name, "") AS department, 'Cluster' IN LABELS(n) AS cluster
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

func (db *query) QueryFullGraph(ctx context.Context) (Graph, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	var graph Graph

	nodes, err := neo4j.ExecuteRead[[]types.Node](ctx, session, getNodesTxFunc(ctx))
	if err != nil {
		return graph, err
	}

	links, err := neo4j.ExecuteRead[[]types.Link](ctx, session, getLinksTxFunc(ctx))
	if err != nil {
		return graph, err
	}

	graph = Graph{
		Nodes: nodes,
		Links: links,
	}

	return graph, nil
}
