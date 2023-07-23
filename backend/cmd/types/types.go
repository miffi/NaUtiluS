// General types useful for passing around course and graph data
package types

type FilterOptions struct {
	Departments []string `json:"departments,omitempty"`
	Courses     []string `json:"courses,omitempty"`
	Semester    string   `json:"semester,omitempty"`
	Limit       int      `json:"limit,omitempty"`
}

type Graph struct {
	Nodes []Node `json:"nodes"`
	Links []Link `json:"links"`
}

// The data of a frontend force-graph node
type Node struct {
	Name       string `json:"id"`
	Department string `json:"department"`
	IsCluster  bool   `json:"cluster"`
	Indirect   bool   `json:"indirect"`
}

// The data of a frontend force-graph link
type Link struct {
	SourceName string `json:"source"`
	TargetName string `json:"target"`
}

type NodeNeighbors struct {
	Name      string   `json:"name"`
	Neighbors []string `json:"neighbors"`
}

type Course struct {
	Preclusion   string `json:"preclusion"`
	Prerequisite string `json:"prerequisite"`

	Description string `json:"description"`

	Title      string `json:"title"`
	Department string `json:"department"`
	Faculty    string `json:"faculty"`

	Code   string `json:"courseCode"`
	Credit string `json:"credit"`

	Semesters []string `json:"semesters"`
}

type CourseSummary struct {
	Code  string `json:"courseCode"`
	Title string `json:"title"`
}
