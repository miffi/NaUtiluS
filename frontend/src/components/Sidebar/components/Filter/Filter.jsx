import React, { useState } from 'react';
import './filter.css';
import Departments from './components/Departments/Departments';
import Courses from './components/Courses/Courses';
import Semesters from './components/Semesters/Semesters';
import Limit from './components/Limit/Limit';
import ExpandToggle from './components/ExpandToggle/ExpandToggle';

function Filter(props) {
	const filterURI = props.filterURI;
	const graphRef = props.graphRef;
	const showAlert = props.showAlert;

	const setGraphData = props.setGraphData;
	const closeDesc = props.closeDesc;

	const selectedDepartments = props.selectedDepartments;
	const selectedCourses = props.selectedCourses;

	const setSemesterFilter = props.setSemesterFilter;
	const presentCourses = props.presentCourses;
	const presentDepartments = props.presentDepartments;
	const setPresentCourses = props.setPresentCourses;
	const setPresentDepartments = props.setPresentDepartments;

	const setExpandByDepartment = props.setExpandByDepartment;
	const [toggleLimit, setToggleLimit] = useState(true);

	const updateNodeSet = props.updateNodeSet;
	const updateLinkSet = props.updateLinkSet;

	function handleSubmit() {
		closeDesc();
		
		const semester = document.getElementById('semesters-search').value;
		const toggle = document.getElementById('expand-toggle-switch').checked;
		const limitVal = selectedCourses.length > 0 ? document.getElementById('limit-input').value : 0;
		const limit = limitVal ? parseInt(limitVal) : 0;

		if (selectedCourses.length === 0 && selectedDepartments.length === 0) {
			showAlert('alert-empty-filter');
			return;
		}

		setSemesterFilter(semester);

		presentCourses.length = 0;
		selectedCourses.forEach(val => presentCourses.push(val));
		setPresentCourses(presentCourses);

		presentDepartments.length = 0;
		selectedDepartments.forEach(val => presentDepartments.push(val));
		setPresentDepartments(presentDepartments);

		setExpandByDepartment(toggle);
		// console.log(toggle)

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
		await fetch(filterURI, {
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
			if (!data.nodes) showAlert('alert-no-match')
			else if (data.nodes && !data.links) {
				// console.log(data);
				data.links = [];
				updateNodeSet(prevNodeSet => {
					prevNodeSet.clear();
					data.nodes.forEach(node => prevNodeSet.add(node.id));
					// console.log(prevNodeSet);
					return prevNodeSet;
				})
				updateLinkSet(prevLinkSet => {
					prevLinkSet.clear();
					data.links.forEach(link => prevLinkSet.add(JSON.stringify(link)));
					// console.log(prevLinkSet);
					return prevLinkSet;
				})
				setGraphData(() => data)
				//console.log(data)
				graphRef.current.zoom(2);
				graphRef.current.centerAt(-20, 0, 200);
			} else {
				updateNodeSet(prevNodeSet => {
					prevNodeSet.clear();
					data.nodes.forEach(node => prevNodeSet.add(node.id));
					// console.log(prevNodeSet);
					return prevNodeSet;
				})
				updateLinkSet(prevLinkSet => {
					prevLinkSet.clear();
					data.links.forEach(link => prevLinkSet.add(JSON.stringify(link)));
					// console.log(prevLinkSet);
					return prevLinkSet;
				})
				setGraphData(() => data)
				//console.log(data)
				graphRef.current.zoom(4.5)
				graphRef.current.centerAt(-20, 0, 200);
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
			<ExpandToggle {...newProps} />
			<Courses {...newProps} />
			{toggleLimit && <Limit />}
			<Semesters {...newProps} />
			<button className='apply-button' value="Apply" onClick={handleSubmit}>Apply</button><br /><br />
		</div>
	);
}

export default Filter;