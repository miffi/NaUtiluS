package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// Supplier of all the routes of the web server.
func (app *application) routes() http.Handler {
	router := httprouter.New()

	router.HandlerFunc(http.MethodGet, "/v1/fullGraph.json", app.fullGraph)

	return router
}
