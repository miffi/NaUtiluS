import React, { useCallback, useEffect, useState } from "react";
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide } from 'd3-force-3d'

import './graph.css';


function Graph(props) {
	const expandNodeURI = props.expandNodeURI;

	const graphData = props.graphData;
	const loading = props.graphLoading;
	const error = props.graphError;
	const setGraphData = props.setGraphData;

	const fgRef = props.graphRef;
	const nodeSet = props.nodeSet;
	const linkSet = props.linkSet;
	const updateNodeSet = props.updateNodeSet;
	const updateLinkSet = props.updateLinkSet;

	const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
	const [displayHeight, setDisplayHeight] = useState(window.innerHeight);

	const hoverNode = props.hoverNode;
	const clickNode = props.clickNode;
	const setHoverNode = props.setHoverNode;
	const setClickNode = props.setClickNode;

	const highlightLinks = props.highlightLinks;
	const highlightNodes = props.highlightNodes;
	const updateHighlight = props.updateHighlight;

	const closeDesc = props.closeDesc;
	const handleSingleClick = props.handleSingleClick;
	const presentCourses = props.presentCourses;
	const presentDepartments = props.presentDepartments;
	const semesterFilter = props.semesterFilter;
	const expandAll = props.expandAll;

	// const [dblclickNode, setDblclickNode] = useState(null);

	// handle window resize
	window.addEventListener('resize', () => {
		setDisplayWidth(window.innerWidth);
		setDisplayHeight(window.innerHeight);
	});

	useEffect(() => {
		if (graphData) {
			fgRef.current.zoom(4.5)
			fgRef.current.d3Force('link').distance((link) => link.target.cluster ? 10 : 30).strength(0.4);
			fgRef.current.d3Force('collide', forceCollide(10).strength(0.20));
		}
	}, [])

	async function updateRightClick(neighbourObj) {
		await fetch(expandNodeURI, {
			method: 'POST',
			body: JSON.stringify(neighbourObj)
		})
		.then(response => {
			if (!response.ok) {
				throw new Error("HTTP status " + response.status);
			}
			return response.json();
		})
		.then(data => {
			const expandNodes = data.nodes;
			const expandLinks = data.links;
			const newNodes = [];
			const newLinks = [];
			if (expandNodes === null || expandLinks === null) {
				window.alert("Node can no longer be expanded");
				return;
			}
			expandNodes.forEach(node => {
				if (!nodeSet.has(node.id) && expandAll || (presentDepartments.length === 0 || presentDepartments.includes(node.department) || node.department === '')) {
					nodeSet.add(node.id);
					// console.log('nodeSet updated: Added ' + node.id)
					// console.log(nodeSet)
					newNodes.push(node);
				}
			})
			updateNodeSet(nodeSet)
			expandLinks.forEach(link => {
				if (!linkSet.has(JSON.stringify(link)) && expandAll || (nodeSet.has(link.target) && nodeSet.has(link.source))) {
					linkSet.add(JSON.stringify(link))
					// console.log('linkSet updated: Added ' + link)
					// console.log(linkSet)
					newLinks.push(link)
				}
			})
			updateLinkSet(linkSet);
			// console.log('nodes and links to be added:' + JSON.stringify(newNodes))
			// console.log(newNodes);
			// console.log(newLinks)
			if (newNodes.length === 0 || newLinks.length === 0) {
				window.alert("Node can no longer be expanded");
				return;
			}
			setGraphData(({nodes, links}) => {
				return {
					nodes: [...nodes, ...newNodes],
					links: [...links, ...newLinks]
				};
			});
			// console.log('sets after')
			// console.log(nodeSet);
			// console.log(linkSet)
		})
	}

	function handleRightClick(node) {
		const name = node.id;

		const neighborsTo = graphData.links
			.filter(link => link.source === node)
			.map(link => link.target.id)
		const neighborsFrom = graphData.links
			.filter(link => link.target === node)
			.map(link => link.source.id)
		const neighbors = neighborsTo.concat(neighborsFrom)
		
		const object = {
			name: name,
			neighbors: neighbors,
			semester: semesterFilter
		}
		
		updateRightClick(object)
	}

	const nodeStyle = useCallback(
		(node, ctx, globalScale) => {
			if (node.cluster === true) {
				ctx.fillStyle = highlightNodes.has(node) ? '#77ddff' : '#e0e0e0';
				ctx.beginPath();
				ctx.ellipse(node.x, node.y, 10 / globalScale, 10 / globalScale, 0, 0, 2 * Math.PI);
				ctx.fill();
				node.__radius = 10 / globalScale;
				return;
			}
			const label = node.id;
			const fontSize = 17 / globalScale;

			ctx.font = `${fontSize}px Sans-Serif`;
			const textWidth = ctx.measureText(label).width;
			const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

			ctx.fillStyle =
				node === clickNode ? '#00ff00'
				: node === hoverNode ? '#ffff00'
				: highlightNodes.has(node) ? '#11dddd'
				: semesterFilter ? node.indirect
					? presentCourses.includes(node.id) ? '#bbbbbb' : '#666666'
					: presentCourses.includes(node.id) ? '#ffffff' : node.color
				: presentCourses.includes(node.id) ? '#ffffff' : node.color;
			ctx.beginPath()
			ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions, 5/globalScale);
			ctx.fill()

			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = '#424242';
			ctx.fillText(label, node.x, node.y);

			node.__bckgDimensions = bckgDimensions;
		}, [hoverNode, clickNode, graphData])

	// handle graph loading and error
	if (graphData == null) {
		if (loading) return <div className="loading-fetch">Fetching Graph Data...</div>;
		if (error) return <div className="loading-error">Error! Failed to fetch graph data</div>;
	}
		return <ForceGraph2D
		ref={fgRef}
		className='force-graph-2D'
		graphData={graphData}
		width={displayWidth}
		height={displayHeight}
		maxZoom={10}
		cooldownTicks={200}
		nodeAutoColorBy="department"
		backgroundColor='#787878'
		nodeVal={50}
		linkDirectionalArrowLength={
      () => 5
    }
		linkColor={
			link => link.target.cluster ? "#80deea" : "#e0e0e0"
		}
    linkCurvature={0.20}
		linkDirectionalArrowColor={
			link => link.target.cluster ? "#80deea": "#e0e0e0"
		}
		linkDirectionalParticles={4}
		linkDirectionalParticleSpeed={0.005}
		linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 4 : 0}
		nodeRelSize={50}
		nodeCanvasObject={nodeStyle}
		nodePointerAreaPaint={
			(node, color, ctx) => {
				if (node.cluster === true) {
					const radius = node.__radius;
					ctx.fillStyle = color;
					ctx.beginPath();
					ctx.ellipse(node.x, node.y, radius, radius, 0, 0, 2 * Math.PI);
					ctx.fill();
					return;
				}
				ctx.fillStyle = color;
				const bckgDimensions = node.__bckgDimensions;
				bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
			}
		}
		onNodeClick={node => {
			// console.log('Single click');
			handleSingleClick(node);
		}}
		onNodeRightClick={ node =>{
			// console.log('Right click')
			handleRightClick(node)
		}}
		onNodeHover={node => {
			setHoverNode(node || null);
		}}
		onBackgroundClick={() => {
			closeDesc();
			setHoverNode(null);
			setClickNode(null);
			highlightNodes.clear();
			highlightLinks.clear();
			updateHighlight();
		}}
	/>
}

export default Graph;
