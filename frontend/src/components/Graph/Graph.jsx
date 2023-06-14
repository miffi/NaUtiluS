import React, { useState } from "react";
import ForceGraph2D from 'react-force-graph-2d';
import './graph.css';

function Graph(props) {
    const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
    const [displayHeight, setDisplayHeight] = useState(window.innerHeight);
    
    const [modError, setModError] = useState(null);
    const [modLoading, setModLoading] = useState(true);

    const fgRef = props.graphRef;

    window.addEventListener('resize', () => {
    setDisplayWidth(window.innerWidth);
    setDisplayHeight(window.innerHeight);
    });

    async function fetchCourseInfo(node) {
        let modURI = "https://api.nusmods.com/v2/2022-2023/modules/"+node.id+".json";

        await fetch(modURI)
            .then(response => {
                if (response.ok){
                    return response.json();
                }
                throw response;
            })
            .then(data => {
                props.openDesc(true, data)
                console.log(data);
            })
            .catch(error => {
                console.error("Error fetching course data: ", error);
                setModError(error);
            })
            .finally(() => {
                setModLoading(false);
            });
        
    }
    
    if (props.loading) return <div className="loading-fetch">Fetching Graph Data...</div>;
    if (props.error) return <div className="loading-error">Error! Failed to fetch graph data</div>;

    return <ForceGraph2D
        ref={fgRef}
        className='force-graph-2D'
        graphData={props.graphData}
        width={displayWidth}
        height={displayHeight}
        nodeAutoColorBy="group"
        backgroundColor='#424242'
        nodeVal={50}
        linkDirectionalArrowLength = {
            link => link.preclusion ? 0 : 5
        }
        linkColor = {
            link => link.preclusion ? "#80deea" : "#e0e0e0"
        }
        linkDirectionalArrowColor = {
            link => "#757575"
        }
        nodeRelSize={50}
        nodeCanvasObject = {
            (node, ctx, globalScale) => {
            if (node.group === 2) {
                ctx.fillStyle = '#e0e0e0';
                ctx.beginPath();
                ctx.ellipse(node.x, node.y, 10/globalScale, 10/globalScale, 0, 0, 2 * Math.PI);
                ctx.fill();
                node.__radius = 10/globalScale;
                return;
            }
            const label = node.id;
            const fontSize = 17/globalScale;

            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

            ctx.fillStyle = node.color;
            ctx.beginPath()
            ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions, 1.5);
            ctx.fill()

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#424242';
            ctx.fillText(label, node.x, node.y);

            node.__bckgDimensions = bckgDimensions;
            }
        }
        nodePointerAreaPaint = {
            (node, color, ctx) => {
            if (node.group === 2) {
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
        onNodeClick={(node) => {
            fgRef.current.centerAt(props.toggleFilter ? node.x - 20 : node.x, node.y + 14, 400);
            props.setXCoor(props.toggleFilter ? node.x - 20 : node.x);
            props.setYCoor(node.y + 14);
            fgRef.current.zoom(7, 400);
            node.cluster === false
            ? fetchCourseInfo(node)
            : props.openDesc(false, "Not a module");
        }}
        onBackgroundClick={(event) => {
            props.closeDesc();
            fgRef.current.centerAt(props.toggleFilter ? -20 : 0, 0, 400);
            props.setXCoor(props.toggleFilter ? -20 : 0);
            props.setYCoor(0);
            fgRef.current.zoom(1, 400);
        }}
    />
}

export default Graph;