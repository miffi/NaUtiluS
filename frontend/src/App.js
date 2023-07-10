import React, { useRef, useState, useEffect } from 'react'
import './App.css'
import oldData from './exampledata.json';

import Sidebar from './components/Sidebar/Sidebar'
import Graph from './components/Graph/Graph'

function App() {
	
	// variables to store URI of important links
	const graphURI = process.env.REACT_APP_BACKEND_HOSTNAME + '/v1/fullGraph.json'
	const filterURI = process.env.REACT_APP_BACKEND_HOSTNAME + '/v1/filter.json'
	const courseSummaryURI = process.env.REACT_APP_BACKEND_HOSTNAME + '/v1/courseSummary.json'
	const departmentsURI = process.env.REACT_APP_BACKEND_HOSTNAME + '/v1/departments.json'

	// variables to handle toggle of Filter and Description sidebars
	const [toggleFilter, setToggleFilter] = useState(false)
	const [toggleDesc, setToggleDesc] = useState(false)
	const [toggleSearch, setToggleSearch] = useState(false)

	// variables to set center of graph
	const [xCoor, setXCoor] = useState(0);
	const [yCoor, setYCoor] = useState(0);
	const graphRef = useRef();

	// function to close Filter sidebar
	function closeFilter() {
		setToggleFilter(false);
		document.getElementById('filter').style.left = '-220px';
	}

	// function to open Filter sidebar
	function openFilter() {
		if (toggleDesc) {
			minimizeFilter();
		}
		setToggleFilter(true);
		document.getElementById('filter').style.left = '70px';
	}

	// function to close Description sidebar
	function closeDesc() {
		maximizeFilter();
		setToggleDesc(false);
		document.getElementById('description').style.top = '100%';
	}

	// function to open Description sidebar
	function openDesc(isCourse, content) {
		if (toggleFilter) {
			minimizeFilter();
		}
		setToggleDesc(true);
		document.getElementById('description').style.top = '55%';

		// handle course information
		if (isCourse === false) {
			document.getElementById('description_header').innerHTML = "Course Information";
			document.getElementById('description_placeholder').style.display = "block";
			document.getElementById('description_content').style.display = "none";
			document.getElementById('description_placeholder').innerHTML = content
		} else {
			const title = content.courseCode + " " + content.title
			const description = content.description;
			// const semesters = content.semesterData
			// 	.map(sem => sem.semester === 1 || sem.semester === 2
			// 			? "Semester " + sem.semester
			// 			: sem.semester === 3
			// 			? "Special Semester 1"
			// 			: sem.semester === 4
			// 			? "Special Semester 2"
			// 			: "Unspecified")
			// 	.reduce(
			// 		(accumulator, currentValue) => accumulator + ", " + currentValue
			// 	)
			const prereqs = content.prerequisite;

			document.getElementById('description_header').innerHTML = title;
			document.getElementById('description_placeholder').style.display = "none";
			document.getElementById('description_content').style.display = "block";
			document.getElementById('course_info').innerHTML = description;
			// document.getElementById('semester_content').innerHTML = semesters;
			document.getElementById('prereq_content').innerHTML = prereqs;
		}
	}

	// function to set Filter sidebar height to half when Description is open
	function minimizeFilter() {
		document.getElementById('filter').style.height = '55%';
	}

	// function to return Filter sidebar to its original size
	function maximizeFilter() {
		document.getElementById('filter').style.height = '100%';
	}

	// function to close Search sidebar
	function closeSearch() {
		setToggleSearch(false);
		document.getElementById('search').style.top = '-55px';
	}

	// function to open Search sidebar
	function openSearch() {
		setToggleSearch(true);
		document.getElementById('search').style.top = '25px';
	}

	// fetch graph data from backend
	const [graphData, setGraphData] = useState(null);
	const [graphError, setGraphError] = useState(null);
	const [graphLoading, setGraphLoading] = useState(true);
	const initialFilter = {
		departments: ["Computer Science"],
		courses: ["CS1010"],
		semester: "",
		limit: 2
	}
	useEffect(() => {
		fetch(props.filterURI, {
			method: 'POST',
			body: JSON.stringify(initialFilter)
		})
		.then(response => {
			console.log(response.status);
			if (!response.ok) {
				throw new Error("HTTP status " + response.status);
			}
			return response.json();
		})
		.then(data => {
			console.log(data);
			props.setGraphData(data)
		});
	}, [])

	// fetch list of courses from nusmods
	const [courses, setCourses] = useState(null)
	const [coursesError, setCoursesError] = useState(null)
	const [coursesLoading, setCoursesLoading] = useState(true)
	useEffect(() => {
		fetch(courseSummaryURI)
			.then(response => {
				if (response.ok) {
					console.log("course data received");
					return response.json();
				}
				throw response;
			})
			.then(data => {
				setCourses(data);
				console.log(data);
			})
			.catch(error => {
				console.error("Error fetching courses list data: ", error);
				setCoursesError(error);
			})
			.finally(() => {
				setCoursesLoading(false);
			})
	}, []);

	// fetch list of departments from nusmods
	const [departments, setDepartments] = useState(null)
	const [departmentsError, setDepartmentsError] = useState(null)
	const [departmentsLoading, setDepartmentsLoading] = useState(true)
	useEffect(() => {
		fetch(departmentsURI)
			.then(response => {
				if (response.ok) {
					console.log("departments data received");
					return response.json();
				}
				throw response;
			})
			.then(data => {
				setDepartments(data);
				console.log(data);
			})
			.catch(error => {
				console.error("Error fetching departments list data: ", error);
				setDepartmentsError(error);
			})
			.finally(() => {
				setDepartmentsLoading(false);
			})
	}, []);

	// fetch course information from nusmods
	async function fetchCourseInfo(node) {
		let courseURI = process.env.REACT_APP_BACKEND_HOSTNAME + '/v1/course/' + node.id + ".json";
		await fetch(courseURI)
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				throw response;
			})
			.then(data => {
				console.log(data);
				openDesc(true, data)
			})
			.catch(error => {
				console.error("Error fetching course data: ", error);
			})
	}

// pass on variables to props for other components  
	let props = {
		oldData: oldData,
		graphURI: graphURI,
		filterURI: filterURI,

		graphData: graphData,
		error: graphError,
		loading: graphLoading,
		setGraphData: setGraphData,
		setError: setGraphError,
		setLoading: setGraphLoading,

		fetchCourseInfo: fetchCourseInfo,

		coursesLoading: coursesLoading,
		coursesError: coursesError,
		departmentsError: departmentsError,
		departmentsLoading: departmentsLoading,
		listOfDepartments: departments,
		listOfCourses: courses,

		toggleDesc: toggleDesc,
		toggleFilter: toggleFilter,
		toggleSearch: toggleSearch,
		setToggleDesc: setToggleDesc,
		setToggleFilter: setToggleFilter,
		setToggleSearch: setToggleSearch,
		
		closeFilter: closeFilter,
		openFilter: openFilter,
		closeDesc: closeDesc,
		openDesc: openDesc,
		closeSearch: closeSearch,
		openSearch: openSearch,
		maximizeFilter: maximizeFilter,
		minimizeFilter: minimizeFilter,

		graphRef: graphRef,
		xCoor: xCoor,
		yCoor: yCoor,
		setYCoor: setYCoor,
		setXCoor: setXCoor
	}
	
	return (
		(courses && departments) &&
		<div className='App'>
			<Sidebar {...props} />
			<Graph {...props} />
		</div>
	)
}

export default App;
