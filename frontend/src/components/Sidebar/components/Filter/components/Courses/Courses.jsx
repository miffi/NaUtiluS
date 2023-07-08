import React, { useState } from 'react'
import { HiChevronUp, HiChevronDown } from "react-icons/hi"
import './courses.css'

function Courses(props) {
	// const listOfCourses = props.listOfCourses.map(course => course.courseCode)
	// const handleDepartmentCheckboxChange = props.handleDepartmentCheckboxChange;

	const listOfCourses = props.listOfCourses.map(course => course.courseCode);
	const [autoComplete, setAutoComplete] = useState(null);
	const [toggleSuggestions, setToggleSuggestions] = useState(false);

	function displaySuggestions() {
		setToggleSuggestions(true);
		document.getElementById('courses-suggestions').style.display = 'block';
	}

	function removeSuggestions() {
		setToggleSuggestions(false);
		document.getElementById('courses-suggestions').style.display = 'none';
	}

	function handleFilterChoices() {
		displaySuggestions();
		let matchedChoices = [];
		let input = document.getElementById('courses-search').value;
		if (input.length) {
			matchedChoices = listOfCourses.filter(course => course.toLowerCase().includes(input.toLowerCase()))
		} else if (input.length === 0) {
			matchedChoices = listOfCourses;
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
				{matchedChoices.map(course => {
					return <li key={course} className={'courses-choices'}
						onClick={() => handleCourseSubmit(course)} onMouseDown={() => event.preventDefault()}>{course}</li>;
				})}
			</ul>
		}
		setAutoComplete(content);
	}
	
	function handleCourseSubmit() {
		return;
	}

	return (
		<>
		<label className='courses-label'>Finished Courses</label><br />
		<div id='courses-container' className='courses-container'>
			<input id='courses-search' className='courses-search' type="text" placeholder='Enter a course'
			autoComplete='off' onFocus={handleFilterChoices} onBlur={removeSuggestions} onKeyUp={handleFilterChoices}/>
			{ toggleSuggestions
				? <HiChevronUp id='courses-collapse' className='courses-collapse' onClick={removeSuggestions} />
				: <HiChevronDown id='courses-expand' className='courses-expand' onClick={() =>{
					displaySuggestions();
					document.getElementById('courses-search').focus();
				}} />
			}
		</div>
		<div id='courses-suggestions' className='courses-suggestions'>
				{autoComplete}
		</div>
		<br />
		</>

	)
}

export default Courses