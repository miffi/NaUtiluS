import React from 'react';
import './App.css';

import Sidebar from './components/Sidebar/Sidebar';
import Graph from './components/Graph/Graph';


function App() {
  return (
    <div className='App'>
      <Sidebar />
      <Graph />
    </div>
  )
}

export default App;
