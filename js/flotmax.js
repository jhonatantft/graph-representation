'use strict'

/*
 * s = source
 * t = destination
 * rGraph = matrix of the graph

*/

function checkEachNode (rGraph, s, t, parent) {
	var visited = [];
	var pile = [];
	var V = rGraph.length;
	// Create the visit matrix for the points
	for (var i = 0; i < V; i++) {
		visited[i] = false;
	}
	// Stack creation, stack the source and mark it as visited
	pile.push(s);
	visited[s] = true;
	parent[s] = -1;

	while (pile.length != 0) {
		var u = pile.shift();
		for (var v = 0; v < V; v++) {
			if (visited[v] == false && rGraph[u][v] > 0) {
				pile.push(v);
				parent[v] = u;
				visited[v] = true;
			}
		}
	}
	// Return true if it is visited after browsing from s (source) 
	return (visited[t] == true);
}

function fordFulkerson (graph, s, t) {
	if (s < 0 || t < 0 || s > graph.length - 1 || t > graph.length - 1) {
		throw new Error("FlotMax - Ford-Fulkerson :: invalid source or destination");
	}

	if (graph.length === 0) {
		throw new Error("FlotMax - Ford-Fulkerson :: invalid matrix");
	}

	var rGraph = [];
	for (var u = 0; u < graph.length; u++) {
		var temp = [];
		if (graph[u].length !== graph.length){
		throw new Error("FlotMax - Ford-Fulkerson :: the graph matrix must be square");
		}
		for (v = 0; v < graph.length; v++) {
			temp.push(graph[u][v]);
		}
		rGraph.push(temp);
	}
	var parent = [];
	var maxFlow = 0;
	var treatments = [];

	while (checkEachNode(rGraph, s, t, parent)) {
		var pathFlow = Number.MAX_VALUE;
		var path = [];
		for (var v = t; v != s; v = parent[v]) {
			u = parent[v];
			path.push([u,v]);
			pathFlow = Math.min(pathFlow, rGraph[u][v]);
		}
		treatments.push({
			flot : pathFlow,
			path: path.reverse()
		});

		for (v = t; v != s; v = parent[v]) {
			u = parent[v]; // sp
			rGraph[u][v] -= pathFlow;
			rGraph[v][u] += pathFlow;
		}

		maxFlow += pathFlow;
	}
	return {
		"flotmax": maxFlow,
		"grapheresiduel": rGraph,
		"treatments": treatments
	};
}
