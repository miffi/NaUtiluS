package types

type Course struct {
	Name       string `json:"name"`
	Department string `json:"department"`
}

type Node struct {
	Name       string `json:"id"`
	Department string `json:"department"`
	IsCluster  bool   `json:"cluster"`
}

type Link struct {
	FromName string `json:"from"`
	ToName   string `json:"to"`
}
