package main

import (
	"encoding/json"
	"net/http"

	"github.com/miffi/nautilus/backend/cmd/api/types"
)

func (app *application) fullGraph(w http.ResponseWriter, r *http.Request) {
	data, err := app.dbquery.QueryFullGraph(r.Context())
	if err != nil {
		app.serverError(w, err)
	}

	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverError(w, err)
	}
}

func (app *application) filterPost(w http.ResponseWriter, r *http.Request) {
	var options types.FilterOptions
	err := json.NewDecoder(r.Body).Decode(&options)
	if err != nil {
		app.clientError(w, http.StatusBadRequest)
	}
	// TODO Write actual filtering logic
	err = app.writeJSON(w, http.StatusOK, nil, nil)
	if err != nil {
		app.serverError(w, err)
	}
}
