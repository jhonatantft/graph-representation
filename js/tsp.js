/**
 * Creates canvas matrix
 * Can be created with lines
 */
function drawNoteLines () {
    tspContext.fillStyle = "#23272A";
    tspContext.fillRect(0, 0, tspCanvas.width, tspCanvas.height);
    for (var x = 0.5; x < tspCanvas.width; x += 10) {
        tspContext.moveTo(x, 0);
        tspContext.lineTo(x, tspCanvas.height);
    }
    for (var y = 0.5; y < tspCanvas.height; y += 10) {
        tspContext.moveTo(0, y);
        tspContext.lineTo(tspCanvas.width, y);
    }
    tspContext.strokeStyle = "#23272A";
    tspContext.stroke();
}

function drawCities (cityArray){
    tspContext.fillStyle = "#FFF";
    for(var i=0; i<cityArray.length; i++){
        tspContext.fillRect(cityArray[i].x - 2, cityArray[i].y - 2, 5, 5);
    }
}

function drawEdge (a, b, isSame) {
    tspContext.beginPath();
    tspContext.moveTo(a.x, a.y);
    tspContext.lineTo(b.x, b.y);
    if(isSame) tspContext.strokeStyle = "#6633FF";
    else tspContext.strokeStyle = "#D80000";
    tspContext.stroke();
}

function drawPath (cityArray, path, prevPath) {
    for(var i = 0; i < path.length; i+=8){
        if(i+8 >= path.length)
            drawEdge(cityArray[parseInt(path.substr(i, 8), 2)], cityArray[parseInt(path.substr(0, 8), 2)], path.substr(i,8)+path.substr(0,8)==prevPath.substr(i,8)+prevPath.substr(0,8));
        else{
            drawEdge(cityArray[parseInt(path.substr(i,8), 2)], cityArray[parseInt(path.substr(i+8,8), 2)], path.substr(i,8)+path.substr(i+8,8)==prevPath.substr(i,8)+prevPath.substr(i+8,8));
        }
    }
}

function displayOnCanvas () {
    drawNoteLines();
    drawCities(tspPopulation.cities);
    drawPath(tspPopulation.cities, tspPopulation.paths[0].path, tspPopulation.prevPaths[0].path);
    tspFlags.drawPath = 1;
}

/**
 * Creates the cities randomly
 *
 * @param { NNumber } cityNum 
 */
function generateCities (cityNum) {
    var cityArray = [];
    for ( i = 0; i < cityNum; i++) {
        cityArray[i] = {
            bin: ("0000000" + i.toString(2)).slice(-8),
            x: Math.floor(Math.random() * (800)),
            y:Math.floor(Math.random() * (800))
        };
    }
    return cityArray;
}

function calculateDistance (a,b) {
    var abx = a.x - b.x;
    var aby = a.y - b.y;
    return Math.floor(Math.sqrt(abx*abx + aby*aby));
}

/**
 * Define distance from one city to another
 *
 * @param { Array } cityArray 
 */
function mapDistances (cityArray) {
    var distances = [];
    for(var i = 0; i < cityArray.length; i++) {
        distances[i] = [];
        for (var j = i; j < cityArray.length; j++) {
            distances[i][j] = calculateDistance(cityArray[i], cityArray[j])
        }
    }

    for(i=0; i < cityArray.length; i++)
        for (j = i + 1; j < cityArray.length; j++)
            distances[j][i] = distances[i][j];

    return distances;
}

/**
 * Link each city randomly
 *
 * @param {*} cityNum 
 * @param {*} popSize 
 * @param {*} distances 
 */
function generateRandomPaths (cityNum, popSize, distances) {
    var paths = [];
    var sumDistance = 0;
    for (var p = 0; p < popSize; p++) {
        var randIndexes = [];
        var path = "";
        var distance = 0;
        var longestEdge = 0;
        for (var i = 0; i < cityNum; i++) {
            var j = "start";
            while (randIndexes.indexOf(j) != -1 || j === "start")
                j = Math.floor(Math.random() * (cityNum));
            randIndexes[i] = j;
            path += ("0000000" + randIndexes[i].toString(2)).slice(-8);

            if ( i === 0 ) distance += 0;
            else {
                distance += distances[randIndexes[i-1]][randIndexes[i]];
                longestEdge = distances[randIndexes[i-1]][randIndexes[i]]>longestEdge?distances[randIndexes[i-1]][randIndexes[i]]:longestEdge;
            }
        }
        distance += distances[randIndexes[cityNum-1]][randIndexes[0]];
        longestEdge = distances[randIndexes[cityNum-1]][randIndexes[0]]>longestEdge?distances[randIndexes[cityNum-1]][randIndexes[0]]:longestEdge;
        sumDistance += distance;
        paths[p] = {
            path:  path,
            dist: distance,
            longestEdge: longestEdge
        };
    }
    paths = paths.sort(function(a, b) {
        return a.dist - b.dist;
    });
    tspPopulation.meanDistance = Math.floor(sumDistance/popSize);

    return paths;
}

function displayStats () {
    $("#generationNum").val(tspPopulation.genNum);
    $("#bestDistance").val(tspPopulation.paths[0].dist);
    $("#worstDistance").val(tspPopulation.paths[tspPopulation.popSize-1].dist);
    $("#meanDistance").val(tspPopulation.meanDistance);
    tspFlags.displayStats = 1;
}

function timer (state) {
    if(state === "start") {
        tspFlags.timerInterval = setInterval(function(){
            tspPopulation.timer = (new Date).getTime()-tspFlags.startTime;
            $("#elapsedTime").val(tspPopulation.timer);
        }, 1);

    }
    if(state === "stop") {
        clearInterval(tspFlags.timerInterval);
    }
}

function initialize () {

    tspContext.clearRect(0, 0, tspCanvas.width, tspCanvas.height);
    tspPopulation.cityNum = $("#cityNum").val();
    tspPopulation.popSize = $("#popSize").val();
    tspPopulation.maxGen = $("#maxGen").val();
    tspPopulation.convergance = $("#converge").val();
    tspPopulation.genNum = 0;
    tspPopulation.timer = 0;
    $("#elapsedTime").val(tspPopulation.timer);
    tspPopulation.eliteRate = $("#eliteRate").val();
    tspPopulation.mutationRate = $("#mutationRate").val();
    tspPopulation.crossoverOperator = $("#crossoverOperator").val();
    tspPopulation.mutationOperator = $("#mutationOperator").val();
    tspPopulation.cities = generateCities(tspPopulation.cityNum);
    tspPopulation.distances = mapDistances(tspPopulation.cities);
    tspPopulation.paths = generateRandomPaths(tspPopulation.cityNum, tspPopulation.popSize, tspPopulation.distances);
    tspPopulation.prevPaths = tspPopulation.paths.slice();
    tspPopulation.originalPaths = tspPopulation.paths.slice();
    tspPopulation.countSame = 0;
    window.requestAnimationFrame(displayOnCanvas);
    displayStats();
}

function reset () {
    tspPopulation.paths = tspPopulation.originalPaths.slice();
    tspPopulation.prevPaths = tspPopulation.paths;
    tspPopulation.eliteRate = $("#eliteRate").val();
    tspPopulation.mutationRate = $("#mutationRate").val();
    tspPopulation.crossoverOperator = $("#crossoverOperator").val();
    tspPopulation.mutationOperator = $("#mutationOperator").val();
    tspPopulation.genNum = 0;
    tspPopulation.timer = 0;

    tspPopulation.countSame = 0;
    window.requestAnimationFrame(displayOnCanvas);
    displayStats();
}

function reverse (s) {
    var o = '';
    for (var i = s.length - 1; i >= 0; i--)
        o += s[i];
    return o;
}

function elitize () {
    tspPopulation.eliteSize = tspPopulation.eliteRate;

    if (tspPopulation.eliteSize%2 == 0) tspPopulation.eliteSize++;
    tspFlags.elitize = 1;
}

function mutate (pathArray, longestEdge) {
    var switchPoint;
    var switchPoint2;
    var tmp;
    var rand;
    /**
     * If necessary you can switch the mutate methds with
     * `tspPopulation.mutationOperator`
     */
    path = pathArray.join('');
    rand = Math.random() * 100;

    if (rand < tspPopulation.mutationRate) {
        switchPoint = Math.floor(Math.random() * (tspPopulation.cityNum));
        switchPoint2 = Math.floor(Math.random() * (tspPopulation.cityNum));
        tmp = pathArray[switchPoint];
        pathArray[switchPoint] = pathArray[switchPoint2];
        pathArray[switchPoint2] = tmp;
        path = pathArray.join('');
    }

    return path;
}

function crossover () {
    var newPaths = [];
    var sumDistance = 0;
    var report = "" ;
    var i, j, k, n1, n2, rand, start, end;
    var child, parent, slice;

    for (i = tspPopulation.eliteSize - 1; i < tspPopulation.popSize; i += 2){
        n1 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize/2)));
        n2 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize/2)));
        child = []; parent = [];
        child[0] = []; child[1] = [];
        child[0].splice(0,child[0].length);
        child[1].splice(0,child[1].length);
        parent[0] = tspPopulation.prevPaths[n1].path.match(/.{1,8}/g);
        parent[1] = tspPopulation.prevPaths[n2].path.match(/.{1,8}/g);
        child[0][0] = parent[0][0];
        child[1][0] = parent[1][0];
        var jump = 0, to;

        // Child is son of parent[1] (second parent) ?
        while (child[0].indexOf(parent[1][jump]) == -1) {
            to = parent[0].indexOf(parent[1][jump]); // Get first child of second parent from first parent
            child[0][to] = parent[0][to]; // Specific 'to' from first parent
            child[1][to] = parent[1][to]; // Specific 'to' from second parent
            jump = to; // Next should be `to`
        }

        for( j = 0; j < tspPopulation.cityNum; j++) {
            if(child[0][j] == null) {
                child[0][j] = parent[1][j];
                child[1][j] = parent[0][j];
            }
        }
        tspPopulation.paths[i] = { path : mutate(child[0],tspPopulation.paths[i].longestEdge) };
        tspPopulation.paths[i+1] = { path: mutate(child[1],tspPopulation.paths[i+1].longestEdge) };
    }

    for (i = 0; i < tspPopulation.popSize; i++) {
        var distance = 0, dist;
        var longestEdge = 0
        var r="";

        for (k = 0; k < tspPopulation.cityNum * 8; k+=8) {
            if(k+8 >= tspPopulation.cityNum*8) {
                dist = tspPopulation.distances[parseInt(tspPopulation.paths[i].path.substr(k, 8), 2)][parseInt(tspPopulation.paths[i].path.substr(0, 8), 2)];
                longestEdge = dist>longestEdge?dist:longestEdge;
                distance += dist;
            }
            else{
                dist = tspPopulation.distances[parseInt(tspPopulation.paths[i].path.substr(k,8), 2)][parseInt(tspPopulation.paths[i].path.substr(k+8,8), 2)];
                longestEdge = dist>longestEdge?dist:longestEdge;
                distance += dist;
            }
        }
        tspPopulation.paths[i].dist = distance;
        tspPopulation.paths[i].longestEdge = longestEdge;
        sumDistance += distance;
    }
    tspPopulation.paths = tspPopulation.paths.sort(function(a, b) {
        return a.dist - b.dist;
    });

    tspPopulation.meanDistance = Math.floor(sumDistance/tspPopulation.popSize);
    tspFlags.crossover = 1;
}

function evolve () {
    tspFlags.displayStats = 1;
    tspFlags.elitize = 1;
    tspFlags.mutate = 1;
    tspFlags.crossover = 1;
    tspPopulation.genNum = 0;
    tspPopulation.timer = 0;
    tspFlags.maxGenReached = 0;
    tspFlags.converged = 0;
    tspFlags.finishClicked = 0;
    tspPopulation.countSame = 0;
    tspFlags.startTime = (new Date).getTime();
    timer("start");

    tspFlags.evolutionInterval = setInterval(function () {
        if(
            !tspFlags.maxGenReached &&
            !tspFlags.finishClicked &&
            tspFlags.displayStats &&
            tspFlags.drawPath &&
            tspFlags.elitize &&
            tspFlags.crossover
        ) {

            tspFlags.displayStats = 0;
            tspFlags.elitize = 0;
            tspFlags.mutate = 0;
            tspFlags.crossover = 0;
            tspFlags.drawPath = 0;
            tspPopulation.genNum++;
            tspFlags.maxGenReached = tspPopulation.genNum>=tspPopulation.maxGen;
            tspFlags.converged = tspPopulation.countSame >= tspPopulation.convergance;
            if (tspPopulation.paths[0].dist == tspPopulation.prevPaths[0].dist) tspPopulation.countSame++;
            else tspPopulation.countSame = 0;
            tspPopulation.prevPaths = tspPopulation.paths.slice();
            displayStats();
            elitize();
            crossover();
            displayOnCanvas();

        }

        if (tspFlags.maxGenReached || tspFlags.finishClicked || tspFlags.converged==true){
            timer("stop");
            clearInterval(tspFlags.evolutionInterval);
            tspFlags.displayStats = 1;
            tspFlags.elitize = 1;
            tspFlags.mutate = 1;
            tspFlags.crossover = 1;
            tspFlags.drawPath = 1;
            tspFlags.evolutionFinished = 1;
            console.log("Operador de mutação:", tspPopulation.mutationOperator,
                "Cidades:", tspPopulation.cityNum,
                "Tamanho da população:", tspPopulation.popSize,
                "Geração:", tspPopulation.genNum,
                "termpo:", tspPopulation.timer,
                "Melhor:", tspPopulation.paths[0].dist,
                "média:", tspPopulation.meanDistance );
            return tspPopulation.paths[0].dist;
        }
    }, 1);
}