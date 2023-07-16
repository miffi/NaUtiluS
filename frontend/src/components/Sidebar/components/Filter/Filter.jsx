import React, { useState } from 'react';
import './filter.css';
import Departments from './components/Departments/Departments';
import Courses from './components/Courses/Courses';
import Semesters from './components/Semesters/Semesters';
import Limit from './components/Limit/Limit';

function Filter(props) {
	const selectedDepartments = props.selectedDepartments;
	const selectedCourses = props.selectedCourses;
	const [toggleLimit, setToggleLimit] = useState(true);

	function handleSubmit() {
		const semester = document.getElementById('semesters-search').value;
		const limitVal = selectedCourses.length > 0 ? document.getElementById('limit-input').value : 0;
		const limit = limitVal ? parseInt(limitVal) : 0;

		if (selectedCourses.length === 0 && selectedDepartments.length === 0) {
			window.alert('Please specify a filter!');
			return;
		}

		if (semester === '') props.setSemesterFilter(() => false);
		else props.setSemesterFilter(() => true);

		props.presentCourses.length = 0;
		selectedCourses.forEach(val => props.presentCourses.push(val));
		props.setPresentCourses(props.presentCourses);

		const filterObject = {
			departments: selectedDepartments,
			courses: selectedCourses,
			semester: semester,
			limit: limit
		}
		let filterQuery = JSON.stringify(filterObject);
		sendData(filterQuery);
	}

	async function sendData(data) {
		await fetch(props.filterURI, {
			method: 'POST',
			body: data
		})
		.then(response => {
			// console.log(response.status);
			if (!response.ok) {
				throw new Error("HTTP status " + response.status);
			}
			return response.json();
		})
		.then(data => {
			// console.log(data);
			if (!data.nodes) window.alert('No courses fit this description!')
			else if (data.nodes && !data.links) {
				data.links = [];
				props.setGraphData(() => data)
				//console.log(data)
			} else {
				props.updateNodeSet(prevNodeSet => {
					prevNodeSet.clear();
					data.nodes.forEach(node => prevNodeSet.add(node.id));
					// console.log(prevNodeSet);
					return prevNodeSet;
				})
				props.updateLinkSet(prevLinkSet => {
					prevLinkSet.clear();
					data.links.forEach(link => prevLinkSet.add(JSON.stringify(link)));
					// console.log(prevLinkSet);
					return prevLinkSet;
				})
				props.setGraphData(() => data)
				//console.log(data)
				props.graphRef.current.zoom(4.5)
				props.graphRef.current.centerAt(props.toggleFilter ? -20 : 0, 0, 200);
			}
		});
	}

	const newProps = {
		...props, 
		toggleLimit: toggleLimit,
		setToggleLimit: setToggleLimit	
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