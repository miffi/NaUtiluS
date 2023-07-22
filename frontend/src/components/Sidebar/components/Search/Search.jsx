import React, { useCallback, useEffect, useState } from 'react';
import './search.css';
import { HiChevronDown, HiChevronUp } from "react-icons/hi"

function Search(props) {

	const listOfCourses = props.listOfCourses;
	let availableChoices = [];
	const [autoComplete, setAutoComplete] = useState(null);
	const [toggleSuggestions, setToggleSuggestions] = useState(false);

	const openDesc = props.openDesc;
	const graphData = props.graphData;
	const nodeSet = props.nodeSet

	useEffect(() => {
		availableChoices = listOfCourses.filter(course => {
			const courseCode = course.courseCode
			return nodeSet.has(courseCode)
		})
	}, [graphData])
	
	function displaySuggestions() {
		setToggleSuggestions(true);
		document.getElementById('search-suggestions').style.display = 'block';
	}

	function removeSuggestions() {
		setToggleSuggestions(false);
		document.getElementById('search-suggestions').style.display = 'none';
	}

	function handleSearchSubmit(courseName) {
		if (graphData === null) {
			props.showAlert('alert-server-down')
			return;
		}
		const node = graphData.nodes.filter(node => node.id === courseName)
		if (node[0] === undefined) {
			openDesc(false, "Course not found!");
		}
		else {
			const courseData = node[0]
			props.handleSingleClick(courseData)
		}
		document.getElementById('search-bar').value = '';
		document.getElementById('search-bar').blur();
		removeSuggestions();
	}

	function handleKeyDown(key) {
		if(key.keyCode === 13) {
			const courseName = document.getElementById('search-bar').value.split(' ')[0];
      handleSearchSubmit(courseName);
    }
	}

	const handleFilterChoices = useCallback(() => {
		displaySuggestions();
		let matchedChoices = [];
		let input = document.getElementById('search-bar').value;
		if (input.length) {
			matchedChoices = availableChoices.filter(course => {
				const courseText = course.courseCode.toLowerCase() + ' ' + course.title.toLowerCase();
				return courseText.includes(input.toLowerCase())
			})
		} else if (input.length === 0) {
			matchedChoices = availableChoices;
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
					const courseText = course.courseCode + ' ' + course.title
					const courseCode = course.courseCode;
					return <li key={courseCode} className={'course-choices'}
						onClick={() => handleSearchSubmit(courseCode)} onMouseDown={() => event.preventDefault()}>{courseText}</li>;
				})}
			</ul>
		}
		setAutoComplete(content);
	}, [graphData])

	return (
	<>
	<div id='search' className='search-container'>
		<input id='search-bar' className='search-bar' type="text" placeholder='Enter a course name'
		onKeyDown={handleKeyDown} autoComplete='off' onFocus={handleFilterChoices} onBlur={removeSuggestions}
		onKeyUp={handleFilterChoices}/>
		{
			toggleSuggestions
			? <HiChevronUp id='search-collapse' className='search-collapse' onClick={removeSuggestions} />
			: <HiChevronDown id='search-expand' className='search-expand' onClick={() =>{
				displaySuggestions();
				document.getElementById('search-bar').focus();
			}} />
		}
	</div>
	<div id='search-suggestions' className='search-suggestions'>
			{autoComplete}
		</div>
	</>
	
	)
}

export default Search