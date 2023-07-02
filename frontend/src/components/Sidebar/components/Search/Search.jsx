import React from 'react';
import './search.css';
import { HiSearch } from "react-icons/hi"

function Search(props) {

	function handleSearchSubmit() {
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
	}

	function handleKeyDown(key) {
		if(key.keyCode === 13) {
      handleSearchSubmit();
    }
	}

	return (
	<div id='search' className='search-container'>
		<input id='search-bar' className='search-bar' type="text" placeholder='Enter a course name' onKeyDown={handleKeyDown} />
		<HiSearch id='search-execute' className='search-execute' onClick={handleSearchSubmit} />
	</div>	
	)
}

export default Search