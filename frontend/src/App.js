import React from 'react';
import './App.css';
// import ForceGraph2D from 'react-force-graph-2d';
// import exampleData from './exampledata.json';

import Sidebar from './components/Sidebar/Sidebar';
import Graph from './components/Graph/Graph';

function App() {
  return (
    <div className='App'>
      <Sidebar id='sidebar'/>
      <Graph id='graph'/>
    </div>
  )
}

export default App;
