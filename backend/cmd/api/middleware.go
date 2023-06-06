package api

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

func (app *application) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Create a defer function, which will always run regardless of there
		// being a panic or not.

		defer func() {
			if err := recover(); err != nil {
				w.Header().Set("Connection", "close")

				app.serverError(w, fmt.Errorf("%s", err))
			}
		}()

		next.ServeHTTP(w, r)
	})
}
