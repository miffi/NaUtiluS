import React, { useState } from 'react';
import './filter.css';
import Departments from './components/Departments/Departments';
import Courses from './components/Courses/Courses';
import Semesters from './components/Semesters/Semesters';
import Limit from './components/Limit/Limit';

function Filter(props) {
	const [toggleDepartments, setToggleDepartments] = useState(false);
	const [toggleCourses, setToggleCourses] = useState(false);
	const [selectedDepartments, setSelectedDepartments] = useState(['Computer Science'])
	const [selectedCourses, setSelectedCourses] = useState(['CS1010'])
	const [toggleLimit, setToggleLimit] = useState(true);

	function handleSubmit() {
		const semester = document.getElementById('semesters-search').value;
		const limitVal = selectedCourses.length > 0 ? document.getElementById('limit-input').value : 0;
		const limit = limitVal ? parseInt(limitVal) : 0;

		if (selectedCourses.length === 0 && selectedDepartments.length === 0) {
			window.alert('Please specify a filter!');
			return;
		}

		const filterObject = {
			departments: selectedDepartments,
			courses: selectedCourses,
			semester: semester,
			limit: limit
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
		})
		.then(data => {
			console.log(data);
			if (!data.nodes || !data.links) window.alert('No courses fit this description!')
			else props.setGraphData(data)
		});
	}

	const newProps = {
		...props, 
		toggleDepartments: toggleDepartments,
		toggleCourses: toggleCourses,
		toggleLimit: toggleLimit,
		setToggleDepartments: setToggleDepartments,
		setToggleCourses: setToggleCourses,
		setToggleLimit: setToggleLimit,

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
			{toggleLimit && <Limit />}
			<Semesters {...newProps} />
			<button className='apply-button' value="Apply" onClick={handleSubmit}>Apply</button><br /><br />
		</div>
	);
}

export default Filter;