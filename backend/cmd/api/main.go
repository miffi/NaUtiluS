package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

const APP_NAME = "nautilus-backend"

type config struct {
	port          int
	neo4jPassword string
}

// A store of the application wide state of the web server.
type application struct {
	config config
	logger *log.Logger
}

func main() {
	config, err := getConfigs()
	if err != nil {
		log.Fatal(err)
	}

	logger := log.New(os.Stdout, "", log.Ldate | log.Ltime)

	app := &application{
		config,
		logger,
	}

	router := app.routes()

	server := &http.Server{
		Addr: fmt.Sprintf(":%d", config.port),
		Handler: router,
		IdleTimeout: time.Minute,
		ReadTimeout: time.Second * 10,
		WriteTimeout: time.Second * 10,
	}

	logger.Printf("starting %s server on %s", APP_NAME, server.Addr)
	err = server.ListenAndServe()
	logger.Fatal(err)
}

func getConfigs() (cfg config, err error) {
	var port int

	portEnv := os.Getenv("PORT")
	if portEnv == "" {
		port = 8080
	} else {
		port, err = strconv.Atoi(portEnv)

		if err != nil {
			return cfg, err
		}
	}

	neo4jPassword := os.Getenv("NEO4JPASSWORD")
	if neo4jPassword == "" {
		return cfg, errors.New("getConfigs: NEO4JPASSWORD environment variable not found")
	}

	return config{
		port,
		neo4jPassword,
	}, nil
}
