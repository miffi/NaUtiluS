package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/miffi/nautilus/backend/cmd/db"
)

const APP_NAME = "nautilus-backend"

type config struct {
	port          int
	neo4jPassword string
	localCORS     bool
	localCORSPort int
}

// A store of the application wide state of the web server.
type application struct {
	config  config
	logger  *log.Logger
	dbquery db.DbQuery
}

func main() {
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	config, err := getConfigs()
	if err != nil {
		logger.Fatal(err)
	}

	dbURI := "neo4j+s://a7d269fe.databases.neo4j.io"
	dbquery, err := db.NewDbQuery(dbURI, "neo4j", config.neo4jPassword)
	if err != nil {
		logger.Fatal(err)
	}

	defer func() {
		logger.Fatal(dbquery.Close(context.TODO()))
	}()

	app := &application{
		config,
		logger,
		dbquery,
	}

	router := app.routes()

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", config.port),
		Handler:      router,
		IdleTimeout:  time.Minute,
		ReadTimeout:  time.Second * 10,
		WriteTimeout: time.Second * 10,
	}

	logger.Printf("starting %s server on %s", APP_NAME, server.Addr)
	err = server.ListenAndServe()
	if err != nil {
		logger.Fatal(err)
	}
}

func getConfigs() (cfg config, err error) {
	flag.BoolVar(&cfg.localCORS, "localCORS", false, "Enable localhost CORS (for debugging)")
	flag.IntVar(&cfg.localCORSPort, "localCORSPort", 3000, "Port for the localhost CORS")
	flag.Parse()

	if portEnv := os.Getenv("PORT"); portEnv == "" {
		cfg.port = 8080
	} else {
		cfg.port, err = strconv.Atoi(portEnv)
		if err != nil {
			return
		}
	}

	neo4jPassword := os.Getenv("NEO4JPASSWORD")
	if neo4jPassword == "" {
		err = errors.New("getConfigs: NEO4JPASSWORD environment variable not found")
		return
	}
	cfg.neo4jPassword = neo4jPassword

	return
}
