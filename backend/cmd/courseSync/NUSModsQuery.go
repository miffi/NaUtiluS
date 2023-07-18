package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
)

const apiEndPoint = "https://api.nusmods.com/v2"

var (
	ErrEndpointNotFound = errors.New("date range not found in api")
	ErrInvalidYearRange = errors.New("invalid date range format")
)

type courseDetails struct {
	Preclusion   string `json:"preclusion"`
	Prerequisite string `json:"prerequisite"`

	Description string `json:"description"`

	Title      string `json:"title"`
	Department string `json:"department"`
	Faculty    string `json:"faculty"`

	CourseCode   string `json:"moduleCode"`
	CourseCredit string `json:"moduleCredit"`

	SemesterData []struct {
		Number int `json:"semester"`
	} `json:"semesterData"`

	PrerequisiteRule string `json:"prerequisiteRule"`
	PreclusionRule   string `json:"preclusionRule"`
	CorequisiteRule  string `json:"courequisiteRule"`
}

type courseSummary struct {
	Code      string `json:"moduleCode"`
	Title     string `json:"title"`
	Semesters []int  `json:"semesters"`
}

var dateRegex = regexp.MustCompile(`^\d{4}-\d{4}$`)

func isYearRangeInvalid(yearRange string) bool {
	return !dateRegex.MatchString(yearRange)
}

func getCourseDetails(yearRange string, courseCode string) (details courseDetails, err error) {
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

func getCourseSummaries(yearRange string) (summaries []courseSummary, err error) {
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
