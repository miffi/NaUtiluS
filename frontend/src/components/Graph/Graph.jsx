import React, { useCallback, useEffect, useState } from "react";
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide, forceManyBody, forceLink} from 'd3-force-3d'
// import debounce from 'lodash.debounce'

import './graph.css';

function Graph(props) {
	const fgRef = props.graphRef;
	const nodeSet = props.nodeSet;
	const linkSet = props.linkSet;
	const updateNodeSet = props.updateNodeSet;
	const updateLinkSet = props.updateLinkSet;

	const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
	const [displayHeight, setDisplayHeight] = useState(window.innerHeight);

	const hoverNode = props.hoverNode;
	const clickNode = props.clickNode;
	const	setHoverNode = props.setHoverNode;
	const	setClickNode = props.setClickNode;

	// const [dblclickNode, setDblclickNode] = useState(null);

	// handle window resize
	window.addEventListener('resize', () => {
		setDisplayWidth(window.innerWidth);
		setDisplayHeight(window.innerHeight);
	});

	useEffect(() => {
		if (props.graphData) {
			fgRef.current
			.d3Force('charge', forceManyBody().strength(node => node.cluster === true ? -10 : -100))
			.d3Force('link', forceLink().distance(link => link.target.cluster === true ? 40 : link.source.cluster === true ? 70 : 50))
			.d3Force('collide', forceCollide(30).strength(0.3))
		}
	}, [props.graphData]);

	async function updateRightClick(neighbourObj) {
		await fetch(props.expandNodeURI, {
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
			// console.log(props.graphData)
			// console.log('sets before:')
			// console.log(nodeSet)
			// console.log(linkSet)
			// console.log('data received from expandNode.json:')
			// console.log(data)
			const expandNodes = data.nodes;
			const expandLinks = data.links;
			const newNodes = [];
			const newLinks = [];
			if (expandNodes === null || expandLinks === null) return;
			expandNodes.forEach(node => {
				if (!nodeSet.has(node.id)) {
					nodeSet.add(node.id);
					// console.log('nodeSet updated: Added ' + node.id)
					// console.log(nodeSet)
					newNodes.push(node);
				}
			})
			updateNodeSet(nodeSet)
			expandLinks.forEach(link => {
				if (!linkSet.has(JSON.stringify(link))) {
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
			props.setGraphData(({nodes, links}) => {
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

		const neighborsTo = props.graphData.links
			.filter(link => link.source === node)
			.map(link => link.target.id)
		const neighborsFrom = props.graphData.links
			.filter(link => link.target === node)
			.map(link => link.source.id)
		const neighbors = neighborsTo.concat(neighborsFrom)
		
		const object = {
			name: name,
			neighbors: neighbors
		}
		
		updateRightClick(object)

	}

	const nodeStyle = useCallback(
		(node, ctx, globalScale) => {
			if (node.cluster === true) {
				ctx.fillStyle = props.highlightNodes.has(node) ? '#77ddff' : '#e0e0e0';
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
				: props.highlightNodes.has(node) ? '#11dddd'
				: '#9bc';
			ctx.beginPath()
			ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions, 5/globalScale);
			ctx.fill()

			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = '#424242';
			ctx.fillText(label, node.x, node.y);

			node.__bckgDimensions = bckgDimensions;
		}, [hoverNode, clickNode])

	// handle graph loading and error
	if (props.graphData == null) {
		if (props.loading) return <div className="loading-fetch">Fetching Graph Data...</div>;
		if (props.error) return <div className="loading-error">Error! Failed to fetch graph data</div>;
	}
		return <ForceGraph2D
		ref={fgRef}
		className='force-graph-2D'
		graphData={props.graphData}
		width={displayWidth}
		height={displayHeight}
		maxZoom={10}
		cooldownTicks={200}
		// nodeAutoColorBy="faculty"
		backgroundColor='#787878'
		nodeVal={50}
		linkDirectionalArrowLength={
			link => {
				return link.target.cluster === true ? 0 : 10
			}
		}
		linkColor={
			link => link.target.cluster === true ? "#80deea" : "#e0e0e0"
		}
		linkDirectionalArrowColor={
			() => "#ffffff"
		}
		linkDirectionalParticles={4}
		linkDirectionalParticleSpeed={0.005}
		linkDirectionalParticleWidth={link => props.highlightLinks.has(link) ? 4 : 0}
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
			props.handleSingleClick(node);
		}}
		onNodeRightClick={ node =>{
			// console.log('Right click')
			handleRightClick(node)
		}}
		onNodeHover={node => {
			setHoverNode(node || null);
		}}
		onBackgroundClick={() => {
			props.closeDesc();
			setHoverNode(null);
			setClickNode(null);
			props.highlightNodes.clear();
			props.highlightLinks.clear();
			props.updateHighlight();
			// fgRef.current.centerAt(props.toggleFilter ? -20 : 0, 0, 400);
			// props.setXCoor(props.toggleFilter ? -20 : 0);
			// props.setYCoor(0);
		}}
	/>
}

export default Graph;