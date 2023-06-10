package db

import (
	"context"
	"errors"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/miffi/nautilus/backend/cmd/types"
)

type DbInterface struct {
	driver neo4j.DriverWithContext
}

type FilterOptions struct {
	Departments []string `json:"departments,omitempty"`
	Courses []string `json:"courses,omitempty"`
	Semester string `json:"semester,omitempty"`
}

type Graph struct {
	nodes []types.Node
	links []types.Link
}

func NewDbInterface(uri, username, password string) (db DbInterface, err error) {
	auth := neo4j.BasicAuth(username, password, "")
	db.driver, err = neo4j.NewDriverWithContext(uri, auth)

	return
}

func (db *DbInterface) Close(ctx context.Context) error {
	return db.driver.Close(ctx)
}

func (db *DbInterface) QueryFullGraph(ctx context.Context) (map[string]any, error) {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	enc, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (ans any, err error) {
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
						department: nDepartment.name
					}),
					collect({
						id: p.name,
						cluster: "Cluster" in labels(p),
						department: pDepartment.name
					})
				) AS nodes
			RETURN nodes, links
		`
		result, err := tx.Run(ctx, readGraph, nil)
		if err != nil {
			return
		}

		if result.Next(ctx) {
			ans = map[string]any{"nodes": result.Record().Values[0], "links": result.Record().Values[1]}
			if result.Next(ctx) {
				err = errors.New("QueryFullGraph: Got more than one result for query")
				return
			}
		}

		err = result.Err()
		return
	})

	return enc.(map[string]any), err
}
