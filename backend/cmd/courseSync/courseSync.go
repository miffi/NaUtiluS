package main

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/miffi/nautilus/backend/cmd/db"
	"github.com/rs/zerolog"
	"golang.org/x/time/rate"
)

func main() {
	logger := zerolog.New(os.Stdout)

	query := NewNUSModsQuery(logger)

	ratelimit := rate.NewLimiter(rate.Every(time.Second), 2)

	neo4jPassword := os.Getenv("NEO4JPASSWORD")
	if neo4jPassword == "" {
		logger.Error().Err(errors.New("getConfigs: NEO4JPASSWORD environment variable not found")).Msg("")
	}

	dbURI := "neo4j+s://a7d269fe.databases.neo4j.io"
	dbmodify, err := db.CreateDbModify(dbURI, "neo4j", neo4jPassword, logger)
	if err != nil {
		logger.Fatal().Err(err).Msg("")
	}
	_ = dbmodify

	summaries, err := query.GetCourseSummaries("2022-2023")
	if err != nil {
		logger.Fatal().Err(err).Msg("")
	}

	for _, summary := range summaries {
		err := ratelimit.Wait(context.TODO())
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}
		details, err := query.GetCourseDetails("2022-2023", summary.Code)
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}

		err = dbmodify.AddCourse(context.TODO(), details)
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}

		logger.Info().Str("Course", details.CourseCode).Msg("")
	}
}
