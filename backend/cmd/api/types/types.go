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

// Type holding all the information for one course.
// The json tags correspond to their names in the NUSMods API.
type CourseDetails struct {
	Preclusion   string `json:"preclusion"`
	Prerequisite string `json:"prerequisite"`

	Description string `json:"description"`

	Title      string `json:"title"`
	Department string `json:"department"`
	Faculty    string `json:"faculty"`

	CourseCode   string `json:"moduleCode"`
	CourseCredit string `json:"moduleCredit"`

	SemesterData []Semester `json:"semesterData"`

	PrerequisiteRule string `json:"prerequisiteRule"`
	PreclusionRule   string `json:"preclusionRule"`
	CorequisiteRule  string `json:"courequisiteRule"`
}

type Semester struct {
	Number int `json:"semester"`
}

// Type holding a summary of a course.
// The json tags correspond to their names in the NUSMods API.
type CourseSummary struct {
	Code      string `json:"moduleCode"`
	Title     string `json:"title"`
	Semesters []int  `json:"semesters"`
}

type Summary struct {
	Code  string `json:"courseCode"`
	Title string `json:"title"`
}

type Detail struct {
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
