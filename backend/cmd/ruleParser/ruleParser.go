// nolint: govet
package ruleparser

import (
	"github.com/alecthomas/participle/v2"
	"github.com/alecthomas/participle/v2/lexer"
	"github.com/miffi/nautilus/backend/cmd/types"
)

var ruleLexer = lexer.MustSimple([]lexer.SimpleRule{
	{Name: "Program", Pattern: `(?i)\b((SPECIAL_)?PROGRAM(ME)?S?|2ND_MAJOR|MINOR)\b`},
	{Name: "Keyword", Pattern: `(?i)\b(SUBJECTS|UNITS|PROGRAM_TYPES|GPA|UNITS|COHORT_YEARS|SPECIAL|AND|OR|IF_IN|THEN|COURSES)\b`},
	{Name: "Must", Pattern: `(?i)\b(MUST_BE_IN|MUST_NOT_BE_IN)\b`},
	{Name: "ProgramName", Pattern: `\b(\d{4}[a-zA-Z_]\w*|CY)\b`},
	{Name: "Ident", Pattern: `[a-zA-Z_]\w*`},
	{Name: "String", Pattern: `"(\\"|[^"])*"`},
	{Name: "Number", Pattern: `[-+]?(\d*\.)?\d+`},
	{Name: "Punct", Pattern: `[%:(),/+-]`},
	{Name: "Whitespace", Pattern: `\s+`},
})

func NewParser() *participle.Parser[Rule] {
	return participle.MustBuild[Rule](
		participle.Lexer(ruleLexer),
		participle.Unquote("String"),
		participle.CaseInsensitive("Keyword", "Must"),
		participle.Elide("Whitespace"),
		participle.UseLookahead(participle.MaxLookahead),
		participle.Union[andPrecendence](Courses{}, Subjects{}, Programs{}, ProgramTypes{}, Special{}, CohortYears{}, GPA{}, Units{}, Paren{}),
		participle.Union[OrPrecedence](And{}, Courses{}, Subjects{}, Programs{}, ProgramTypes{}, Special{}, CohortYears{}, GPA{}, Units{}, Paren{}),
		participle.Union[Rule](Or{}, And{}, Courses{}, Subjects{}, Programs{}, ProgramTypes{}, Special{}, CohortYears{}, GPA{}, Units{}, Paren{}),
	)
}

type (
	Rule interface {
		GetPrereqTree()
	}

	OrPrecedence interface {
		orPrecedence()
	}

	andPrecendence interface {
		andPrecedence()
	}
)

type MustBeIn bool

func (m *MustBeIn) Capture(values []string) error {
	val := values[0]
	if val == "MUST_BE_IN" {
		*m = true
	}
	if val == "MUST_NOT_BE_IN" {
		*m = false
	}
	return nil
}

type (
	ProgramTypes struct {
		If   []string `"PROGRAM_TYPES" "IF_IN" (@Ident | "(" @Ident ")")+ "THEN"`
		Then Rule     `@@`
	}

	Programs struct {
		Type     string    `@Program`
		MustBeIn *MustBeIn `@Must?`
		Num      *int      `("(" @Number ")")?`
		Names    []string  `@ProgramName ("," @ProgramName)*`
	}

	Courses struct {
		Num        *int     `"COURSES" ( "(" @Number ")" )?`
		CourseData []Course `@@ ("," @@)*`
	}

	Subjects struct {
		Num          *int      `"SUBJECTS" ( "(" @Number ")" )?`
		SubjectNames []Subject `@@ ("," @@)*`
	}

	Special struct {
		MustBeIn *MustBeIn `"SPECIAL" @Must?`
		String   string    `@String`
	}

	CohortYears struct {
		MustBeIn *MustBeIn `"COHORT_YEARS" (@Must?`
		Years    []Year    `@@+`
		If       *Year     `| "IF_IN" @@+ "THEN"`
		Rule     Rule      `@@)`
	}

	GPA struct {
		Score float64 `"GPA" "(" @Number ")"`
	}

	Units struct {
		Num int `"UNITS" "(" @Number ")"`
	}

	And struct {
		Branches []andPrecendence `@@ ("AND" @@)+`
	}

	Or struct {
		Branches []OrPrecedence `@@ ("OR" @@)+`
	}

	Paren struct {
		Body Rule `"(" @@ ")"`
	}
)

type (
	Course struct {
		Code  []string `(@Ident | @"%")*`
		Grade *string  `(":" @(("A" | "B" | "C" | "D" | "E" | "F") ("+" | "-")? | "CS" | "P" | "S" ))?`
	}

	Year struct {
		SemesterCode string `(@"S" | @"E") ":"`
		Year         int    `@Number`
		EndYear      *int   `("/" @Number)?`
	}

	Subject struct {
		Num  string `(@Number | @Ident)`
		Code string `":" (@Number | @"N" | @"E" | @"AO" | @"W" | @"Y" | @"A" | @"D")`
	}
)

func (x ProgramTypes) GetPrereqTree()  {}
func (x Programs) GetPrereqTree()      {}
func (courses Courses) GetPrereqTree() {}
func (x Special) GetPrereqTree()       {}
func (x CohortYears) GetPrereqTree()   {}
func (x GPA) GetPrereqTree()           {}
func (x Units) GetPrereqTree()         {}
func (x Subjects) GetPrereqTree()      {}
func (paren Paren) GetPrereqTree()     {}
func (x And) GetPrereqTree()           {}
func (x Or) GetPrereqTree()            {}

func (x ProgramTypes) andPrecedence() {}
func (x Programs) andPrecedence()     {}
func (x Courses) andPrecedence()      {}
func (x Special) andPrecedence()      {}
func (x CohortYears) andPrecedence()  {}
func (x GPA) andPrecedence()          {}
func (x Units) andPrecedence()        {}
func (x Subjects) andPrecedence()     {}
func (x Paren) andPrecedence()        {}

func (x ProgramTypes) orPrecedence() {}
func (x Programs) orPrecedence()     {}
func (x Courses) orPrecedence()      {}
func (x Special) orPrecedence()      {}
func (x CohortYears) orPrecedence()  {}
func (x GPA) orPrecedence()          {}
func (x Units) orPrecedence()        {}
func (x Subjects) orPrecedence()     {}
func (x Paren) orPrecedence()        {}
func (x And) orPrecedence()          {}
