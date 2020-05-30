var NORMAL_EDGE = 0;
var DIRECTED_BIEDGE = 1;
var SELF_EDGE = 2;

var LABELEXMAPLES = 'Brasil' + '\n' +
  'Japão' + '\n' +
  'Alemanha' + '\n' +
  'Chile';

var EDGEEXAMPLES = 'Brasil Japão 100' + '\n' +
  'Japão Alemanha 400' + '\n' +
  'Alemanha Chile 600' + '\n' +
  'Chile Chile 0' + '\n' +
  'Brasil Alemanha 1000';

document.addEventListener('DOMContentLoaded', function () {
  var gdataformatselect = document.getElementById('graph-data-format');
  var gdatatextarea = document.getElementById('graph-data');
  var labelformatselect = document.getElementById('label-format');
  var nodelabelstextarea = document.getElementById('node-labels');
  var canvas = document.getElementById('saver-canvas');
  nodelabelstextarea.value = LABELEXMAPLES;
  gdatatextarea.value = EDGEEXAMPLES;

  var weighted = true;
  var directed = true;
  var custom_labels = true;

  gdataformatselect.onchange = function () {
    var placeholder_text = gdataformatselect.options[gdataformatselect.selectedIndex].text.split(':')[1].trim();
    gdatatextarea.setAttribute('placeholder', placeholder_text);
  }

  labelformatselect.onchange = function () {
    var val = labelformatselect.value;
    var node_labels_value = nodelabelstextarea.value.trim();
    var node_list = [];
    if (node_labels_value != '' && node_labels_value != undefined)
      node_list = node_labels_value.split('\n')
    if (val == 'numerals') {
      nums = []
      for (i = 1; i <= node_list.length; i++)
        nums.push(i.toString())
      nodelabelstextarea.value = nums.join('\n');
    } else if (val == 'alphabets') {
      alphas = []
      for (i = 1; i <= node_list.length; i++)
        alphas.push(toLetters(i))
      nodelabelstextarea.value = alphas.join('\n');
    } else if (val == '4Colors') {
      alphas = []
      for (i = 1; i <= node_list.length + 1; i++)
        alphas.push(toLetters(i))
      nodelabelstextarea.value = alphas.join('\n');
    }
  }

  var windowWidth = parseInt(window.getComputedStyle(document.getElementById('create-graph')).width.split('px')[0]);
  var windowHeight = window.innerHeight - 100;
  init(windowWidth, windowHeight);
  var mode = null

  /**
   * Creates graph based on user inputs
   */
  function createsGraph() {
    document.getElementById('welsh-powell').onclick = function () {
      mode = 'welsh-powell'
      buildConnections()
    };

    document.getElementById('a-star').onclick = function () {
      mode = 'a-star'
      buildConnections()
    };

    document.getElementById('create-graph').onclick = function () {
      mode = null
      buildConnections()
    }
  }

  function buildConnections() {
    // parse data
    var gdataformatvalue = gdataformatselect.value;
    var gdatatextareavalue = gdatatextarea.value;
    var gtype = document.querySelector('input[name = "graph-type"]:checked').value;
    var etype = document.querySelector('input[name = "edge-type"]:checked').value;

    var dataset = {
      nodes: [],
      edges: []
    };

    directed = Boolean(gtype === 'directed');
    weighted = Boolean(etype === 'weighted');
    custom_labels = Boolean(labelformatselect.value == 'custom');

    var node_labels_value = nodelabelstextarea.value.trim();
    var node_list = [];
    if (node_labels_value != '' && node_labels_value != undefined)
      node_list = node_labels_value.split('\n')

    // console.log(node_list);
    var node_dict = {};
    var edges_dict = {};
    for (var i = 0; i < node_list.length; i++) {
      var node_name = node_list[i].trim();
      if (!(node_name in node_dict)) {
        node_dict[node_name] = i;
        edges_dict[i] = {};
        dataset.nodes.push({
          name: node_name
        });
      } else {
        alert('Vários vértices com o mesmo rótulo, remova!');
        return false;
      }
    }
    // console.log(node_dict);

    if (gdatatextareavalue != '' && gdatatextareavalue != undefined) {
      var data_list = gdatatextareavalue.split('\n');

      if (gdataformatvalue == 'abw') {
        for (var i = 0; i < data_list.length; i++) {
          abw = data_list[i].trim().split(/\s+/);
          // console.log(abw);
          if (abw.length < 2) {
            alert('Aresta inválida ' + data_list[i]);
            return false;
          }
          if (!(abw[0] in node_dict) || !(abw[1] in node_dict)) {
            alert('Um dos vértices não está na lista de vértices ' + abw[0] + ' ou ' + abw[1]);
            return false;
          }
          var a = node_dict[abw[0]],
            b = node_dict[abw[1]];
          var label = '';
          if (abw.length > 2) {
            label = abw[2].trim();
          }
          if (!directed && (a in edges_dict[b])) {
            edges_dict[b][a] += ', ' + label;
          } else {
            if (!(b in edges_dict[a])) {
              edges_dict[a][b] = label;
            } else {
              edges_dict[a][b] += ', ' + label;
            }
          }
        }
        for (var i in edges_dict) {
          for (var j in edges_dict[i]) {
            var edge_type_value = NORMAL_EDGE;
            if (i == j) edge_type_value = SELF_EDGE;
            else if (directed && edges_dict[j][i]) edge_type_value = DIRECTED_BIEDGE;
            dataset.edges.push({
              source: i,
              target: j,
              label: edges_dict[i][j],
              edge_type: edge_type_value
            });
          }
        }
      } else {
        var rl = data_list.length;
        if (rl != dataset.nodes.length) {
          alert('Não é uma matrix quadrada ou está faltando algum vértice');
          return false;
        }
        var edge_matrix = [];
        for (var i = 0; i < data_list.length; i++) {
          var vals = data_list[i].split(',');
          if (rl != vals.length) {
            alert('Não é uma matrix quadrada ou está faltando algum vértice');
            return false;
          }
          edge_matrix.push(vals);
        }
        for (var i = 0; i < edge_matrix.length; i++) {
          for (var j = 0; j < edge_matrix[i].length; j++) {
            if (edge_matrix[i][j].trim() == '') {
              alert('Use 0 para representar nenhuma conexão');
              return false;
            }
            if (edge_matrix[i][j].trim() != '0') {
              var edge_type_value = NORMAL_EDGE;
              if (i == j) edge_type_value = SELF_EDGE;
              else if (directed && edge_matrix[j][i].trim() != '0') edge_type_value = DIRECTED_BIEDGE;
              dataset.edges.push({
                source: i,
                target: j,
                label: edge_matrix[i][j].trim(),
                edge_type: edge_type_value
              });
            }
          }
        }
      }
    }

    // welsh-powell
    dataset.nodes = dataset.nodes.map(function (node, index) {
      const connectedEdges = dataset.edges.filter(function (edge) {
        return (Number(edge.source) === index) || (Number(edge.target) === index);
      });

      // list of connections that current node have
      let connections = [...new Set(connectedEdges
        .map(function (connection) {
          const nodes = []
          nodes.push(Number(connection.source))
          nodes.push(Number(connection.target))
          return nodes
        })
        .flat())];
      connections = connections.filter(function (connection) {
        return connection !== index
      })

      color = 0
      return {
        ...node,
        connections,
        color
      }
    })

    dataset.nodes.forEach(function (node, index) {
      const connections = node.connections
      connections.forEach(function (connection, _index) {
        if (index > 0 && dataset.nodes[connection].color === node.color) {
          node.color++
        }
      });
    })
    dataset.mode = mode;

    if (mode === 'a-star') {
      // TODO fix
      dataset.nodes.forEach(function (node, index) {
        node.edgeValues = node.edgeValues || []
        dataset.edges.forEach(function (edge) {
          if (Number(edge.source) === index || Number(edge.targer) === index) {
            node.edgeValues.push(edge.label)
          }
        })
      })
    }

    init(parseInt(window.getComputedStyle(document.getElementById('create-graph')).width.split('px')[0]), window.innerHeight - 100);
    if (dataset.nodes.length > 0) {

      var radius = 12;
      var linkDistance = 200;
      var repulsion_force = -1000;
      var repulsion_force_max_distance = 500;
      var gravity = 0.01;
      var link_strength = 0.09;

      if (dataset.nodes.length >= 70) {
        radius = 4;
        repulsion_force = -400;
        repulsion_force_max_distance = 300;

      } else if (dataset.nodes.length >= 50) {
        radius = 6;
        repulsion_force = -600;
        repulsion_force_max_distance = 400;

      } else if (dataset.nodes.length >= 30) {
        repulsion_force = -800;
        repulsion_force_max_distance = 500;
        radius = 8;
      }
      create_graph(dataset, linkDistance, repulsion_force, repulsion_force_max_distance, gravity, link_strength, radius, directed, weighted, custom_labels);
    }
  }

  /**
   * Saves created graph as a png image
   */
  function saveGraphToPng() {
    document.getElementById('save').onclick = function () {
      var svg = d3.select('#svg-space');
      var canvas = d3.select('canvas').attr('width', svg.attr('width')).attr('height', svg.attr('height')).node();
      var img = d3.select('body').append('img').attr('width', svg.attr('width')).attr('height', svg.attr('height')).style('display', 'none').node();
      var doctype = '<?xml version="1.0" standalone="no"?>' + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
      // serialize our SVG XML to a string.
      var source = (new XMLSerializer()).serializeToString(svg.node());
      var blob = new Blob([doctype + source], {
        type: 'image/svg+xml;charset=utf-8'
      });
      var url = window.URL.createObjectURL(blob);
      img.src = url;
      img.onload = function () {
        var context = canvas.getContext('2d');
        context.font = '12px Raleway';
        context.drawImage(img, 0, 0);
        var a = document.createElement('a');
        a.download = 'graph_save.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        a.remove();
      };
      img.remove();
    }
  }

  createsGraph();
  saveGraphToPng();
}, false);

function init(w, h) {
  var svgspace = document.getElementById('svg-space');
  if (svgspace) svgspace.remove();
  var svg = d3.select('.svgrow').append('svg')
    .attr('id', 'svg-space')
    .attr('height', h)
    .attr('width', w)
  // console.log(w);
  var g = svg.append('g');
  svg.append('rect')
    .attr('width', w)
    .attr('height', h)
    .style('fill', 'none')
    .style('pointer-events', 'none')
    .call(d3.zoom()
      .scaleExtent([0.01, 10])
      .on('zoom', zoomed));

  //Zoom Helpers
  function zoomed() {
    g.attr('transform', d3.event.transform);
  }
  //Shift events
  document.onkeydown = function (e) {
    e = e || window.event;
    if (e.keyCode == 16) {
      // console.log("shiftKey down");
      d3.select('rect').style('pointer-events', 'all').style('cursor', 'move');
    }
  };

  document.onkeyup = function (e) {
    e = e || window.event;
    if (e.keyCode == 16) {
      // console.log("shiftKey up");
      d3.select('rect').style('pointer-events', 'none').style('cursor', 'pointer');
    }
  };
}

function create_graph(dataset, linkDistance, repulsion_force, repulsion_force_max_distance, gravity, link_strength, radius, directed, weighted, custom_labels) {
  // Color list to be used on welsh Powell algorithm
  var colorList = [
    '#33ffc9',
    '#1aa3ff',
    '#ff0080',
    '#ffbf0',
    '#9933ff',
    '#4d1300',
    '#b3ccff'
  ]

  var svg = d3.select('.svgrow').select('svg');
  var g = svg.select('g');
  var w = svg.attr('width');
  var h = svg.attr('height');
  // console.log(w + " " + h)
  // d3.forceLink().id(function(d) { return d.id; })
  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().strength(link_strength))
    .force('charge', d3.forceManyBody().theta(0.01).strength(repulsion_force).distanceMax(repulsion_force_max_distance))
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('collide', d3.forceCollide().radius(function (d) {
      return d.r * 2 + 10;
    }).iterations(5))
    .force('x', d3.forceX(function (d) {
      return w / 2;
    }).strength(gravity))
    .force('y', d3.forceY(function (d) {
      return h / 2;
    }).strength(gravity));

  var edgepaths = g.selectAll('.edgepath')
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

  if (weighted) {
    var edgelabels = g.selectAll('.edgelabel')
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

  var nodes = g.append('g')
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
  if (dataset.mode === 'welsh-powell') {
    nodes._groups[0].forEach((circle, index) => {
      circle.style.fill = colorList[dataset.nodes[index].color]
    })
  }

  var nodelabels = g.selectAll('.nodelabel')
    .data(dataset.nodes)
    .enter()
    .append('text')
    .attr('dx', function (d) {
      if (custom_labels) {
        return radius + 1;
      } else {
        return -3;
      }
    })
    .attr('dy', function (d) {
      if (custom_labels) {
        return -radius - 1;
      } else {
        return 3;
      }
    })
    .attr('class', 'nodelabel')
    .attr('stroke', 'white')
    .attr('font-size', 12)
    .text(function (d) {
      return d.name;
    });

  simulation.nodes(dataset.nodes).on('tick', ticked);
  simulation.force('link').links(dataset.edges);

  function ticked() {
    var rr = nodes.attr('r');
    nodes.attr('cx', function (d) {
        return d.x = Math.max(rr, Math.min(w - rr, d.x));
      })
      .attr('cy', function (d) {
        return d.y = Math.max(rr, Math.min(h - rr, d.y));
      })

    nodelabels.attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y;
      });

    edgepaths.attr('d', function (d) {
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

      edgelabels.attr('dx', function (d) {
        if (d.edge_type == SELF_EDGE) {
          return 70 - (d.label.length / 2 * 10);
        }
        return Math.max(Math.abs(d.target.y - d.source.y) / 2, Math.abs(d.target.x - d.source.x) / 2);
      });

      edgelabels.attr('dy', function (d) {
        if (d.edge_type == SELF_EDGE) {
          return 10;
        }
        return -5;
      });
    }
  }

  //Node drag Helpers
  function dragstarted(d) {
    if (!d3.event.active)
      simulation.alphaTarget(0.01).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active)
      simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function edgesvgpath(d, m) {
    var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
    if (d.edge_type == DIRECTED_BIEDGE) {
      var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
      path = 'M ' + d.source.x + ',' + d.source.y + ' A ' + dr + ',' + dr + ' 10 0,1 ' + d.target.x + ',' + d.target.y;
    } else if (d.edge_type == SELF_EDGE) {
      path = 'M ' + d.source.x + ',' + d.source.y + ' C ' +
        (d.source.x - 70) + ',' + (d.source.y - 70) + ' ' +
        (d.target.x - 70) + ',' + (d.target.y + 70) + ' ' +
        d.target.x + ',' + d.target.y;
    }
    return path;
  }
}

function change_radius(radius) {
  d3.selectAll('.nodelabel').attr('dx', radius + 55);
  d3.selectAll('circle').attr('r', radius);
  d3.selectAll('.markers').attr('refX', radius + 15);
}

function scrollTo(element, to, duration) {
  if (duration <= 0) return;
  var difference = to - element.scrollTop;
  var perTick = difference / duration * 10;

  setTimeout(function () {
    element.scrollTop = element.scrollTop + perTick;
    if (element.scrollTop === to) return;
    scrollTo(element, to, duration - 10);
  }, 10);
}

function toLetters(num) {
  'use strict';
  var mod = num % 26,
    pow = num / 26 | 0,
    out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? toLetters(pow) + out : out;
}

// astar('start', 'end', callbacks)

var nodes = new Set([
  'Brasil',
  'Japão',
  'Alemanha',
  'Chile',
  'Inglaterra',
  'start',
  'end'
])

var edges = new Map([
  ['start:Brasil', 1.5],
  ['start:Chile', 2],
  ['Brasil:Japão', 2],
  ['Chile:Inglaterra', 3],
  ['Japão:Alemanha', 4],
  ['Inglaterra:end', 2],
  ['Alemanha:end', 4]
])

var children = new Map([
  ['start', ['Brasil', 'Chile']],
  ['Brasil', ['Japão']],
  ['Japão', ['Alemanha']],
  ['Alemanha', ['end']],
  ['Chile', ['Inglaterra']],
  ['Inglaterra', ['end']]
])

var estimates = new Map([
  ['Brasil:end', 4],
  ['Japão:end', 2],
  ['Alemanha:end', 4],
  ['Chile:end', 4.5],
  ['Inglaterra:end', 2]
])

var callbacks = {
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
    var key = nodeA + ':' + nodeB
    return edges.get(key)
  },
  estimate(node, goal) {
    var key = node + ':' + goal
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
  var priorityQueue = [start]
  var closed = new Set()
  var parents = new Map()
  var gScore = new Map()
  var fScore = new Map()
  var node = null

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

      var tentativeGScore = gScore.get(id(node)) + distance(node, child)
      var childGScore = gScore.has(id(child)) ? gScore.get(id(child)) : Infinity

      if (tentativeGScore >= childGScore) {
        continue
      }

      parents.set(id(child), node)
      gScore.set(id(child), tentativeGScore)

      var childFScore = tentativeGScore + estimate(child, goal)
      fScore.set(id(child), childFScore)
    }

    priorityQueue.sort((a, b) => fScore.get(id(a)) - fScore.get(id(b)))
  }

  var path = []
  while (node) {
    path.push(node)
    node = parents.get(id(node))
  }
  console.log('gScore', gScore)
  console.log('fscore', fScore)
  return path.reverse()
}
