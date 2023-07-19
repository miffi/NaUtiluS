import React from 'react'
import './help.css'
import clickNode from './clickNode.png'
import hoverNode from './hoverNode.png'
import relationshipNode from './relationshipNode.png'
import clusterNode from './clusterNode.png'
import courseNode from './courseNode.png'
import chosenNode from './chosenNode.png'
import courseNodeDim from './courseNodeDim.png'
import chosenNodeDim from './chosenNodeDim.png'
import choiceRelationship from './choiceRelationship.png'
import requirementRelationship from './requirementRelationship.png'
import departmentAutoColor from './departmentAutoColor.png'

function Help() {
	return (
		<div className='menu-help' id='help'>
			<h1>Help</h1>
			<h3>What is this app?</h3>
			<p>This is NaUtiluS. A graph of all prerequisite relationships between NUS courses.</p>
			<h3>What is a graph?</h3>
			<p>A graph is collection of nodes, with relationships between the nodes
				represented by lines. The relationships can be directed (with arrowheads) or undirected.</p>
			<h3>What does each element represent?</h3>
			<h4>Nodes</h4>
			<div style={{display: 'flex', alignItems: 'center'}}>
				<img className='image' src={courseNode} alt="courseNode.png" />
				<p className='label'>Course nodes represent NUS courses</p>
			</div>
			<div style={{display: 'flex', alignItems: 'center'}}>
				<img className='image' src={clusterNode} alt="clusterNode.png" />
				<p className='label'>Cluster nodes represent choices of courses that is required to take another course</p>
			</div>
			<div style={{display: 'flex', alignItems: 'center'}}>
				<img className='image2' src={departmentAutoColor} alt="departmentAutoColor.png" />
				<p className='label'>Course nodes are auto-colored by departments</p>
			</div>
			<h4>Relationships</h4>
			<div style={{display: 'flex', alignItems: 'center'}}>
				<img className='image' src={requirementRelationship} alt="requirementRelationship.png" />
				<p className='label'>Directed relationships mean the source node is a requirement for the target node</p>
			</div>
			<div style={{display: 'flex', alignItems: 'center'}}>
				<img className='image' src={choiceRelationship} alt="choiceRelationship.png" />
				<p className='label'>Undirected relationships mean a course node is part of a cluster of choices</p>
			</div>
			<h3>How to use this app?</h3>
			<p>
				First, put in a filter. On initial load, there is a default filter given as an example.
				After that you can interact with the graph:
				<ul>
          <li>Zoom with the scroll wheel</li>
					<li>Left click and drag to drag nodes around</li>
					<li>Left click nodes to show a description</li>
					<li>Right click nodes to expand all of its direct relationships</li>
				</ul>
				Left-clicking on a node will highlight surrounding nodes:
				<div style={{display: 'flex', alignItems: 'center'}}>
					<img className='image' src={hoverNode} alt="hoverNode.png" />
					<p className='label'>Hovered course node is highlighted yellow</p>
				</div>
				<div style={{display: 'flex', alignItems: 'center'}}>
					<img className='image' src={clickNode} alt="clickNode.png" />
					<p className='label'>Clicked course node is highlighted green</p>
				</div>
				<div style={{display: 'flex', alignItems: 'center'}}>
					<img className='image' src={relationshipNode} alt="relationshipNode.png" />
					<p className='label'>Required courses of a clicked course node will be highlighted blue</p>
				</div>
			</p>
			<h3>How to use the filter?</h3>
			<p>
				Currently there are four options in the filter, which will be applied only when the Apply button is clicked:
				<ul>
					<li>Departments: show courses only from specified departments</li>
					<li>Finished Courses: show only the selected courses and their relationships</li>
					<li>Limit: limits the number of outward relationships from the selected finished courses</li>
					<li>Semester: dims courses that are not available on the chosen semester</li>
				</ul>
				For the filters, there will be additional node highlighting and dimming:
				<div style={{display: 'flex', alignItems: 'center'}}>
					<img className='image' src={chosenNode} alt="chosenNode.png" />
					<p className='label'>Courses selected in Finished Courses will be highlighted white</p>
				</div>
				<div style={{display: 'flex', alignItems: 'center'}}>
					<img className='image' src={chosenNodeDim} alt="chosenNodeDim.png" />
					<p className='label'>Courses selected in Finished Courses will be dimmed light grey if unavailable in the current semester</p>
				</div>
				<div style={{display: 'flex', alignItems: 'center'}}>
					<img className='image' src={courseNodeDim} alt="courseNodeDim.png" />
					<p className='label'>Normal course nodes will be dimmed dark grey if unavailable in the current semester</p>
				</div>
			</p>
			
		</div>
	)
}

export default Help
