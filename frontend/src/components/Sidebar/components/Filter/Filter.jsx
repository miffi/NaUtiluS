import React, { useState } from 'react';
import './filter.css';
import Departments from './components/Departments/Departments';
import Courses from './components/Courses/Courses';
import Semesters from './components/Semesters/Semesters';

function Filter(props) {
	const [toggleDepartments, setToggleDepartments] = useState(false);
	const [toggleCourses, setToggleCourses] = useState(false);

	function handleSubmit() {
		let departments = document.getElementsByClassName("department-item");
		let courses = document.getElementsByClassName("course-item");
		let semester = document.getElementById("semester_dropdown").value;

		let selectedDepartments = [...departments]
			.filter(option => option.ariaSelected === "true")
			.map(option => option.ariaLabel);
		let selectedCourses = [...courses]
			.filter(option => option.ariaSelected === "true")
			.map(option => option.ariaLabel);

		const filterObject = {
			department: selectedDepartments,
			courses: selectedCourses,
			semester: semester
		}
		let filterQuery = JSON.stringify(filterObject);

		console.log(filterQuery);
		sendData(filterQuery);
	}

	async function sendData(data) {
		await fetch(props.filterURI, {
			method: 'POST',
			body: data
		})
			.then(response => {
				console.log(response.status);
				if (!response.ok) {
					throw new Error("HTTP status " + response.status);
				}
				
				console.log(response.clone().json());
				return response.json();
			}

			);
	}

	function handleDepartmentCheckboxChange(index) {
		const optionId = "department-" + index;
		const checkboxId = "department-checkbox-" + index;
		const option = document.getElementById(optionId);
		const checkbox = document.getElementById(checkboxId);
		if (option.ariaSelected === "false") {
			option.ariaSelected = "true";
			checkbox.checked = true;
		}
		else {
			option.ariaSelected = "false";
			checkbox.checked = false;
		}
	}

	function handleCourseCheckboxChange(index) {
		const optionId = "course-" + index;
		const checkboxId = "course-checkbox-" + index;
		const option = document.getElementById(optionId);
		const checkbox = document.getElementById(checkboxId);
		if (option.ariaSelected === "false") {
			option.ariaSelected = "true";
			checkbox.checked = true;
		}
		else {
			option.ariaSelected = "false";
			checkbox.checked = false;
		}
	}

	const newProps = {
		...props, 
		toggleDepartments: toggleDepartments,
		toggleCourses: toggleCourses,
		setToggleDepartments: setToggleDepartments,
		setToggleCourses: setToggleCourses,
		handleDepartmentCheckboxChange: handleDepartmentCheckboxChange,
		handleCourseCheckboxChange: handleCourseCheckboxChange
	}

	// const listOfCourses = props.listOfCourses;
		// const listOfDepartments = props.listOfDepartments;
		// const loading = props.coursesLoading;
		// const error = props.coursesError;

	return (
		<div className="menu-filter" id="filter">
			<h1>Filter</h1>
			<Departments {...newProps} />
			<Courses {...newProps} />
			<Semesters {...newProps} />
			<button value="Apply" onClick={handleSubmit}>Apply</button><br /><br />
			<div id="answer"></div>
		</div>
	);
}

export default Filter;