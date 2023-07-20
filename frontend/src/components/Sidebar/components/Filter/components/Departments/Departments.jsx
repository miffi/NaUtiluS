import React, { useState } from 'react'
import { HiChevronUp, HiChevronDown, HiX } from "react-icons/hi"
import './departments.css'

function Departments(props) {
	const delay = ms => new Promise(res => setTimeout(res, ms));

	const listOfDepartments = props.listOfDepartments;
	const [autoComplete, setAutoComplete] = useState(null);
	const [toggleSuggestions, setToggleSuggestions] = useState(false);
	const selected = props.selectedDepartments;
	const setSelected = props.setSelectedDepartments;

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
	
	async function handleDepartmentSubmit(department) {
		if (selected.includes(department)) {
			removeSuggestions();
			document.getElementById('departments-search').value = '';
			document.getElementById(department + ' label').style.color = 'red';
			await delay(1000);
			document.getElementById(department + ' label').style.color = '#333';
		} else {
			removeSuggestions();
			selected.push(department);
			setSelected(selected);
			document.getElementById('departments-search').blur();
			document.getElementById('departments-search').value = '';
		}
	}

	function deselectOption(option) {
		setSelected(selected.filter(entry => entry !== option))
	}

	return (
		<div>
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
			{ selected.length > 0 &&
				<div id='departments-selected' className='departments-selected'>
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
		</div >

	)
}

export default Departments