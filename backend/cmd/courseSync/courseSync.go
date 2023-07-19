package main

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"time"

	"github.com/adrg/xdg"
	"github.com/miffi/nautilus/backend/cmd/db"
	"github.com/miffi/nautilus/backend/cmd/rule"
	"github.com/miffi/nautilus/backend/cmd/types"
	"github.com/rs/zerolog"
	"golang.org/x/time/rate"
)

type application struct {
	database  db.Db
	logger    zerolog.Logger
	ratelimit *rate.Limiter
}

func main() {
	logger := zerolog.New(os.Stdout)
	ruleDirectory := filepath.Join(xdg.RuntimeDir, "nautilus-course-sync")

	err := os.MkdirAll(ruleDirectory, 0o700)
	if err != nil {
		logger.Fatal().Err(err).Msg("")
	}

	neo4jPassword := os.Getenv("NEO4JPASSWORD")
	if neo4jPassword == "" {
		logger.Fatal().Err(errors.New("getConfigs: NEO4JPASSWORD environment variable not found")).Msg("")
	}

	dbURI := "neo4j+s://a7d269fe.databases.neo4j.io"
	database, err := db.NewDb(dbURI, "neo4j", neo4jPassword, logger)
	if err != nil {
		logger.Fatal().Err(err).Msg("")
	}

	ratelimit := rate.NewLimiter(rate.Every(2*time.Second), 4)

	app := application{
		database:  database,
		logger:    logger,
		ratelimit: ratelimit,
	}

	err = app.syncCourses("2022-2023", ruleDirectory)
	if err != nil {
		logger.Fatal().Err(err).Msg("")
	}

	err = app.syncPrerequisiteRules(ruleDirectory)
	if err != nil {
		logger.Fatal().Err(err).Msg("")
	}
}

func (app *application) syncCourses(cohort string, ruleDirectory string) error {
	summaries, err := getCourseSummaries(cohort)
	if err != nil {
		return err
	}

	for _, summary := range summaries {
		err := app.ratelimit.Wait(context.Background())
		if err != nil {
			return err
		}

		details, err := getCourseDetails("2022-2023", summary.Code)
		if err != nil {
			return err
		}

		err = app.database.AddCourse(context.TODO(), convertNUSModsDetailsToCourse(details))
		if err != nil {
			return err
		}

		err = writePrerequisiteRule(
			details.PrerequisiteRule,
			filepath.Join(ruleDirectory, details.CourseCode))
		if err != nil {
			return err
		}

		app.logger.Info().Str("Course", details.CourseCode).Msg("")
	}

	return nil
}

func writePrerequisiteRule(rule string, filename string) error {
	if rule == "" {
		return nil
	}
	return os.WriteFile(filename, []byte(rule), 0o600)
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

func (app *application) syncPrerequisiteRules(ruleDirectory string) error {
	parser := rule.NewParser()
	entries, err := os.ReadDir(ruleDirectory)
	if err != nil {
		return err
	}

	for _, file := range entries {
		err := app.ratelimit.Wait(context.Background())
		if err != nil {
			return err
		}

		courseCode := file.Name()
		logger := app.logger.With().Str("CourseCode", courseCode).Logger()
		fileName := filepath.Join(ruleDirectory, courseCode)

		file, err := os.Open(fileName)
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}

		output, err := parser.Parse(fileName, file)
		if err != nil {
			logger.Error().Err(err).Msg("")
			continue
		}

		err = (*output).UpdateDb(context.TODO(), app.database, courseCode)
		if err != nil {
			logger.Fatal().Err(err).Msg("")
		}

		app.logger.Info().Msg("")
	}
	return nil
}
