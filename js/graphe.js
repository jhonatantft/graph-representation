const data = {
    "nodes": [
        { name: 'SP', fixed: true, x: 350, y: 75 },
        { name: 'FLN', fixed: true, x: 570, y: 320 },
        { name: 'CWB', fixed: true, x: 115, y: 135 },
        { name: 'POA', fixed: true, x: 350, y: 335 }
    ],
    "links": [
        { "source": 'SP', "target": 'CWB', "flot": 0, "capacite": 9 },
        { "source": 'SP', "target": 'FLN', "flot": 0, "capacite": 8 },
        { "source": 'SP', "target": 'POA', "flot": 0, "capacite": 7 },
        { "source": 'CWB', "target": 'FLN', "flot": 0, "capacite": 3 },
        { "source": 'CWB', "target": 'POA', "flot": 0, "capacite": 4 },
        { "source": 'FLN', "target": 'POA', "flot": 0, "capacite": 10 }
    ]
};

// var data = {
//     nodes: [
//         { name: 's', fixed: 1, x: 24, y: 219, index: 0 },
//         { name: 'f', fixed: 1, x: 488, y: 374, index: 1 },
//         { name: 'g', fixed: 1, x: 455, y: 199, index: 2 },
//         { name: 'h', fixed: 1, x: 446, y: 37, index: 3 },
//         { name: 'j', fixed: 1, x: 212, y: 372, index: 4 },
//         { name: 'k', fixed: 1, x: 219, y: 39, index: 5 },
//         { name: 'l', fixed: 1, x: 218, y: 210, index: 6 },
//         { name: 't', fixed: 1, x: 632, y: 206, index: 7}
//     ],
//     links: [
//         { source: 's', target: 'l', flot: 0, capacite: "10" },
//         { source: 's', target: 'k', flot: 0, capacite: "13" },
//         { source: 'k', target: 'h', flot: 0, capacite: "24" },
//         { source: 'h', target: 'g', flot: 0, capacite: "1" },
//         { source: 'l', target: 'k', flot: 0, capacite: "5" },
//         { source: 'l', target: 'f', flot: 0, capacite: "7" },
//         { source: 'l', target: 'j', flot: 0, capacite: "15" },
//         { source: 's', target: 'j', flot: 0, capacite: "10" },
//         { source: 'j', target: 'f', flot: 0, capacite: "15" },
//         { source: 'f', target: 't', flot: 0, capacite: "16" },
//         { source: 'g', target: 'f', flot: 0, capacite: "6" },
//         { source: 'g', target: 't', flot: 0, capacite: "13" },
//         { source: 'h', target: 't', flot: 0, capacite: "9" }
//     ]
// };

let nodeConcerned = null;

const pointMenuContextual = d3.select(".pointMenuContextual");
const graphMenuContextual = d3.select(".graphMenuContextual");
pointMenuContextual.style("display", "none");
graphMenuContextual.style("display", "none");


const graphe = d3.select("#graphe")
    .append("svg")	// graphe = svg
    .on("click", function (d, i) {
        pointMenuContextual
            .style("display", "none");
        graphMenuContextual
            .style("display", "none");
        d3.event.preventDefault();
    })
    .on("contextmenu", function (d, i) {
        let x = d3.event.pageX;
        let y = d3.event.pageY;
        let pointedElement = d3.event.target.nodeName;
        if (pointedElement == "svg") {
            graphMenuContextual
                .style("left", x + "px")
                .style("top", y + "px")
                .style("display", "block");
        }
        mouseCoordinates.x = x;
        mouseCoordinates.y = y;
        d3.event.preventDefault();
    });
graphe.append("g")
    .attr("class", "groupe-path");

graphe.append("g")
    .attr("class", "groupe-capacite");

graphe.append("g")
    .attr("class", "groupe-point");

graphe.attr("width", "100%")
    .attr("height", "400px");

let defs = graphe.append("defs")
    .append("marker")
    .attr("id", "fleche")
    .attr({
        "viewBox": "0 -5 10 10",
        "refX": 30,
        "refY": 0,
        "markerWidth": 15,
        "markerHeight": 10,
        "orient": "auto"
    })
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "white")
    .attr("class", "arrowHead");


let force = d3.layout.force()
    .size([750, 400]);