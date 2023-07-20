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
	const expandNodeURI = process.env.REACT_APP_BACKEND_HOSTNAME + "/v1/expandNode.json"

	//states for filter arrays
	const [selectedDepartments, setSelectedDepartments] = useState(['Computer Science'])
	const [selectedCourses, setSelectedCourses] = useState(['CS1010'])

	// variables to handle toggle of Filter and Description sidebars
	const [toggleFilter, setToggleFilter] = useState(false)
	const [toggleDesc, setToggleDesc] = useState(false)
	const [toggleSearch, setToggleSearch] = useState(false)
	const [toggleHelp, setToggleHelp] = useState(false)

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
		maximizeHelp();
		setToggleDesc(false);
		document.getElementById('description-button').style.color = '#9bc';
		document.getElementById('description').style.top = '100%';
	}

	// function to open Description sidebar
	function openDesc(isCourse, content) {
		if (toggleFilter) {
			minimizeFilter();
		}
		if (toggleHelp) {
			minimizeHelp();
		}
		setToggleDesc(true);
		document.getElementById('description-button').style.color = '#eee'
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
			const semesters = content.semesters.join(', ')
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
			document.getElementById('semester_content').innerHTML = semesters;
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

	// function to set Help sidebar height to half when Description is open
	function minimizeHelp() {
		document.getElementById('help').style.height = '55%';
	}

	// function to return Help sidebar to its original size
	function maximizeHelp() {
		document.getElementById('help').style.height = '100%';
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

	// function to close Help sidebar
	function closeHelp() {
		setToggleHelp(false);
		document.getElementById('help').style.right = '-420px';
	}

	// function to open Help sidebar
	function openHelp() {
		if (toggleDesc) {
			minimizeHelp();
		}
		setToggleHelp(true);
		document.getElementById('help').style.right = '0px';
	}

	// fetch graph data from backend
	const [graphData, setGraphData] = useState(null);
	const [graphError, setGraphError] = useState(null);
	const [graphLoading, setGraphLoading] = useState(true);
	const [nodeSet, updateNodeSet] = useState(new Set())
	const [linkSet, updateLinkSet] = useState(new Set())
	const initialFilter = {
		departments: ["Computer Science"],
		courses: ["CS1010"],
		semester: "",
		limit: 2
	}

	useEffect(() => {
		fetch(filterURI, {
			method: 'POST',
			body: JSON.stringify(initialFilter)
		})
		.then(response => {
			// console.log("filter data received, status: " + response.status);
			if (!response.ok) {
				throw new Error("HTTP status " + response.status);
			}
			return response.json();
		})
		.then(data => {
			// console.log(data);
			updateNodeSet(prevNodeSet => {
				prevNodeSet.clear();
				data.nodes.forEach(node => prevNodeSet.add(node.id));
				// console.log(prevNodeSet);
				return prevNodeSet;
			})
			updateLinkSet(prevLinkSet => {
				prevLinkSet.clear();
				data.links.forEach(link => prevLinkSet.add(JSON.stringify(link)));
				// console.log(prevLinkSet);
				return prevLinkSet;
			})
			setGraphData(data);
			// console.log(semesterFilter)
		})
		.catch(error => {
			console.log('Error: failed to fetch graph data: ' + error);
			setGraphError(error);
		})
		.finally(() => setGraphLoading(false));
	}, [])

	// fetch list of courses from nusmods
	const [courses, setCourses] = useState(null)
	const [coursesError, setCoursesError] = useState(null)
	const [coursesLoading, setCoursesLoading] = useState(true)
	useEffect(() => {
		fetch(courseSummaryURI)
			.then(response => {
				if (response.ok) {
					// console.log("course data received");
					return response.json();
				}
				throw response;
			})
			.then(data => {
				setCourses(data);
				// // console.log(data);
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
					// console.log("departments data received");
					return response.json();
				}
				throw response;
			})
			.then(data => {
				setDepartments(data);
				// // console.log(data);
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
				// // console.log(data);
				openDesc(true, data)
			})
			.catch(error => {
				console.error("Error fetching course data: ", error);
			})
	}

	// highlight nodes
	const [hoverNode, setHoverNode] = useState(null);
	const [clickNode, setClickNode] = useState(null);
	const [highlightLinks, setHighlightLinks] = useState(new Set());
	const [highlightNodes, setHighlightNodes] = useState(new Set());

	function handleSingleClick(node) {
		setClickNode(node);
		highlightSurroundings(node);
		setHoverNode(null);
		graphRef.current.centerAt(node.x, node.y + 10, 400);
		setXCoor(node.x);
		setYCoor(node.y + 10);
		node.cluster === false
			? fetchCourseInfo(node)
			: openDesc(false, "Not a course node");
	}

	function highlightSurroundings(node) {
		highlightNodes.clear();
		highlightLinks.clear();
		
		if (node) {
			setClickNode(node);
			graphData.links
				.filter(link => link.target === node)
				.forEach(link => {
					highlightLinks.add(link)
					highlightNodes.add(link.source)
					if (link.source.cluster)  {
						const cluster = link.source
						graphData.links
							.filter(link => link.target === cluster)
							.forEach(link => {
								highlightLinks.add(link);
								highlightNodes.add(link.source);
							})
					}
				});
		}
		updateHighlight();
	}

	function updateHighlight() {
		setHighlightNodes(highlightNodes);
		setHighlightLinks(highlightLinks);
	}

	const [presentCourses, setPresentCourses] = useState(['CS1010']);
	const [presentDepartments, setPresentDepartments] = useState(['Computer Science']);

	const [semesterFilter, setSemesterFilter] = useState('');
	const [expandAll, setExpandAll] = useState(true);

	// pass on variables to props for other components  
	let props = {
		oldData: oldData,
		graphURI: graphURI,
		filterURI: filterURI,
		expandNodeURI: expandNodeURI,

		graphData: graphData,
		graphError: graphError,
		graphLoading: graphLoading,
		setGraphData: setGraphData,
		setError: setGraphError,
		setLoading: setGraphLoading,
		
		nodeSet: nodeSet,
		linkSet : linkSet,
		updateNodeSet: updateNodeSet,
		updateLinkSet: updateLinkSet,

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
		toggleHelp: toggleHelp,
		setToggleDesc: setToggleDesc,
		setToggleFilter: setToggleFilter,
		setToggleSearch: setToggleSearch,
		setToggleHelp: setToggleHelp,
		
		selectedDepartments: selectedDepartments,
		selectedCourses: selectedCourses,
		setSelectedDepartments: setSelectedDepartments,
		setSelectedCourses: setSelectedCourses,
		
		closeFilter: closeFilter,
		openFilter: openFilter,
		closeDesc: closeDesc,
		openDesc: openDesc,
		closeSearch: closeSearch,
		openSearch: openSearch,
		closeHelp: closeHelp,
		openHelp: openHelp,
		maximizeFilter: maximizeFilter,
		minimizeFilter: minimizeFilter,
		maximizeHelp: maximizeHelp,
		minimizeHelp: minimizeHelp,

		graphRef: graphRef,
		xCoor: xCoor,
		yCoor: yCoor,
		setYCoor: setYCoor,
		setXCoor: setXCoor,

		hoverNode: hoverNode,
		clickNode: clickNode,
		highlightLinks: highlightLinks,
		highlightNodes: highlightNodes,
		setHoverNode: setHoverNode,
		setClickNode: setClickNode,
		setHighlightLinks: setHighlightLinks,
		setHighlightNodes: setHighlightNodes,

		handleSingleClick: handleSingleClick,
		highlightSurroundings: highlightSurroundings,
		updateHighlight: updateHighlight,

		presentCourses: presentCourses,
		setPresentCourses: setPresentCourses,
		presentDepartments: presentDepartments,
		setPresentDepartments: setPresentDepartments,

		semesterFilter: semesterFilter,
		setSemesterFilter: setSemesterFilter,

		expandAll: expandAll,
		setExpandAll: setExpandAll
	}

	//check graphData
	// useEffect(() => console.log(graphData), [graphData])
	if (graphLoading || coursesLoading || departmentsLoading) {
		return (
			<div className='loading-window'>
				<div className="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
				<div className='loading-text'>Loading...</div>
			</div>
		)
	}
	return (
		<div className='App'>
			<Sidebar {...props} />
			<Graph {...props} />
		</div>
	)
}

export default App;
