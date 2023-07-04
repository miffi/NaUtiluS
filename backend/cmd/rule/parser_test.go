package rule

import (
	"os"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func ptr[T any](v T) *T {
	return &v
}

func TestParsesAllData(t *testing.T) {
	parser := NewParser()
	entries, err := os.ReadDir("testData")
	if err != nil {
		t.Fatalf("Could not read directory %s", err)
	}
	for _, file := range entries {
		fileName := "testData/" + file.Name()
		t.Run(file.Name(), func(t *testing.T) {
			t.Parallel()

			file, err := os.Open(fileName)
			if err != nil {
				t.Fatalf("Cannot Open file\n")
			}

			output, err := parser.Parse(fileName, file)
			if err != nil {
				t.Logf("%s", cmp.Diff(nil, output))
				t.Fatalf("Unexpected error %s\n", err)
			}
			_ = output
		})
	}
}

func TestParsesCoursesCorrectly(t *testing.T) {
	tests := map[string]struct {
		input string
		want  Rule
	}{
		"WithNum": {
			input: "COURSES (2) CS2030S:A,CS2040S:D,CS1010%:D",
			want: Courses{
				Num: ptr(2),
				CourseData: []Course{
					{
						Code:  "CS2030S",
						Grade: "A",
					},
					{
						Code:  "CS2040S",
						Grade: "D",
					},
					{
						Code:  "CS1010.*",
						Grade: "D",
					},
				},
			},
		},
		"WithoutNum": {
			input: "COURSES CS1101S:A-,CS3230:D,CS2103%",
			want: Courses{
				Num: nil,
				CourseData: []Course{
					{
						Code:  "CS1101S",
						Grade: "A-",
					},
					{
						Code:  "CS3230",
						Grade: "D",
					},
					{
						Code:  "CS2103.*",
						Grade: "",
					},
				},
			},
		},
	}

	parser := NewParser()
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			output, err := parser.Parse(t.Name(), strings.NewReader(tc.input))
			if err != nil {
				t.Fatalf("Unexpected Error: %s", err)
			}

			if diff := cmp.Diff(tc.want, *output); diff != "" {
				t.Fatalf("Output does not equal expected value: %s", diff)
			}
		})
	}
}

func TestParsesAndCorrectly(t *testing.T) {
	cs2030s := Courses{
		Num: ptr(1),
		CourseData: []Course{
			{
				Code:  "CS2030S",
				Grade: "D",
			},
		},
	}
	cs2040s := Courses{
		Num: ptr(1),
		CourseData: []Course{
			{
				Code:  "CS2040S",
				Grade: "D",
			},
		},
	}
	cs2103all := Courses{
		Num: ptr(1),
		CourseData: []Course{
			{
				Code:  "CS2103.*",
				Grade: "D",
			},
		},
	}

	simpleRule := And{
		Branches: []andPrecendence{cs2030s, cs2040s},
	}
	parenRule := And{
		Branches: []andPrecendence{
			Paren{
				Body: cs2030s,
			},
			Paren{
				Body: cs2040s,
			},
		},
	}

	tests := map[string]struct {
		input string
		want  Rule
	}{
		"ByItself": {
			input: "COURSES (1) CS2030S:D AND COURSES (1) CS2040S:D",
			want:  simpleRule,
		},
		"WithNewLines": {
			input: `COURSES (1) CS2030S:D
			AND
			COURSES (1) CS2040S:D`,
			want: simpleRule,
		},
		"WithParenthesesAroundBranches": {
			input: "(COURSES (1) CS2030S:D) AND (COURSES (1) CS2040S:D)",
			want:  parenRule,
		},
		"WithParenthesesAroundItself": {
			input: "(COURSES (1) CS2030S:D AND COURSES (1) CS2040S:D)",
			want: Paren{
				Body: simpleRule,
			},
		},
		"InsideAnotherRule": {
			input: "PROGRAM_TYPES IF_IN Something (Testing for Parsing) THEN ((COURSES (1) CS2030S:D) AND (COURSES (1) CS2040S:D))",
			want: ProgramTypes{
				If: []IfIn{{Value: "Something (Testing for Parsing)"}},
				Then: Paren{
					Body: parenRule,
				},
			},
		},
		"Chaining": {
			input: "COURSES (1) CS2030S:D AND COURSES (1) CS2040S:D AND COURSES (1) CS2103%:D",
			want: And{
				Branches: []andPrecendence{
					cs2030s,
					cs2040s,
					cs2103all,
				},
			},
		},
	}

	parser := NewParser()
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			output, err := parser.Parse(t.Name(), strings.NewReader(tc.input))
			if err != nil {
				t.Fatalf("Unexpected Error: %s", err)
			}

			if diff := cmp.Diff(tc.want, *output); diff != "" {
				t.Fatalf("Output does not equal expected value: %s", diff)
			}
		})
	}
}

func TestParsesRealRules(t *testing.T) {
	tests := map[string]Rule{
		"CS2030S": ProgramTypes{
			If: []IfIn{{Value: "Undergraduate Degree"}},
			Then: Paren{
				Body: Courses{
					Num: ptr(1),
					CourseData: []Course{
						{
							Code:  "CS1010",
							Grade: "D",
						},
						{
							Code:  "CS1010E",
							Grade: "D",
						},
						{
							Code:  "CS1010X",
							Grade: "D",
						},
						{
							Code:  "CS1101S",
							Grade: "D",
						},
						{
							Code:  "CS1010S",
							Grade: "D",
						},
						{
							Code:  "CS1010J",
							Grade: "D",
						},
					},
				},
			},
		},
		"BSN4711": ProgramTypes{
			If: []IfIn{{Value: "Undergraduate Degree"}},
			Then: Paren{
				Body: And{
					Branches: []andPrecendence{
						Courses{
							Num: ptr(1),
							CourseData: []Course{
								{
									Code:  "BSP1703.*",
									Grade: "D",
								},
								{
									Code:  "BSP1707.*",
									Grade: "D",
								},
							},
						},
						Courses{
							Num: ptr(1),
							CourseData: []Course{
								{
									Code:  "BSP2701.*",
									Grade: "D",
								},
							},
						},
						Courses{
							Num: ptr(1),
							CourseData: []Course{
								{
									Code:  "BSP1702.*",
									Grade: "D",
								},
							},
						},
						CohortYears{
							MustBeIn: ptr(MustBeIn(true)),
							Years: []Year{
								{SemesterCode: "S", Year: 2017},
							},
						},
						Paren{
							Body: Or{
								Branches: []OrPrecedence{
									Paren{
										Body: Paren{
											Body: And{
												Branches: []andPrecendence{
													Programs{
														Type:     "PROGRAMS",
														MustBeIn: ptr(MustBeIn(true)),
														Num:      ptr(1),
														Names:    []string{"0200ACCHON", "0200BBAHON"},
													},
													Special{
														MustBeIn: ptr(MustBeIn(true)),
														String:   "ACAD_LEVEL=4",
													},
												},
											},
										},
									},
									Paren{
										Body: And{
											Branches: []andPrecendence{
												Paren{
													Body: And{
														Branches: []andPrecendence{
															Programs{
																Type:     "PROGRAMS",
																MustBeIn: ptr(MustBeIn(true)),
																Num:      ptr(1),
																Names:    []string{"0200ACCHON", "0200BBAHON"},
															},
															Special{
																MustBeIn: ptr(MustBeIn(true)),
																String:   "ACAD_LEVEL=3",
															},
														},
													},
												},
												GPA{
													Score: 3.2,
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	parser := NewParser()
	for name, rule := range tests {
		t.Run(name, func(t *testing.T) {
			inputFilename := "testData/" + name
			reader, err := os.Open(inputFilename)
			if err != nil {
				t.Fatalf("Unexpected error: %s", err)
			}
			output, err := parser.Parse(t.Name(), reader)
			if err != nil {
				t.Fatalf("Unexpected error: %s", err)
			}

			if diff := cmp.Diff(rule, *output); diff != "" {
				t.Fatalf("Output does not equal expected value: %s", diff)
			}
		})
	}
}
