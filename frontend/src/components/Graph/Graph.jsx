import React from "react";
import ForceGraph2D from 'react-force-graph-2d';
import exampleData from '../../exampledata.json';

import { useState } from "react";

function Graph() {
    const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
    const [displayHeight, setDisplayHeight] = useState(window.innerHeight);

    window.addEventListener('resize', () => {
    setDisplayWidth(window.innerWidth);
    setDisplayHeight(window.innerHeight);
    });

    return <ForceGraph2D
        graphData={exampleData}
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
    />
}

export default Graph;


// import React from "react";
// import ForceGraph2D from 'react-force-graph-2d';
// import exampleData from '../../exampledata.json';
// import './graph.css';

// function Graph() {
//     return <ForceGraph2D
//         graphData={exampleData}
//         nodeAutoColorBy="group"
//         backgroundColor='#424242'
//         nodeVal={50}
//         linkDirectionalArrowLength = {
//             link => link.preclusion ? 0 : 5
//         }
//         linkColor = {
//             link => link.preclusion ? "#80deea" : "#e0e0e0"
//         }
//         linkDirectionalArrowColor = {
//             link => "#757575"
//         }
//         nodeRelSize={50}
//         nodeCanvasObject = {
//             (node, ctx, globalScale) => {
//             if (node.group === 2) {
//                 ctx.fillStyle = '#e0e0e0';
//                 ctx.beginPath();
//                 ctx.ellipse(node.x, node.y, 10/globalScale, 10/globalScale, 0, 0, 2 * Math.PI);
//                 ctx.fill();
//                 node.__radius = 10/globalScale;
//                 return;
//             }
//             const label = node.id;
//             const fontSize = 17/globalScale;

//             ctx.font = `${fontSize}px Sans-Serif`;
//             const textWidth = ctx.measureText(label).width;
//             const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

//             ctx.fillStyle = node.color;
//             ctx.beginPath()
//             ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions, 1.5);
//             ctx.fill()

//             ctx.textAlign = 'center';
//             ctx.textBaseline = 'middle';
//             ctx.fillStyle = '#424242';
//             ctx.fillText(label, node.x, node.y);

//             node.__bckgDimensions = bckgDimensions;
//             }
//         }
//         nodePointerAreaPaint = {
//             (node, color, ctx) => {
//             if (node.group === 2) {
//                 const radius = node.__radius;
//                 ctx.fillStyle = color;
//                 ctx.beginPath();
//                 ctx.ellipse(node.x, node.y, radius, radius, 0, 0, 2 * Math.PI);
//                 ctx.fill();
//                 return;
//             }
//             ctx.fillStyle = color;
//             const bckgDimensions = node.__bckgDimensions;
//             bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
//             }
//         }
//     />
// }

// export default Graph;
