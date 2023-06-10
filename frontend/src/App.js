import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import Sidebar from './components/Sidebar/Sidebar';
import Graph from './components/Graph/Graph';


function App() {
  const graphURI = process.env.REACT_APP_BACKEND_HOSTNAME + "/v1/fullGraph.json"
  const filterURI = process.env.REACT_APP_BACKEND_HOSTNAME + "/v1/filter.json"

  const [toggleFilter, setToggleFilter] = useState(false);
  const [toggleDesc, setToggleDesc] = useState(false);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [xCoor, setXCoor] = useState(0);
  const [yCoor, setYCoor] = useState(0);
  const graphRef = useRef();

  function closeFilter() {
    maximizeFilter();
    setToggleFilter(false);
    document.getElementById('filter').style.left = '-40%';

    graphRef.current.centerAt(xCoor + 20, yCoor, 200)
    setXCoor(xCoor + 20);
  }
  function openFilter() {
      if (toggleDesc) {
          minimizeFilter();
      }
      setToggleFilter(true);
      document.getElementById('filter').style.left = '100px';

      graphRef.current.centerAt(xCoor - 20, yCoor, 200)
      setXCoor(xCoor - 20);
  }
  function closeDesc() {
      if (toggleFilter) {
          maximizeFilter();
      }
      setToggleDesc(false);
      document.getElementById('description').style.bottom = '-42%';
  }
  function openDesc(text) {
      if (toggleFilter) {
          minimizeFilter();
      }
      setToggleDesc(true);
      document.getElementById('description').style.bottom = '0';
      document.getElementById('description_content').innerHTML = text;
  }
  function minimizeFilter() {
      document.getElementById('filter').style.height = '60%';
  }

  function maximizeFilter() {
      document.getElementById('filter').style.height = '100%';
  }

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

  let props = {
    graphURI: graphURI,
    filterURI: filterURI,

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
