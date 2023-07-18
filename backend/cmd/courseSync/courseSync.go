package main

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/miffi/nautilus/backend/cmd/api/types"
	"github.com/miffi/nautilus/backend/cmd/db"
	"github.com/rs/zerolog"
	"golang.org/x/time/rate"
)

func main() {
	logger := zerolog.New(os.Stdout)

	neo4jPassword := os.Getenv("NEO4JPASSWORD")
	if neo4jPassword == "" {
		logger.Error().Err(errors.New("getConfigs: NEO4JPASSWORD environment variable not found")).Msg("")
	}

	dbURI := "neo4j+s://a7d269fe.databases.neo4j.io"
	db, err := db.NewDb(dbURI, "neo4j", neo4jPassword, logger)
	if err != nil {
		logger.Fatal().Err(err).Msg("")
	}

	/* directory := "/home/max/dev/nautilus/backend/cmd/rule/testData/"

	parser := rule.NewParser()
	entries, err := os.ReadDir(directory)
	if err != nil {
		logger.Fatal().Err(err).Msg("")
	}

	for _, file := range entries {
		courseCode := file.Name()
		logger := logger.With().Str("CourseCode", courseCode).Logger()
		fileName := directory + courseCode

		file, err := os.Open(fileName)
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}

		output, err := parser.Parse(fileName, file)
		if err != nil {
			logger.Error().Err(err).Msg("")
			continue
		}

		err = (*output).UpdateDb(context.TODO(), db, courseCode)
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}

		logger.Info().Msg("")
	} */

	ratelimit := rate.NewLimiter(rate.Every(2*time.Second), 4)

	summaries, err := getCourseSummaries("2022-2023")
	if err != nil {
		logger.Fatal().Err(err).Msg("")
	}

	for _, summary := range summaries {
		err := ratelimit.Wait(context.TODO())
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}
		details, err := getCourseDetails("2022-2023", summary.Code)
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}

		err = db.AddCourse(context.TODO(), convertNUSModsDetailsToCourse(details))
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}

		logger.Info().Str("Course", details.CourseCode).Msg("")
	}
}

func convertNUSModsDetailsToCourse(details courseDetails) types.Course {
	var semesters []string
	for _, semester := range details.SemesterData {
		semesters = append(semesters, parseSemester(semester.Number))
	}

	return types.Course{
		Preclusion:   details.Preclusion,
		Prerequisite: details.Prerequisite,
		Description:  details.Description,
		Title:        details.Title,
		Department:   details.Department,
		Faculty:      details.Faculty,
		Code:         details.CourseCode,
		Credit:       details.CourseCredit,
		Semesters:    semesters,
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
