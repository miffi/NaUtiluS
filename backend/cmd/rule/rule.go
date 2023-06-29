package rule

import (
	"context"
	"strings"

	"github.com/miffi/nautilus/backend/cmd/db"
)

type Rule interface {
	UpdateDb(ctx context.Context, database db.Db, sourceName string) error
}

func (types ProgramTypes) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	return types.Then.UpdateDb(ctx, database, sourceName)
}

func (Programs) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	return nil
}

func (courses Courses) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	onlyCourse := len(courses.CourseData) == 1 &&
		!strings.ContainsRune(string(courses.CourseData[0].Code), '*')
	if courses.Num != nil && !onlyCourse {
		var courseCodes []string = nil
		for _, course := range courses.CourseData {
			courseCodes = append(courseCodes, string(course.Code))
		}

		uuid, err := database.AddCluster(ctx, *courses.Num, courseCodes)
		if err != nil {
			return err
		}

		return database.AddRequires(ctx, sourceName, uuid, "")
	}

	for _, course := range courses.CourseData {
		err := database.AddRequires(ctx, sourceName, string(course.Code), course.Grade)
		if err != nil {
			return err
		}
	}

	return nil
}

func (Subjects) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	return nil
}

func (Special) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	return nil
}

func (cohort CohortYears) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	if cohort.Rule == nil {
		return nil
	}

	return (*cohort.Rule).UpdateDb(ctx, database, sourceName)
}

func (GPA) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	return nil
}

func (Units) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	return nil
}

func (and And) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	for _, branch := range and.Branches {
		err := branch.(Rule).UpdateDb(ctx, database, sourceName)
		if err != nil {
			return err
		}
	}
	return nil
}

func (or Or) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	panic("unimplemented")
	for _, branch := range or.Branches {
		err := branch.(Rule).UpdateDb(ctx, database, sourceName)
		if err != nil {
			return err
		}
	}
	return nil
}

func (paren Paren) UpdateDb(ctx context.Context, database db.Db, sourceName string) error {
	return paren.Body.UpdateDb(ctx, database, sourceName)
}
