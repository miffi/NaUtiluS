package main

import "net/http"

const js = ` {
  "nodes": [
    {"id": "CS1101S", "group": 0},
    {"id": "CS2030S", "group": 0},
    {"id": "CS2040S", "group": 0},
    {"id": "CS3230", "group": 0},
    {"id": "CS1231S", "group": 0},
    {"id": "CS2109S", "group": 0},
    {"id": "CS2100", "group": 0},
    {"id": "CS2106", "group": 0},
    {"id": "CS4234", "group": 0},
    {"id": "MA1521", "group": 1},
    {"id": "ST2334", "group": 1},
    {"id": "MA2001", "group": 1},

    {"id": "MA1301", "group": 1},

    {"id": "CS1010S", "group": 0},
    {"id": "CS1010E", "group": 0},
    {"id": "CS1010X", "group": 0},
    {"id": "CS1010J", "group": 0},
    {"id": "CS1010C", "group": 0},
    {"id": "CS1010", "group": 0},

    {"id": "CS2040", "group": 0},
    {"id": "CS2040C", "group": 0},

    {"id": "CS2030", "group": 0},

    {"id": "MA1100", "group": 1},
    {"id": "MA1100T", "group": 1},
    {"id": "CS1231", "group": 0},

    {"id": "1010 cluster", "group": 2},
    {"id": "2030 cluster", "group": 2},
    {"id": "1231 cluster", "group": 2},
    {"id": "2040 cluster", "group": 2}
  ],

  "links": [
    { "source": "CS3230", "target": "CS4234", "preclusion": false },
    { "source": "MA2001", "target": "CS4234", "preclusion": false },
    { "source": "MA1521", "target": "ST2334", "preclusion": false },
    { "source": "1010 cluster", "target": "CS2030S", "preclusion": false },
    { "source": "1010 cluster", "target": "CS2030", "preclusion": false },
    { "source": "1010 cluster", "target": "CS2100", "preclusion": false },
    { "source": "1010 cluster", "target": "CS2040S", "preclusion": false },
    { "source": "1010 cluster", "target": "CS2040", "preclusion": false },
    { "source": "1010 cluster", "target": "CS2040C", "preclusion": false },
    { "source": "CS2100", "target": "CS2106", "preclusion": false },
    { "source": "2040 cluster", "target": "CS3230", "preclusion": false },
    { "source": "1231 cluster", "target": "CS2040S", "preclusion": false },
    { "source": "1231 cluster", "target": "CS2040C", "preclusion": false },
    { "source": "1231 cluster", "target": "CS2040", "preclusion": false },
    { "source": "1231 cluster", "target": "CS2109S", "preclusion": false },
    { "source": "2040 cluster", "target": "CS2109S", "preclusion": false },

    { "source": "CS2040S", "target": "2040 cluster", "preclusion": true },
    { "source": "CS2040C", "target": "2040 cluster", "preclusion": true },
    { "source": "CS2040", "target": "2040 cluster", "preclusion": true },
    
    { "source": "CS2030", "target": "2030 cluster", "preclusion": true },
    { "source": "CS2030S", "target": "2030 cluster", "preclusion": true },

    { "source": "CS1231S", "target": "1231 cluster", "preclusion": true },
    { "source": "CS1231", "target": "1231 cluster", "preclusion": true },
    { "source": "MA1100", "target": "1231 cluster", "preclusion": true },
    { "source": "MA1100T", "target": "1231 cluster", "preclusion": true },

    { "source": "MA1301", "target": "MA1100", "preclusion": false },
    { "source": "MA1301", "target": "MA1100T", "preclusion": false },
    { "source": "MA1301", "target": "CS1231S", "preclusion": false },
    { "source": "MA1301", "target": "CS1231", "preclusion": false },

    { "source": "CS1101S", "target": "1010 cluster", "preclusion": true },
    { "source": "CS1010S", "target": "1010 cluster", "preclusion": true },
    { "source": "CS1010X", "target": "1010 cluster", "preclusion": true },
    { "source": "CS1010J", "target": "1010 cluster", "preclusion": true },
    { "source": "CS1010E", "target": "1010 cluster", "preclusion": true },
    { "source": "CS1010C", "target": "1010 cluster", "preclusion": true },
    { "source": "CS1010", "target": "1010 cluster", "preclusion": true }
  ],

  "other stuff": [

  ]
}`

func (app *application) fullGraph(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  w.Write([]byte(js))
}
