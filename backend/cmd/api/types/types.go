// General types useful for passing around course and graph data
package types

type FilterOptions struct {
	Departments []string `json:"departments,omitempty"`
	Courses     []string `json:"courses,omitempty"`
	Semester    string   `json:"semester,omitempty"`
}

type Graph struct {
	Nodes []Node `json:"nodes"`
	Links []Link `json:"links"`
}

// Type holding all the information for one course.
// The json tags correspond to their names in the NUSMods API.
type CourseDetails struct {
	CourseCode       string `json:"moduleCode"`
	Title            string `json:"title"`
	Department       string `json:"department"`
	PrerequisiteRule string `json:"prerequisiteRule"`
	PreclusionRule   string `json:"preclusionRule"`
	CorequisiteRule  string `json:"courequisiteRule"`
}

// Type holding a summary of a course.
// The json tags correspond to their names in the NUSMods API.
type CourseSummary struct {
	Code      string `json:"moduleCode"`
	Title     string `json:"title"`
	Semesters []int  `json:"semesters"`
}

// The data of a frontend force-graph node
type Node struct {
	Name       string `json:"id"`
	Department string `json:"department"`
	IsCluster  bool   `json:"cluster"`
}

// The data of a frontend force-graph link
type Link struct {
	SourceName string `json:"source"`
	TargetName string `json:"target"`
}

type PrereqTree struct{}
