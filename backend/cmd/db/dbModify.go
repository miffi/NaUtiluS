package db

import (
	"context"

	"github.com/miffi/nautilus/backend/cmd/types"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/rs/zerolog"
)

type DbModify interface {
	AddCourse(ctx context.Context, details types.CourseDetails) error
}

type modify struct {
	driver neo4j.DriverWithContext
	logger zerolog.Logger
}

func CreateDbModify(uri, username, password string, logger zerolog.Logger) (DbModify, error) {
	var db modify
	var err error
	db.driver, err = getNeo4jDriver(uri, username, password)
	db.logger = logger.With().Str("component", "DbModify").Logger()

	return &db, err
}

const courseAddQuery = `MERGE (course:Course {name: $name})
	MERGE (department:Department {name: $department})
	MERGE (course)-[:IN_DEPARTMENT]->(department)
	RETURN course.name
`

func addCourseTxFunc(ctx context.Context, details types.CourseDetails) neo4j.ManagedTransactionWork {
	return func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx, courseAddQuery,
			map[string]any{
				"name":       details.CourseCode,
				"department": details.Department,
			})
		if err != nil {
			return nil, err
		}
		return result.Consume(ctx)
	}
}

func (db *modify) AddCourse(ctx context.Context, details types.CourseDetails) error {
	session := db.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, addCourseTxFunc(ctx, details))
	return err
}
