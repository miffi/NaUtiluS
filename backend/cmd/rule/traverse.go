package rule

// Functions meant for traversal around the graph for analysis and possibly
// optimisation.

type traverse interface {
	// Returns the number of course nodes that are in the tree
	courseBranches() int
}

func (types ProgramTypes) courseBranches() int {
	return types.Then.courseBranches()
}

func (Programs) courseBranches() int {
	return 0
}

func (courses Courses) courseBranches() int {
	return 1
}

func (Subjects) courseBranches() int {
	return 0
}

func (Special) courseBranches() int {
	return 0
}

func (cohort CohortYears) courseBranches() int {
	if cohort.Rule == nil {
		return 0
	}

	return (*cohort.Rule).courseBranches()
}

func (GPA) courseBranches() int {
	return 0
}

func (Units) courseBranches() int {
	return 0
}

func (and And) courseBranches() int {
	acc := 0
	for _, branch := range and.Branches {
		acc += branch.(Rule).courseBranches()
	}
	return acc
}

func (or Or) courseBranches() int {
	acc := 0
	for _, branch := range or.Branches {
		acc = branch.(Rule).courseBranches()
	}
	return acc
}

func (paren Paren) courseBranches() int {
	return paren.Body.courseBranches()
}
