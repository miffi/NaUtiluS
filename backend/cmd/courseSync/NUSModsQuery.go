package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"

	"github.com/miffi/nautilus/backend/cmd/api/types"
	"github.com/rs/zerolog"
)

const apiEndPoint = "https://api.nusmods.com/v2"

var (
	ErrEndpointNotFound = errors.New("date range not found in api")
	ErrInvalidYearRange = errors.New("invalid date range format")
)

type NUSModsQuery interface {
	GetCourseSummaries(yearRange string) ([]types.CourseSummary, error)
	GetCourseDetails(yearRange, courseCode string) (types.CourseDetails, error)
}

func NewNUSModsQuery(logger zerolog.Logger) NUSModsQuery {
	return &nusModsQuery{logger: logger}
}

type nusModsQuery struct {
	logger zerolog.Logger
}

var dateRegex = regexp.MustCompile(`^\d{4}-\d{4}$`)

func isYearRangeInvalid(yearRange string) bool {
	return !dateRegex.MatchString(yearRange)
}

func (query *nusModsQuery) GetCourseDetails(yearRange string, courseCode string) (details types.CourseDetails, err error) {
	if isYearRangeInvalid(yearRange) {
		err = ErrInvalidYearRange
		return
	}

	uri := fmt.Sprintf(apiEndPoint+"/%s/modules/%s.json", yearRange, courseCode)
	dataReader, err := getHttpResponseBody(uri)
	if err != nil {
		return
	}

	err = json.NewDecoder(dataReader).Decode(&details)
	return
}

func (query *nusModsQuery) GetCourseSummaries(yearRange string) (summaries []types.CourseSummary, err error) {
	if isYearRangeInvalid(yearRange) {
		return nil, ErrInvalidYearRange
	}

	uri := fmt.Sprintf(apiEndPoint+"/%s/moduleList.json", yearRange)
	dataReader, err := getHttpResponseBody(uri)
	if err != nil {
		return nil, err
	}

	err = json.NewDecoder(dataReader).Decode(&summaries)
	return
}

func getHttpResponseBody(uri string) (io.Reader, error) {
	response, err := http.Get(uri)
	if err != nil {
		return nil, err
	}
	if response.StatusCode == http.StatusNotFound {
		return nil, ErrEndpointNotFound
	}
	return response.Body, err
}
