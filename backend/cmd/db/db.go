package db

import (
	"context"
	"log"

	"github.com/miffi/nautilus/backend/cmd/types"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type DbQuery interface {
	QueryFullGraph(ctx context.Context) (Graph, error)
	Close(ctx context.Context) error
}

type query struct {
	driver neo4j.DriverWithContext
	logger *log.Logger
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

func NewDbQuery(uri, username, password string, logger *log.Logger) (DbQuery, error) {
	auth := neo4j.BasicAuth(username, password, "")

	var db query
	var err error
	db.driver, err = neo4j.NewDriverWithContext(uri, auth)
	db.logger = logger

	return &db, err
}

func (db *query) Close(ctx context.Context) error {
	return db.driver.Close(ctx)
}

func (db *query) QueryFullGraph(ctx context.Context) (Graph, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	fullGraphTxFunc := func(tx neo4j.ManagedTransaction) (graph Graph, err error) {
		readGraph := `
			MATCH (n:Cluster|Course)<-[:REQUIRES]-(p:Course|Cluster)
			OPTIONAL MATCH (nDepartment:Department)<-[:IN_DEPARTMENT]-(n)
			OPTIONAL MATCH (pDepartment:Department)<-[:IN_DEPARTMENT]-(p)
			WITH
				collect(DISTINCT {source: n.name, target: p.name}) AS links,
				apoc.coll.union(
					collect({
						id: n.name,
						cluster: "Cluster" in labels(n),
						department: coalesce(nDepartment.name, "")
					}),
					collect({
						id: p.name,
						cluster: "Cluster" in labels(p),
						department: coalesce(pDepartment.name, "")
					})
				) AS nodes
			RETURN nodes, links
		`

		result, err := tx.Run(ctx, readGraph, nil)
		if err != nil {
			return graph, err
		}

		record, err := result.Single(ctx)
		if err != nil {
			return graph, err
		}

		data := record.AsMap()
		nodes := makeNodes(data["nodes"])
		links := makeLinks(data["links"])

		graph.Nodes = nodes
		graph.Links = links

		return
	}

	return neo4j.ExecuteRead(ctx, session, fullGraphTxFunc)
}

func makeNodes(data any) []types.Node {
	nodeInfo := data.([]any)
	nodes := make([]types.Node, len(nodeInfo))

	for i, info := range nodeInfo {
		coercedInfo := info.(map[string]any)
		var node types.Node
		node.Name = coercedInfo["id"].(string)
		node.IsCluster = coercedInfo["cluster"].(bool)
		node.Department = coercedInfo["department"].(string)

		nodes[i] = node
	}

	return nodes
}

func makeLinks(data any) []types.Link {
	linkInfo := data.([]any)
	links := make([]types.Link, len(linkInfo))

	for i, info := range linkInfo {
		coercedInfo := info.(map[string]any)
		var link types.Link
		link.FromName = coercedInfo["source"].(string)
		link.ToName = coercedInfo["target"].(string)

		links[i] = link
	}

	return links
}
