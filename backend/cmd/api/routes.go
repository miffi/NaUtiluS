package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// Supplier of all the routes of the web server.
func (app *application) routes() http.Handler {
	router := httprouter.New()

	router.HandlerFunc(http.MethodGet, "/v1/fullGraph.json", app.fullGraph)
	router.HandlerFunc(http.MethodPost, "/v1/filter.json", app.filterPost)

	return app.recoverPanic(app.enableCORS(router))
}
