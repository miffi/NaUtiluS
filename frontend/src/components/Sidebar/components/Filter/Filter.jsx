import React, { useState, useEffect } from 'react';
import './filter.css';

function Filter(props) {
	function Form() {
		const [nodes, setNodes] = useState([])
		const [error, setError] = useState(null)
		const [loading, setLoading] = useState(null)
		
		useEffect(() => {
			fetch("https://api.nusmods.com/v2/2023-2024/moduleList.json")
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					throw response;
				})
				.then(data => {
					setNodes(data);
				})
				.catch(error => {
					console.error("Error fetching courses list data: ", error);
					setError(error);
				})
				.finally(() => {
					setLoading(false);
				})
		}, []);
		
		const listOfFaculties = ["College of Design and Engineering", "College of Humanities and Sciences",
			"Faculty of Arts and Social Sciences", "Faculty of Science",
			"Residential College Programmes", "School of Business",
			"School of Computing", "Yong Siew Toh Conservatory of Music"];
		const listOfCourses = nodes.map(node => node.moduleCode)

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

		return (
			<div className="filter-form" id="filter_form">
				<label htmlFor='department_dropdown' style={{ paddingLeft: 2 + 'px' }}>Department</label><br />
				<div role="listbox" tabIndex={0} id="department_dropdown" className="department-dropdown" aria-multiselectable="true">
					{listOfFaculties.map((element, index) => (
						<div
							id={"department-" + index} key={"department-" + index} className="department-item" role="option" aria-selected="false"
							aria-label={element} onClick={() => handleDepartmentCheckboxChange(index)}>
							<input id={"department-checkbox-" + index} className="department-checkbox" tabIndex={-1} type='checkbox'></input>
							<label className="department-label">{element}</label>
						</div>
					))}
				</div><br />
				<label htmlFor="done_courses" style={{ paddingLeft: 2 + 'px' }}>Courses Finished</label><br />
				<div role="listbox" tabIndex={0} id="course_dropdown" className="course-dropdown" aria-multiselectable="true">
					{
					error
					? <div type='text'>Cannot fetch course data</div>
					: loading
					? <div type='text'>Fetching course data</div>
					: listOfCourses.map((element, index) => (
						<div
							id={"course-" + index} key={"course-" + index} className="course-item" role="option" aria-selected="false"
							aria-label={element} onClick={() => handleCourseCheckboxChange(index)}>
							<input id={"course-checkbox-" + index} className="course-checkbox" tabIndex={-1} type='checkbox'></input>
							<label className="course-label">{element}</label>
						</div>
						))
					}
				</div><br />
				<label htmlFor='semester_dropdown' style={{ paddingLeft: 2 + 'px' }}>Semester</label><br />
				<select name="semester" id="semester_dropdown" className="semester-dropdown">
					<option value="none"></option>
					<option value="Sem1">Semester 1</option>
					<option value="Sem2">Semester 2</option>
					<option value="SpSem1">Special Semester 1</option>
					<option value="SpSem2">Special Semester 2</option>
				</select><br /><br />
				<button value="Apply" onClick={handleSubmit}>Apply</button><br /><br />
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