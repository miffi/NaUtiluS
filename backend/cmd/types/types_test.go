package types

import (
	"encoding/json"
	"testing"
)

func TestNodeMarshal(t *testing.T) {
	tests := []struct {
		node     Node
		expected string
	}{
		{
			Node{
				IsCluster: false,
				Name: "cs2030s",
				Department: "computing",
			},
			`{"id":"cs2030s","department":"computing","cluster":false}`,
		},
	}

	for _, test := range tests {
		testJSON, err := json.Marshal(test.node)
		if err != nil {
			t.Error(err)
		}
		if string(testJSON) != test.expected {
			t.Errorf("JSON Marshal %s not equal to expected %s", testJSON, test.expected)
		}
	}
}
