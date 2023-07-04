package db

import "github.com/neo4j/neo4j-go-driver/v5/neo4j"

func getNeo4jDriver(uri, username, password string) (neo4j.DriverWithContext, error) {
	auth := neo4j.BasicAuth(username, password, "")
	return neo4j.NewDriverWithContext(uri, auth)
}
