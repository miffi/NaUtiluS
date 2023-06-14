import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import Sidebar from './components/Sidebar/Sidebar';
import Graph from './components/Graph/Graph';


function App() {
    // variables to store URI of important links
    const graphURI = process.env.REACT_APP_BACKEND_HOSTNAME + "/v1/fullGraph.json";

    // variables to handle toggle of Filter and Description sidebars
    const [toggleFilter, setToggleFilter] = useState(false);
    const [toggleDesc, setToggleDesc] = useState(false);

    // variables to handle fetching graph data
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // variables to set center of graph
    const [xCoor, setXCoor] = useState(0);
    const [yCoor, setYCoor] = useState(0);
    const graphRef = useRef();

    // function to close Filter sidebar
    function closeFilter() {
        maximizeFilter();
        setToggleFilter(false);
        document.getElementById('filter').style.left = '-70%';

        graphRef.current.centerAt(xCoor + 20, yCoor, 200)
        setXCoor(xCoor + 20);
    }

    // function to open Filter sidebar
    function openFilter() {
        if (toggleDesc) {
            minimizeFilter();
        }
        setToggleFilter(true);
        document.getElementById('filter').style.left = '100px';

        graphRef.current.centerAt(xCoor - 20, yCoor, 200)
        setXCoor(xCoor - 20);
    }

    // function to close Description sidebar
    function closeDesc() {
        if (toggleFilter) {
            maximizeFilter();
        }
        setToggleDesc(false);
        document.getElementById('description').style.bottom = '-100%';
    }

    // function to open Description sidebar
    function openDesc(isCourse, content) {
        if (toggleFilter) {
            minimizeFilter();
        }
        setToggleDesc(true);
        document.getElementById('description').style.bottom = '0';

        // handle course information
        if (isCourse === false) {
            document.getElementById('description_header').innerHTML = "Course Information";
            document.getElementById('description_placeholder').style.display = "block";
            document.getElementById('description_content').style.display = "none";
            document.getElementById('description_placeholder').innerHTML = content
        } else {
            document.getElementById('description_header').innerHTML = content.title;
            document.getElementById('description_placeholder').style.display = "none";
            document.getElementById('description_content').style.display = "block";
            document.getElementById('course_info').innerHTML = content.description;
            document.getElementById('semester_content').innerHTML = content.semesterData;
        }
        
    }

    // function to set Filter sidebar height to half when Description is open
    function minimizeFilter() {
        document.getElementById('filter').style.height = '50%';
    }

    // function to return Filter sidebar to its original size
    function maximizeFilter() {
        document.getElementById('filter').style.height = '100%';
    }

    // fetch data from backend
    useEffect(() => {
        fetch(graphURI)
        .then(response => {
            if (response.ok){
                return response.json();
            }
            throw response;
        })
        .then(data => {
            setData(data);
        })
        .catch(error => {
            console.error("Error fetching graph data: ", error);
            setError(error);
        })
        .finally(() => {
            setLoading(false);
        })
        }, [graphURI]);

    // pass on variables to props for other components  
    let props = {
        graphURI: graphURI,

        graphData: data,
        error: error,
        loading: loading,
        setData: setData,
        setError: setError,
        setLoading: setLoading,

        toggleDesc: toggleDesc,
        toggleFilter: toggleFilter,
        setToggleDesc: setToggleDesc,
        setToggleFilter: setToggleFilter,
        closeFilter: closeFilter,
        openFilter: openFilter,
        closeDesc: closeDesc,
        openDesc: openDesc,
        maximizeFilter: maximizeFilter,
        minimizeFilter: minimizeFilter,

        graphRef: graphRef,
        xCoor: xCoor,
        yCoor: yCoor,
        setYCoor: setYCoor,
        setXCoor: setXCoor
    }
    return (
        <div className='App'>
        <Sidebar {...props}/>
        <Graph {...props}/>
        </div>
    )
}

export default App;
