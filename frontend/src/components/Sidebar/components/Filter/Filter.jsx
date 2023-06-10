import React, { useState } from 'react';
import './filter.css';

function Filter(props) {
    function Form() {
        const oldData = props.originalData;

        function handleSubmit() {
            let departments = document.getElementsByClassName("department-item");
            let doneCourses = document.getElementById("done_courses").value.split(/[\s,]+/);
            let semester = document.getElementById("semester_dropdown").value;

            let selectedDepartments = [...departments]
                                        .filter(option => option.ariaSelected === "true")
                                        .map(option => option.ariaLabel);
        
            const filterObject = {
                department: selectedDepartments,
                courses: doneCourses,
                semester: semester
            }
            let filterQuery = JSON.stringify(filterObject);

            console.log(filterQuery);
            sendData(filterQuery);
        }

        async function sendData(data) {
            await fetch('http://localhost:8080/v1/filter.json', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: data
            });
        }

        function handleCheckboxChange(index) {
            const id = "department-" + index;
            const option = document.getElementById(id);
            if (option.ariaSelected == "false") option.ariaSelected = "true";
            else option.ariaSelected = "false";
        }
    
        return (
            <div className="filter-form" id="filter_form">
                <label htmlFor='department_dropdown' style={{paddingLeft: 2 + 'px'}}>Department</label><br />
                <div role="listbox" tabIndex={0} id="department_dropdown" className="department-dropdown" aria-multiselectable="true">
                    <div id="department-0" className="department-item" role="option" aria-selected="false" aria-label="CDE">
                        <input className="department-checkbox" tabIndex={-1} type='checkbox' onChange={() => handleCheckboxChange(0)}></input>
                        <label className="department-label">College of Design and Engineering</label>
                    </div>
                    <div id="department-1" className="department-item" role="option" aria-selected="false" aria-label="CHS">
                        <input className="department-checkbox" tabIndex={-1} type='checkbox' onChange={() => handleCheckboxChange(1)}></input>
                        <label className="department-label">College of Humanities and Sciences</label>
                    </div>
                    <div id="department-2" className="department-item" role="option" aria-selected="false" aria-label="FASS">
                        <input className="department-checkbox" tabIndex={-1} type='checkbox' onChange={() => handleCheckboxChange(2)}></input>
                        <label className="department-label">Faculty of Arts and Social Sciences</label>
                    </div>
                    <div id="department-3" className="department-item" role="option" aria-selected="false" aria-label="FoS">
                        <input className="department-checkbox" tabIndex={-1} type='checkbox' onChange={() => handleCheckboxChange(3)}></input>
                        <label className="department-label">Faculty of Science</label>
                    </div>
                    <div id="department-4" className="department-item" role="option" aria-selected="false" aria-label="RC">
                        <input className="department-checkbox" tabIndex={-1} type='checkbox' onChange={() => handleCheckboxChange(4)}></input>
                        <label className="department-label">Residential College Programmes</label>
                    </div>
                    <div id="department-5" className="department-item" role="option" aria-selected="false" aria-label="Biz">
                        <input className="department-checkbox" tabIndex={-1} type='checkbox' onChange={() => handleCheckboxChange(5)}></input>
                        <label className="department-label">School of Business</label>
                    </div>
                    <div id="department-6" className="department-item" role="option" aria-selected="false" aria-label="SoC">
                        <input className="department-checkbox" tabIndex={-1} type='checkbox' onChange={() => handleCheckboxChange(6)}></input>
                        <label className="department-label">School of Computing</label>
                    </div>
                    <div id="department-7" className="department-item" role="option" aria-selected="false" aria-label="YSTCM">
                        <input className="department-checkbox" tabIndex={-1} type='checkbox' onChange={() => handleCheckboxChange(7)}></input>
                        <label className="department-label">Yong Siew Toh Conservatory of Music</label>
                    </div>
                </div><br />
                <label htmlFor="done_courses" style={{paddingLeft: 2 + 'px'}}>Courses Finished</label><br />
                <input type='text' id="done_courses" className="done-courses" placeholder="CS1010S, MA1521, etc."></input><br />
                <br />
                <label htmlFor='semester_dropdown' style={{paddingLeft: 2 + 'px'}}>Semester</label><br />
                <select name="semester" id="semester_dropdown" className="semester-dropdown">
                    <option value="none"></option>
                    <option value="Sem1">Semester 1</option>
                    <option value="Sem2">Semester 2</option>
                    <option value="SpSem1">Special Semester 1</option>
                    <option value="SpSem2">Special Semester 2</option>
                </select><br /><br />
                <button value="Apply" onClick={handleSubmit}>Apply</button>
            </div>
        );
    }

    return (
        <div className="menu-filter" id="filter">
            <h1>Filter</h1>
            <Form />
            <div id="answer"></div>
        </div>
    );
}

export default Filter;