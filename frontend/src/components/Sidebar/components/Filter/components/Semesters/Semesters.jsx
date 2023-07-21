import React, { useState } from 'react'
import { HiChevronUp, HiChevronDown } from "react-icons/hi"
import './semesters.css'

function Semesters() {
	const availableChoices = ['', 'Semester 1', 'Semester 2', 'Special Semester 1', 'Special Semester 2'];
	const [toggleSuggestions, setToggleSuggestions] = useState(false);

	function displaySuggestions() {
		setToggleSuggestions(true);
		document.getElementById('semesters-suggestions').style.display = 'block';
	}

	function removeSuggestions() {
		setToggleSuggestions(false);
		document.getElementById('semesters-suggestions').style.display = 'none';
	}

	function substituteContent(semester) {
		document.getElementById('semesters-search').value = semester;
		removeSuggestions()
	}

	return (
		<>
		<br />
		<label className='semesters-label'>Semester</label><br />
		<div id='semesters-container' className='semesters-container'>
			<input id='semesters-search' className='semesters-search' type="text" placeholder='All'
			autoComplete='off' onBlur={removeSuggestions} readOnly={true} />
			{ toggleSuggestions
				? <HiChevronUp id='semesters-collapse' className='semesters-collapse' onClick={removeSuggestions} />
				: <HiChevronDown id='semesters-expand' className='semesters-expand' onClick={() => {
					displaySuggestions();
					document.getElementById('semesters-search').focus();
				}} />
			}
		</div>
		<div id='semesters-suggestions' className='semesters-suggestions'>
			<ul>
				{availableChoices.map(semester => {
					return <li key={semester} className={'semesters-choices'}
						onClick={() => substituteContent(semester)} onMouseDown={() => event.preventDefault()}>{semester}</li>;
				})}
			</ul>
		</div>
		<br />
		</>

	)
}

export default Semesters