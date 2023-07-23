package main

import (
	"fmt"
	"net/http"
)

func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", app.CORSAddress)

		next.ServeHTTP(w, r)
	})
}

func (app *application) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Create a defer function, which will always run regardless of there
		// being a panic or not.
		defer func() {
			if err := recover(); err != nil {
				w.Header().Set("Connection", "close")

				// Recover returns an `any` instead of an `error`, so we
				// normalize it with Errorf
				app.serverErrorResponse(w, r, fmt.Errorf("%s", err))
			}
		}()

		next.ServeHTTP(w, r)
	})
}
