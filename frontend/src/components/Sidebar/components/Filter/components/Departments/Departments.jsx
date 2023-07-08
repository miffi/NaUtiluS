import React, { useState } from 'react'
import { HiChevronUp, HiChevronDown } from "react-icons/hi"
import './departments.css'

function Departments(props) {
	// const listOfDepartments = props.listOfDepartments.map(course => course.courseCode)
	// const handleDepartmentCheckboxChange = props.handleDepartmentCheckboxChange;

	const listOfDepartments = props.listOfDepartments;
	const [autoComplete, setAutoComplete] = useState(null);
	const [toggleSuggestions, setToggleSuggestions] = useState(false);

	function displaySuggestions() {
		setToggleSuggestions(true);
		document.getElementById('departments-suggestions').style.display = 'block';
	}

	function removeSuggestions() {
		setToggleSuggestions(false);
		document.getElementById('departments-suggestions').style.display = 'none';
	}

	function handleFilterChoices() {
		displaySuggestions();
		let matchedChoices = [];
		let input = document.getElementById('departments-search').value;
		if (input.length) {
			matchedChoices = listOfDepartments.filter(department => department.toLowerCase().includes(input.toLowerCase()))
		} else if (input.length === 0) {
			matchedChoices = listOfDepartments;
		}
		let content;
		if (!matchedChoices.length) {
			content =
			<ul>
				<li key={'none'}>None matches your search</li>
			</ul>
		}
		else {
			content =
			<ul>
				{matchedChoices.map(department => {
					return <li key={department} className={'departments-choices'}
						onClick={() => handleDepartmentSubmit(department)} onMouseDown={() => event.preventDefault()}>{department}</li>;
				})}
			</ul>
		}
		setAutoComplete(content);
	}
	
	function handleDepartmentSubmit() {
		return;
	}

	return (
		<>
		<label className='departments-label'>Departments</label><br />
		<div id='departments-container' className='departments-container' onBlur={removeSuggestions}>
			<input id='departments-search' className='departments-search' type="text" placeholder='Enter a department'
			autoComplete='off' onFocus={handleFilterChoices} onBlur={removeSuggestions} onKeyUp={handleFilterChoices}/>
			{ toggleSuggestions
				? <HiChevronUp id='departments-collapse' className='departments-collapse' onClick={removeSuggestions} />
				: <HiChevronDown id='departments-expand' className='departments-expand' onClick={() =>{
						displaySuggestions();
						document.getElementById('departments-search').focus();
					}} />
			}
		</div>
		<div id='departments-suggestions' className='departments-suggestions'>
				{autoComplete}
		</div>
		<br />
		</>

	)
}

export default Departments