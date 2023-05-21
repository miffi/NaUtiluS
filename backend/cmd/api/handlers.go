package main

import "net/http"

func (app *application) fullGraph(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello, world!"))
}
