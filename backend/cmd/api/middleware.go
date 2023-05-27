package main

import (
	"fmt"
	"net/http"
)

func (app *application) enableCORS(next http.Handler) http.Handler {
	origin := "https://nautilus-delta.vercel.app"
	if app.config.localCORS {
		origin = fmt.Sprintf(`http://localhost:%d`, app.config.localCORSPort)
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)

		next.ServeHTTP(w, r)
	})
}
