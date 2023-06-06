import React, { useState } from 'react';
import './filter.css';

function Filter(props) {
    function Form() {
    
        function handleSubmit() {
            let group = document.getElementById("semester_dropdown").value;
            group === "none"
                ? console.log("No Filter")
                : console.log("Group         " + group);
        }
    
        return (
            <div className="filter-form" id="filter_form">
                <label htmlFor='semester_dropdown' style={{paddingLeft: 2 + 'px'}}>Semester</label><br />
                <select name="semester" id="semester_dropdown" className="semester">
                    <option value="none"></option>
                    <option value="0">Group 0</option>
                    <option value="1">Group 1</option>
                    <option value="2">Group 2</option>
                </select><br />
                <br />
                <button value="Apply" onClick={handleSubmit}>Apply</button>
            </div>
        );
    }

    const [isChecked, setIsChecked] = useState(false);

    return (
        <div className="menu-filter" id="filter">
            <h1>Filter</h1>
            <div className="filter-toggle">
                <input type="checkbox" id="open_filter" value="Open Filter" onChange={() => setIsChecked(!isChecked)} checked={isChecked}/>
                <label htmlFor="open_filter">Open Filter</label>
            </div>
            <br />
            {isChecked
            ? <Form />
            : <p>Check the box to open the filter!</p>}
            <div id="answer"></div>
        </div>
    );
}

export default Filter;