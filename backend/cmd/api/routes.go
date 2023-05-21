package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// Supplier of all the routes of the web server.
func (app *application) routes() http.Handler {
	router := httprouter.New()

	router.HandlerFunc(http.MethodGet, "/fullGraph", app.fullGraph)

	return router
}
