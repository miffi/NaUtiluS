package main

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
	"github.com/miffi/nautilus/backend/cmd/api/types"
)

func (app *application) fullGraph(w http.ResponseWriter, r *http.Request) {
	data, err := app.dbquery.QueryFullGraph(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}

	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) filterPost(w http.ResponseWriter, r *http.Request) {
	var options types.FilterOptions
	err := json.NewDecoder(r.Body).Decode(&options)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	graph, err := app.dbquery.Filter(r.Context(), options)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, graph, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) courseSummary(w http.ResponseWriter, r *http.Request) {
	data, err := app.dbquery.CourseSummaries(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}

	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) courseDetail(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	code := strings.TrimSuffix(params.ByName("code"), ".json")
	course, err := app.dbquery.CourseDetail(r.Context(), code)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, course, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) departments(w http.ResponseWriter, r *http.Request) {
	departments, err := app.dbquery.Departments(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, departments, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) expandNode(w http.ResponseWriter, r *http.Request) {
	var neighbors types.NodeNeighbors
	err := json.NewDecoder(r.Body).Decode(&neighbors)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	diff, err := app.dbquery.ExpandNode(r.Context(), neighbors)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, diff, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
