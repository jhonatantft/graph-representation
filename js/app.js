const NORMAL_EDGE = 0;
const DIRECTED_BIEDGE = 1;
const SELF_EDGE = 2;

const LABELEXMAPLES = 'Brasil' + '\n' +
  'Japão' + '\n' +
  'Alemanha' + '\n' +
  'Chile';

const EDGEEXAMPLES = 'Brasil Japão 100' + '\n' +
  'Japão Alemanha 400' + '\n' +
  'Alemanha Chile 600' + '\n' +
  'Chile Chile 0' + '\n' +
  'Brasil Alemanha 1000';

// Color list to be used on welsh Powell algorithm
const colorList = [
  '#33ffc9',
  '#1aa3ff',
  '#ff0080',
  '#ffbf0',
  '#9933ff',
  '#4d1300',
  '#b3ccff'
]

/**
 * Discover each connections that a node has,
 * this will help to check which color the adjacent
 *
 * @param { Array } param0 - graph nodes and edges
 */
function getEachConnectionsOfNode ([ nodes, edges ]) {
  return nodes.map((node, index) => {
    const connectedEdges = edges.filter(edge => {
      return (Number(edge.source) === index) || (Number(edge.target) === index);
    });

    // List of connections of current node
    let connections = [...new Set(connectedEdges
      .map(connection => {
        const nodes = []
        nodes.push(Number(connection.source))
        nodes.push(Number(connection.target))
        return nodes
      })
      .flat())];

    connections = connections.filter(connection => {
      return connection !== index
    });
    color = 0;
    return {
      ...node,
      connections,
      color
    };
  });
}

/**
 * Welsh Powell Graph colouring Algorithm
 *
 * @param  { ...any } args
 */
function applyWelshPowelToNodes (...args) {
  const newNodes = getEachConnectionsOfNode(args);
  newNodes.forEach((node, index) => {
    const connections = node.connections;
    connections.forEach(connection => {
      if (index > 0 && newNodes[connection].color === node.color) {
        node.color++
      }
    });
  });
  return newNodes;
}

/**
 * Saves created graph as a png image
 */
function saveGraphToPng () {
  document.getElementById('save').onclick = () => {
    const svg = d3.select('#svg-space');
    const canvas = d3.select('canvas').attr('width', svg.attr('width')).attr('height', svg.attr('height')).node();
    const img = d3.select('body').append('img').attr('width', svg.attr('width')).attr('height', svg.attr('height')).style('display', 'none').node();
    const doctype = '<?xml version="1.0" standalone="no"?>' + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    // Serialize our SVG XML to a string.
    const source = (new XMLSerializer()).serializeToString(svg.node());
    const blob = new Blob([doctype + source], {
      type: 'image/svg+xml;charset=utf-8'
    });
    const url = window.URL.createObjectURL(blob);
    img.src = url;

    img.onload = () => {
      const context = canvas.getContext('2d');
      context.font = '12px Raleway';
      context.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = 'graph_save.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      a.remove();
    };
    img.remove();
  }
}

/**
 * Get placeholder text from selected option to
 * update it's textarea
 */
function definePlaceholderTextOnTextArea (edgeTypeSelect, edgeTypeTextarea) {
  const placeholderText = edgeTypeSelect.options[edgeTypeSelect.selectedIndex].text.split(':')[1].trim();
  edgeTypeTextarea.setAttribute('placeholder', placeholderText);
}

/**
 * Get placeholder text from selected option to
 * update it's textarea
 */
function updateNodeLabelTextArea (nodeLabelFormatSelect, nodelabelstextarea) {
  const val = nodeLabelFormatSelect.value;
  const nodeLabelsValue = nodelabelstextarea.value.trim();
  let node_list = [];

  if (nodeLabelsValue !== '' && nodeLabelsValue) {
    node_list = nodeLabelsValue.split('\n')
  }

  if (val === 'numerals') {
    numbers = []
    for (let i = 1; i <= node_list.length; i++) {
      numbers.push(i.toString())
    }
    nodelabelstextarea.value = numbers.join('\n');
  } else if (val === 'alphabets') {
    alphas = []
    for (let i = 1; i <= node_list.length; i++) {
      alphas.push(toLetters(i))
    }
    nodelabelstextarea.value = alphas.join('\n');
  }
}

/**
 * Define initial app events, listener and global attributes
 */
function loadApp () {
  const edgeTypeSelect = document.getElementById('graph-data-format');
  const edgeTypeTextarea = document.getElementById('graph-data');
  const nodeLabelFormatSelect = document.getElementById('label-format');
  const nodelabelstextarea = document.getElementById('node-labels');
  // const canvas = document.getElementById('saver-canvas');
  nodelabelstextarea.value = LABELEXMAPLES;
  edgeTypeTextarea.value = EDGEEXAMPLES;

  let weighted = true;
  let directed = true;
  let custom_labels = true;
  let graphMode = null;

  /**
   * Select tag onchange attribuition
   */
  edgeTypeSelect.onchange = () => definePlaceholderTextOnTextArea(edgeTypeSelect, edgeTypeTextarea);
  nodeLabelFormatSelect.onchange = () => updateNodeLabelTextArea(nodeLabelFormatSelect, nodelabelstextarea);

  const windowWidth = parseInt(window.getComputedStyle(document.getElementById('create-graph')).width.split('px')[0]);
  const windowHeight = window.innerHeight - 100;
  drawGraphCanvas(windowWidth, windowHeight);

  /**
   * Define graph representation mode
   */
  function defineGraphMode () {
    /**
     * Regular representation mode
     */
    document.getElementById('create-graph').onclick = () => {
      graphMode = null;
      buildConnections();
    }

    /**
     * Welsh Powell mode
     */
    document.getElementById('welsh-powell').onclick = () => {
      graphMode = 'welsh-powell';
      buildConnections();
    }

    /**
     * A* mode (pathfinder)
     */
    document.getElementById('a-star').onclick = () => {
      graphMode = 'a-star';
      buildConnections();
    }
  }

  /**
   * Define connections between each node
   * according to graph and edge types defined
   * by user
   */
  function buildConnections () {
    const edgeTypeValue = edgeTypeSelect.value;
    const edgeTypeTextareaValue = edgeTypeTextarea.value;
    const graphType = document.querySelector('input[name="graph-type"]:checked').value;
    const edgeType = document.querySelector('input[name="edge-type"]:checked').value;
    const dataset = {
      nodes: [],
      edges: []
    };

    directed = Boolean(graphType === 'directed');
    weighted = Boolean(edgeType === 'weighted');
    custom_labels = Boolean(nodeLabelFormatSelect.value == 'custom');

    const nodeLabelsValue = nodelabelstextarea.value.trim();
    let node_list = [];
    if (nodeLabelsValue !== '' && nodeLabelsValue) {
      node_list = nodeLabelsValue.split('\n')
    }

    const nodeDict = {};
    const edgesDict = {};
    for (let i = 0; i < node_list.length; i++) {
      const nodeName = node_list[i].trim();
      if (!(nodeName in nodeDict)) {
        nodeDict[nodeName] = i;
        edgesDict[i] = {};
        dataset.nodes.push({
          name: nodeName
        });
      } else {
        alert('Vários vértices com o mesmo rótulo, remova!');
        return false;
      }
    }

    if (edgeTypeTextareaValue !== '' && edgeTypeTextareaValue) {
      const dataList = edgeTypeTextareaValue.split('\n');

      if (edgeTypeValue === 'abw') {
        for (let i = 0; i < dataList.length; i++) {
          abw = dataList[i].trim().split(/\s+/);
          if (abw.length < 2) {
            alert('Aresta inválida ' + dataList[i]);
            return false;
          }
          if (!(abw[0] in nodeDict) || !(abw[1] in nodeDict)) {
            alert('Um dos vértices não está na lista de vértices ' + abw[0] + ' ou ' + abw[1]);
            return false;
          }
          const previous = nodeDict[abw[0]];
          const next = nodeDict[abw[1]];
          let label = '';

          if (abw.length > 2) {
            label = abw[2].trim();
          }
          if (!directed && (previous in edgesDict[next])) {
            edgesDict[next][previous] += ', ' + label;
          } else {
            if (!(next in edgesDict[previous])) {
              edgesDict[previous][next] = label;
            } else {
              edgesDict[previous][next] += ', ' + label;
            }
          }
        }

        for (let i in edgesDict) {
          for (let j in edgesDict[i]) {
            let edgeTypeValue = NORMAL_EDGE;
            if (i == j) {
              edgeTypeValue = SELF_EDGE;
            } else if (directed && edgesDict[j][i]) {
              edgeTypeValue = DIRECTED_BIEDGE;
            }

            dataset.edges.push({
              source: i,
              target: j,
              label: edgesDict[i][j],
              edge_type: edgeTypeValue
            });
          }
        }
      } else {
        const dataListSize = dataList.length;
        if (dataListSize !== dataset.nodes.length) {
          alert('Não é uma matrix quadrada ou está faltando algum vértice');
          return false;
        }
        const edgeMatrix = [];
        for (let i = 0; i < dataList.length; i++) {
          const values = dataList[i].split(',');
          if (dataListSize !== values.length) {
            alert('Não é uma matrix quadrada ou está faltando algum vértice');
            return false;
          }
          edgeMatrix.push(values);
        }
        for (let i = 0; i < edgeMatrix.length; i++) {
          for (let j = 0; j < edgeMatrix[i].length; j++) {
            if (edgeMatrix[i][j].trim() === '') {
              alert('Use 0 para representar nenhuma conexão');
              return false;
            }
            if (edgeMatrix[i][j].trim() !== '0') {
              if (i == j) {
                edgeTypeValue = SELF_EDGE;
              } else if (directed && edgeMatrix[j][i].trim() !== '0') {
                edgeTypeValue = DIRECTED_BIEDGE;
              }
              dataset.edges.push({
                source: i,
                target: j,
                label: edgeMatrix[i][j].trim(),
                edge_type: edgeTypeValue
              });
            }
          }
        }
      }
    }

    dataset.nodes = applyWelshPowelToNodes(dataset.nodes, dataset.edges);

    dataset.graphMode = graphMode;

    drawGraphCanvas(parseInt(window.getComputedStyle(document.getElementById('create-graph')).width.split('px')[0]), window.innerHeight - 100);
    if (dataset.nodes.length > 0) {
      let radius = 12;
      let linkDistance = 200;
      let repulsionForce = -1000;
      let repulsionForceMaxDistance = 500;
      let gravity = 0.01;
      let linkStrength = 0.09;

      if (dataset.nodes.length >= 70) {
        radius = 4;
        repulsionForce = -400;
        repulsionForceMaxDistance = 300;

      } else if (dataset.nodes.length >= 50) {
        radius = 6;
        repulsionForce = -600;
        repulsionForceMaxDistance = 400;

      } else if (dataset.nodes.length >= 30) {
        repulsionForce = -800;
        repulsionForceMaxDistance = 500;
        radius = 8;
      }
      createGraph(dataset, linkDistance, repulsionForce, repulsionForceMaxDistance, gravity, linkStrength, radius, directed, weighted, custom_labels);
    }
  }
  defineGraphMode();
  saveGraphToPng();
}
/**
 * Draws into the DOM the 2D plane
 *
 * @param { Number } width
 * @param { Number } height
 */
function drawGraphCanvas (width, height) {
  const svgspace = document.getElementById('svg-space');
  if (svgspace) {
    svgspace.remove();
  }

  const svg = d3.select('.svgrow')
    .append('svg')
    .attr('id', 'svg-space')
    .attr('height', height)
    .attr('width', width)

  const g = svg.append('g');
  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .style('fill', 'none')
    .style('pointer-events', 'none')
    .call(d3.zoom()
      .scaleExtent([0.01, 10])
      .on('zoom', zoomed));

  // Zoom Helpers
  function zoomed () {
    g.attr('transform', d3.event.transform);
  }

  /**
   * Shift event
   */
  document.onkeydown = (e) => {
    e = e || window.event;
    if (e.keyCode == 16) {
      // console.log("shiftKey down");
      d3.select('rect')
        .style('pointer-events', 'all')
        .style('cursor', 'move');
    }
  };

  /**
   * Shift event
   */
  document.onkeyup = (e) => {
    e = e || window.event;
    if (e.keyCode == 16) {
      // console.log("shiftKey up");
      d3.select('rect')
        .style('pointer-events', 'none')
        .style('cursor', 'pointer');
    }
  };
}

function createGraph (
  dataset,
  linkDistance,
  repulsionForce,
  repulsionForceMaxDistance,
  gravity,
  linkStrength,
  radius,
  directed,
  weighted,
  custom_labels
  ) {

  const svg = d3.select('.svgrow').select('svg');
  const g = svg.select('g');
  const w = svg.attr('width');
  const h = svg.attr('height');
  // console.log(w + " " + h)
  // d3.forceLink().id(function(d) { return d.id; })
  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().strength(linkStrength))
    .force('charge', d3.forceManyBody().theta(0.01).strength(repulsionForce).distanceMax(repulsionForceMaxDistance))
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('collide', d3.forceCollide().radius(d => {
      return d.r * 2 + 10;
    }).iterations(5))
    .force('x', d3.forceX(d => {
      return w / 2;
    }).strength(gravity))
    .force('y', d3.forceY(d => {
      return h / 2;
    }).strength(gravity));

  const edgepaths = g.selectAll('.edgepath')
    .data(dataset.edges)
    .enter()
    .append('path')
    .attr('marker-end', 'url(#arrowhead)')
    .attr('marker-end', 'url(#arrowhead)')
    .attr('class', 'edgepath')
    .attr('fill-opacity', 0)
    .attr('stroke-opacity', 1)
    .attr('fill', 'blue')
    .attr('stroke', 'white')
    .attr('id', function (d, i) {
      return 'edgepath' + i
    })
  // .style("pointer-events", "none");

  let edgelabels = g.selectAll('.edgelabel')

  if (weighted) {
    edgelabels = g.selectAll('.edgelabel')
      .data(dataset.edges)
      .enter()
      .append('text')
      .style('pointer-events', 'none')
      .attr('class', 'edgelabel')
      .attr('id', function (d, i) {
        return 'edgelabel' + i
      })
      .attr('dx', linkDistance / 2)
      .attr('dy', -5)
      .attr('font-size', 12)
      .attr('stroke', 'white')
      .attr('fill', 'black');

    edgelabels.append('textPath')
      .attr('xlink:href', function (d, i) {
        return '#edgepath' + i
      })
      .style('pointer-events', 'none')
      .text(function (d, i) {
        return d.label
      });
  }

  //'markerUnits':'strokeWidth',
  if (directed) {
    g.append('defs').append('marker')
      .attr('class', 'markers')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', radius + 15)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', 'black')
      .attr('stroke', 'white');
  }

  const nodes = g.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(dataset.nodes)
    .enter()
    .append('circle')
    .attr('r', radius)
    .style('stroke', 'black')
    .style('fill', '#7289DA')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  // Welsh Powell Graph colouring Algorithm
  if (dataset.graphMode === 'welsh-powell') {
    nodes._groups[0].forEach((circle, index) => {
      circle.style.fill = colorList[dataset.nodes[index].color]
    })
  }

  const nodelabels = g.selectAll('.nodelabel')
    .data(dataset.nodes)
    .enter()
    .append('text')
    .attr('dx', d => {
      if (custom_labels) {
        return radius + 1;
      } else {
        return -3;
      }
    })
    .attr('dy', d => {
      if (custom_labels) {
        return -radius - 1;
      } else {
        return 3;
      }
    })
    .attr('class', 'nodelabel')
    .attr('stroke', 'white')
    .attr('font-size', 12)
    .text(d => {
      return d.name;
    });

  simulation.nodes(dataset.nodes).on('tick', ticked);
  simulation.force('link').links(dataset.edges);

  function ticked() {
    const rr = nodes.attr('r');
    nodes.attr('cx', d => {
        return d.x = Math.max(rr, Math.min(w - rr, d.x));
      })
      .attr('cy', d => {
        return d.y = Math.max(rr, Math.min(h - rr, d.y));
      })

    nodelabels.attr('x', d => {
        return d.x;
      })
      .attr('y', d => {
        return d.y;
      });

    edgepaths.attr('d', d => {
      return edgesvgpath(d, 'tick')
    });

    if (weighted) {
      edgelabels.attr('transform', function (d, i) {
        if (d.target.x < d.source.x) {
          bbox = this.getBBox();
          rx = bbox.x + bbox.width / 2;
          ry = bbox.y + bbox.height / 2;
          return 'rotate(180 ' + rx + ' ' + ry + ')';
        } else {
          return 'rotate(0)';
        }
      });

      edgelabels.attr('dx', d => {
        if (d.edge_type == SELF_EDGE) {
          return 70 - (d.label.length / 2 * 10);
        }
        return Math.max(Math.abs(d.target.y - d.source.y) / 2, Math.abs(d.target.x - d.source.x) / 2);
      });

      edgelabels.attr('dy', d => {
        if (d.edge_type === SELF_EDGE) {
          return 10;
        }
        return -5;
      });
    }
  }

  /**
   * Node drag helper
   *
   * @param { Object } node - node object
   */
  function dragstarted (node) {
    if (!d3.event.active) {
      simulation.alphaTarget(0.01).restart();
    }
    node.fx = node.x;
    node.fy = node.y;
  }

  /**
   * Node drag helper
   *
   * @param { Object } node - node object
   */
  function dragged (node) {
    node.fx = d3.event.x;
    node.fy = d3.event.y;
  }

  /**
   * Node drag helper
   *
   * @param { Object } node - node object
   */
  function dragended (node) {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    node.fx = null;
    node.fy = null;
  }

  /**
   * Draws edges according to coordinates passed
   * through nodes
   *
   * @param { Object } node - node data with coordinates
   * @param { String } m
   */
  function edgesvgpath (node, m) {
    let path = 'M ' + node.source.x + ' ' + node.source.y + ' L ' + node.target.x + ' ' + node.target.y;
    if (node.edge_type === DIRECTED_BIEDGE) {
      const dx = node.target.x - node.source.x;
      const dy = node.target.y - node.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy);
      path = 'M ' + node.source.x + ',' + node.source.y + ' A ' + dr + ',' + dr + ' 10 0,1 ' + node.target.x + ',' + node.target.y;
    } else if (node.edge_type === SELF_EDGE) {
      path = 'M ' + node.source.x + ',' + node.source.y + ' C ' +
        (node.source.x - 70) + ',' + (node.source.y - 70) + ' ' +
        (node.target.x - 70) + ',' + (node.target.y + 70) + ' ' +
        node.target.x + ',' + node.target.y;
    }
    return path;
  }
}

/**
 * Converts number into letters according
 * to CharCode
 *
 * @param { Number } num
 */
function toLetters (num) {
  'use strict';
  const mod = num % 26;
  const pow = num / 26 | 0;
  const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? toLetters(pow) + out : out;
}

document.addEventListener('DOMContentLoaded', loadApp, false);

// astar('start', 'end', callbacks)

let nodes = new Set([
  'Brasil',
  'Japão',
  'Alemanha',
  'Chile',
  'Inglaterra',
  'start',
  'end'
])

let edges = new Map([
  ['start:Brasil', 1.5],
  ['start:Chile', 2],
  ['Brasil:Japão', 2],
  ['Chile:Inglaterra', 3],
  ['Japão:Alemanha', 4],
  ['Inglaterra:end', 2],
  ['Alemanha:end', 4]
])

let children = new Map([
  ['start', ['Brasil', 'Chile']],
  ['Brasil', ['Japão']],
  ['Japão', ['Alemanha']],
  ['Alemanha', ['end']],
  ['Chile', ['Inglaterra']],
  ['Inglaterra', ['end']]
])

let estimates = new Map([
  ['Brasil:end', 4],
  ['Japão:end', 2],
  ['Alemanha:end', 4],
  ['Chile:end', 4.5],
  ['Inglaterra:end', 2]
])

let callbacks = {
  id(node) {
    return node
  },
  isGoal(node) {
    return node === 'end'
  },
  getSuccessors(node) {
    return children.get(node)
  },
  distance(nodeA, nodeB) {
    let key = nodeA + ':' + nodeB
    return edges.get(key)
  },
  estimate(node, goal) {
    let key = node + ':' + goal
    return estimates.get(key)
  }
}

function astar(start, goal, {
  id,
  isGoal,
  getSuccessors,
  distance,
  estimate
}) {
  let priorityQueue = [start]
  let closed = new Set()
  let parents = new Map()
  let gScore = new Map()
  let fScore = new Map()
  let node = null

  gScore.set(id(start), 0)
  fScore.set(id(start), estimate(start, goal))

  while (priorityQueue[0] || priorityQueue.length) {
    node = priorityQueue.shift()

    if (closed.has(id(node))) {
      continue
    }
    if (isGoal(node)) {
      break
    }
    closed.add(id(node))

    for (let child of getSuccessors(node)) {
      if (closed.has(id(child))) {
        continue
      }
      priorityQueue.push(child)

      let tentativeGScore = gScore.get(id(node)) + distance(node, child)
      let childGScore = gScore.has(id(child)) ? gScore.get(id(child)) : Infinity

      if (tentativeGScore >= childGScore) {
        continue
      }

      parents.set(id(child), node)
      gScore.set(id(child), tentativeGScore)

      let childFScore = tentativeGScore + estimate(child, goal)
      fScore.set(id(child), childFScore)
    }

    priorityQueue.sort((a, b) => fScore.get(id(a)) - fScore.get(id(b)))
  }

  let path = []
  while (node) {
    path.push(node)
    node = parents.get(id(node))
  }
  console.log('gScore', gScore)
  console.log('fscore', fScore)
  return path.reverse()
}
