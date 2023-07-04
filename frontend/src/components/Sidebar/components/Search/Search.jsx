import React, { useState } from 'react';
import './search.css';
import { HiSearch, HiChevronUp } from "react-icons/hi"

function Search(props) {
	const availableChoices = props.listOfCourses;
	const [autoComplete, setAutoComplete] = useState([])

	function handleSearchSubmit() {
		if (props.graphData === null) {
			window.alert("The server is currently down, please try again later");
			return;
		}
		const courseName = document.getElementById('search-bar').value
		const node = props.graphData.nodes.filter(node => node.id === courseName)
		if (node[0] === undefined) {
			props.openDesc(false, "Course not found!");
		}
		else {
			const courseData = node[0]
			props.graphRef.current.centerAt(props.toggleFilter ? courseData.x - 20 : courseData.x, courseData.y + 14, 400);
			props.setXCoor(props.toggleFilter ? courseData.x - 20 : courseData.x);
			props.setYCoor(courseData.y + 14);
			props.graphRef.current.zoom(7, 400);
			courseData.cluster === false
					? props.fetchCourseInfo(courseData)
					: props.openDesc(false, "Not a course node");
		}
		document.getElementById('search-bar').value = '';
	}

	function handleKeyDown(key) {
		if(key.keyCode === 13) {
      handleSearchSubmit();
    }
	}

	function displaySuggestions() {
		props.setToggleSuggestions(true);
		document.getElementById('search-suggestions').style.display = 'block';
	}

	function substituteContent(list) {
		document.getElementById('search-bar').value = list;
		props.removeSuggestions()
	}

	const removeSuggestions = props.removeSuggestions;

	function handleFilterChoices() {
		let matchedChoices = [];
		let input = document.getElementById('search-bar').value;
		if (input.length) {
			displaySuggestions();
			matchedChoices = availableChoices.filter(choice => choice.toLowerCase().includes(input.toLowerCase()))
		}
		if (input.length === 0 || !matchedChoices.length) {
			removeSuggestions();
		}
		const content =
		<ul>
			{matchedChoices.map(course => {
			return <li key={course} onClick={() => substituteContent(course)}>{course}</li>;
		})}
		</ul>
		setAutoComplete(content);
	}

	return (
	<>
	<div id='search' className='search-container'>
		<input id='search-bar' className='search-bar' type="text" placeholder='Enter a course name'
		onKeyDown={handleKeyDown} autoComplete='off'
		onKeyUp={handleFilterChoices}/>
		{
			props.toggleSuggestions
			? <HiChevronUp id='search-minimize' className='search-minimize' onClick={props.removeSuggestions} />
			: <HiSearch id='search-execute' className='search-execute' onClick={handleSearchSubmit} />
		}
	</div>
	<div id='search-suggestions' className='search-suggestions'>
			{autoComplete}
		</div>
	</>
	
	)
}

export default Search