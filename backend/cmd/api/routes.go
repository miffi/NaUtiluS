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
	router.HandlerFunc(http.MethodGet, "/v1/courseSummary.json", app.courseSummary)
	// The route here is actuall /v1/course/{code}.json, but the library
	// doesn't seem to handle that. It's handled manually.
	router.HandlerFunc(http.MethodGet, "/v1/course/:code", app.courseDetail)
	router.HandlerFunc(http.MethodGet, "/v1/departments.json", app.departments)
	router.HandlerFunc(http.MethodPost, "/v1/expandNode.json", app.expandNode)

	return app.recoverPanic(app.enableCORS(router))
}
