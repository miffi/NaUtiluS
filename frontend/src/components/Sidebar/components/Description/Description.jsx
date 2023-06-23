import React from 'react';
import './description.css';

function CourseInfo() {
	return (
			<div className='course-info'>
				<h1 id='description_header' className='description-header'>Course Information</h1>
				<div id='description_placeholder' className='description-placeholder'></div>
				<div id='description_content' className='description-content'>
					<div id='course_info' className='course-info'>
						Hello
					</div><br />
					<div id='course_semester' className='course-semester'>
						<div id='semester_label'>Semester</div>
						<div id='semester_content'>1, 2</div>
					</div><br />
				</div>
			</div>
	);
}

function Search(props) {
	function handleSearchSubmit() {
		const courseName = document.getElementById('searchbar').value
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

	return (
		<>
			<h3 className='search-header'>Search</h3>
			<input id='searchbar' className='searchbar' type="text" placeholder='Enter a course name' />
			<button onClick={handleSearchSubmit}>Search</button>
		</>
		
	);
}

function Description(props) {
	return (
		<div className="menu-description" id="description">
			<Search {...props}/>
			<CourseInfo />
		</div>
	);
}

export default Description;