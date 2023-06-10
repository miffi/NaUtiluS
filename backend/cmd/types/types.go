package types

type Course struct {
	Name       string `json:"name"`
	Department string `json:"department"`
}

type Node struct {
	ElementId  string `json:"id"`
	Name       string `json:"name"`
	Department string `json:"department"`
	IsCluster  bool   `json:"cluster"`
}

type Link struct {
	FromElementId string `json:"from"`
	ToElementId   string `json:"to"`
}
