import React, { useState } from 'react';
import './filter.css';
import Departments from './components/Departments/Departments';
import Courses from './components/Courses/Courses';
import Semesters from './components/Semesters/Semesters';

function Filter(props) {
	const [toggleDepartments, setToggleDepartments] = useState(false);
	const [toggleCourses, setToggleCourses] = useState(false);
	const [selectedDepartments, setSelectedDepartments] = useState([])
	const [selectedCourses, setSelectedCourses] = useState([])
	

	function handleSubmit() {
		let semester = document.getElementById('semesters-search').value;

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

	const newProps = {
		...props, 
		toggleDepartments: toggleDepartments,
		toggleCourses: toggleCourses,
		setToggleDepartments: setToggleDepartments,
		setToggleCourses: setToggleCourses,

		selectedDepartments: selectedDepartments,
		selectedCourses: selectedCourses,
		setSelectedDepartments: setSelectedDepartments,
		setSelectedCourses: setSelectedCourses		
	}

	return (
		<div className="menu-filter" id="filter">
			<h1>Filter</h1>
			<Departments {...newProps} />
			<Courses {...newProps} />
			<Semesters {...newProps} />
			<button className='apply-button' value="Apply" onClick={handleSubmit}>Apply</button><br /><br />
		</div>
	);
}

export default Filter;