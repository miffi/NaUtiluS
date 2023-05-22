package main

import "net/http"

func (app *application) enableCORS(next http.Handler) http.Handler {
	origin := "https://nautilus-delta.vercel.app/"
	if app.config.localCORS {
		origin = "localhost:3000"
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)

		next.ServeHTTP(w, r)
	})
}
