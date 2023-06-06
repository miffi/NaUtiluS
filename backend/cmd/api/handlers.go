package main

import "net/http"

func (app *application) fullGraph(w http.ResponseWriter, r *http.Request) {
	data, err := app.dbinterface.QueryFullGraph(r.Context())
	if err != nil {
		app.serverError(w, err)
	}

	err = app.writeJSON(w, http.StatusOK, data, nil)
	if err != nil {
		app.serverError(w, err)
	}
}
