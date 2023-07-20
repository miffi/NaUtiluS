import React, { useState } from 'react'
import { HiChevronUp, HiChevronDown, HiX } from "react-icons/hi"
import './courses.css'

function Courses(props) {
	const delay = ms => new Promise(res => setTimeout(res, ms));

	const listOfCourses = props.listOfCourses
	const [autoComplete, setAutoComplete] = useState(null);
	const [toggleSuggestions, setToggleSuggestions] = useState(false);
	const selected = props.selectedCourses;
	const setSelected = props.setSelectedCourses;
	const setToggleLimit = props.setToggleLimit

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
			matchedChoices = listOfCourses.filter(course => (course.courseCode + ' ' + course.title).toLowerCase().includes(input.toLowerCase()))
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
					const courseText = course.courseCode + ' ' + course.title;
					return <li key={course.courseCode} className={'courses-choices'}
						onClick={() => handleCourseSubmit(course.courseCode)} onMouseDown={() => event.preventDefault()}>{courseText}</li>;
				})}
			</ul>
		}
		setAutoComplete(content);
	}
	
	async function handleCourseSubmit(course) {
		if (selected.includes(course)) {
			removeSuggestions();
			document.getElementById('courses-search').value = '';
			document.getElementById(course + ' label').style.color = 'red';
			await delay(1000);
			document.getElementById(course + ' label').style.color = '#333';
		} else {
			removeSuggestions();
			selected.push(course);
			setSelected(selected);
			setToggleLimit(selected.length > 0)
			document.getElementById('courses-search').blur();
			document.getElementById('courses-search').value = '';
		}
	}

	function deselectOption(option) {
		const result = selected.filter(entry => entry !== option);
		setToggleLimit(result.length > 0);
		setSelected(result)
		// console.log(result)
	}

	return (
		<div>
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
			{ selected.length > 0 &&
				<div id='courses-selected' className='courses-selected'>
					{
						selected.map(option => (
							<div key={option} className='selected-option'>
								<div id={option + ' label'} className='selected-label'>{option}</div>
								<HiX className='deselect' onClick={() => deselectOption(option)}/>
							</div>
						))
					}
				</div>
			}
			<div id='course-warning' className='course-warning'></div>
			<br />
		</div>

	)
}

export default Courses