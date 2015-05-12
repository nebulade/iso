'use strict';

window.addEventListener('load', init, false);

var gMapCanvas = null;
var gCtx = null;
var gCamera = {};
var gMousePos = {};
var gMouseDrag = false;
var gMapHover = {};
var gTool = null;
var gToolBarHeight = 64;
var gMap = null;
var gTileCache = {};


function tileToFile(tile) {
    return 'Tiles/ts_' + tile.name + '0/' + tile.type + '/' + tile.orientation + '/0.png';
}

function loadTile(tile) {
    console.log('load tile', tile.name, tile.type, tile.orientation);

    gTileCache[tile.cacheKey] = new Image();
    gTileCache[tile.cacheKey].src = tileToFile(tile);
}

function Tile(name, type, orientation) {
    this.name = name;
    this.type = type;
    this.orientation = orientation;
    this.cacheKey = name + type + orientation;

    if (!gTileCache[this.cacheKey]) loadTile(this);
    this.img = gTileCache[this.cacheKey];
}

function setTool(source) {
    if (gTool) {
        gTool.button.classList.remove('active');
    } else {
        gTool = {};
    }

    source.classList.add('active');

    gTool.tool = source.attributes.tool.value;
    gTool.tile = new Tile(source.attributes.tool.value, 'straight', 45);
    gTool.button = source;
}

function resize() {
    if (gMapCanvas) {
        gMapCanvas.width = window.innerWidth;
        gMapCanvas.height = window.innerHeight - gToolBarHeight;
    }
}

function setupToolbar() {
    var toolbar = window.document.getElementsByClassName('toolbar')[0];

    for (var i = 0; i < toolbar.children.length; i++) {
        var child = toolbar.children[i];
        if (child.attributes.tool) {
            child.style.backgroundImage = 'url("' + tileToFile(new Tile(child.attributes.tool.value, 'straight', 45)) + '")';
        }
    }
}

function setupWindow() {
    window.addEventListener('resize', resize, false);
}

function getMapTile(pos) {
    if (!gMap[pos.y]) return null;
    if (!gMap[pos.y][pos.x]) return null;
    return gMap[pos.y][pos.x];
}

function setMapTile(pos, tile) {
    if (!tile) return;
    if (!gMap[pos.y]) return;
    if (!gMap[pos.y][pos.x]) return;
    gMap[pos.y][pos.x] = tile;
}

function calculateMapTile(pos) {
    var tile = getMapTile(pos);

    // top row
    var tl = getMapTile({ y: pos.y-1, x: pos.x-1 });
    var to = getMapTile({ y: pos.y-1, x: pos.x });
    var tr = getMapTile({ y: pos.y-1, x: pos.x+1 });

    // middle row
    var le = getMapTile({ y: pos.y, x: pos.x-1 });
    var re = getMapTile({ y: pos.y, x: pos.x+1 });

    // bottom row
    var bl = getMapTile({ y: pos.y+1, x: pos.x-1 });
    var bo = getMapTile({ y: pos.y+1, x: pos.x });
    var br = getMapTile({ y: pos.y+1, x: pos.x+1 });

    // top edge
    var toe;
    if (!to) {
        toe = '';
    } else if (to.name === 'grass' || to.name === 'beach') {
        toe = to.name;
    } else if (to.name === 'grass-beach' && to.type === 'straight') {
        if (to.orientation === 225) toe = 'grass';
        else toe = 'beach';
    } else if (to.name === 'grass-beach' && to.type === 'curve_in') {
        if (to.orientation === 45 || to.orientation === 135) toe = 'beach';
        else toe = 'grass';
    } else {
        toe = to.name;
    }

    // bottom edge
    var boe;
    if (!bo) {
        boe = '';
    } else if (bo.name === 'grass' || bo.name === 'beach') {
        boe = bo.name;
    } else if (bo.name === 'grass-beach' && bo.type === 'straight') {
        if (bo.orientation === 45) boe = 'grass';
        else boe = 'beach';
    } else if (bo.name === 'grass-beach' && bo.type === 'curve_in') {
        if (bo.orientation === 45 || bo.orientation === 135) boe = 'grass';
        else boe = 'beach';
    } else {
        boe = bo.name;
    }

    // left edge
    var lee;
    if (!le) {
        lee = '';
    } else if (le.name === 'grass' || le.name === 'beach') {
        lee = le.name;
    } else if (le.name === 'grass-beach' && le.type === 'straight') {
        if (le.orientation === 315) lee = 'grass';
        else lee = 'beach';
    } else if (le.name === 'grass-beach' && le.type === 'curve_in') {
        if (le.orientation === 45 || le.orientation === 315) lee = 'grass';
        else lee = 'beach';
    } else {
        lee = le.name;
    }

    // right edge
    var ree;
    if (!re) {
        ree = '';
    } else if (re.name === 'grass' || re.name === 'beach') {
        ree = re.name;
    } else if (re.name === 'grass-beach' && re.type === 'straight') {
        if (re.orientation === 135) ree = 'grass';
        else ree = 'beach';
    } else if (re.name === 'grass-beach' && re.type === 'curve_in') {
        if (re.orientation === 45 || re.orientation === 315) ree = 'beach';
        else ree = 'grass';
    } else {
        ree = re.name;
    }

    console.log(pos, toe, boe, lee, ree);

    if (toe === 'grass' && lee === 'grass' && boe === 'grass' && ree === 'grass') tile = new Tile('grass', 'straight', 45);
    if (toe === 'beach' && lee === 'beach' && boe === 'beach' && ree === 'beach') tile = new Tile('beach', 'straight', 45);

    if (toe === 'beach' && lee === 'grass' && boe === 'grass' && ree === 'grass') tile = new Tile('grass-beach', 'straight', 225);
    if (toe === 'beach' && lee === 'beach' && boe === 'grass' && ree === 'beach') tile = new Tile('grass-beach', 'straight', 225);
    if (toe === 'grass' && lee === 'beach' && boe === 'grass' && ree === 'grass') tile = new Tile('grass-beach', 'straight', 315);
    if (toe === 'grass' && lee === 'grass' && boe === 'beach' && ree === 'grass') tile = new Tile('grass-beach', 'straight', 45);
    if (toe === 'grass' && lee === 'beach' && boe === 'beach' && ree === 'beach') tile = new Tile('grass-beach', 'straight', 45);
    if (toe === 'grass' && lee === 'grass' && boe === 'grass' && ree === 'beach') tile = new Tile('grass-beach', 'straight', 135);
    if (toe === 'beach' && lee === 'grass' && boe === 'beach' && ree === 'beach') tile = new Tile('grass-beach', 'straight', 135);
    if (toe === 'beach' && lee === 'beach' && boe === 'beach' && ree === 'grass') tile = new Tile('grass-beach', 'straight', 315);

    if (toe === 'grass' && lee === 'grass' && boe === 'beach' && ree === 'beach') tile = new Tile('grass-beach', 'curve_in', 135);
    if (toe === 'grass' && lee === 'beach' && boe === 'grass' && ree === 'beach') tile = new Tile('grass-beach', 'curve_in', 45);
    if (toe === 'grass' && lee === 'beach' && boe === 'beach' && ree === 'grass') tile = new Tile('grass-beach', 'curve_in', 45);
    if (toe === 'beach' && lee === 'beach' && boe === 'grass' && ree === 'grass') tile = new Tile('grass-beach', 'curve_in', 315);
    if (toe === 'beach' && lee === 'grass' && boe === 'grass' && ree === 'beach') tile = new Tile('grass-beach', 'curve_in', 225);

    return tile;
}

function resetMapTile(pos) {
    setMapTile(pos, calculateMapTile(pos));
}

function putMapTile(pos, tile) {
    setMapTile(pos, tile);

    // Iteration one!

    // cross
    resetMapTile({ y: pos.y-1, x: pos.x });
    resetMapTile({ y: pos.y, x: pos.x-1 });
    resetMapTile({ y: pos.y, x: pos.x+1 });
    resetMapTile({ y: pos.y+1, x: pos.x });

    // top corners
    resetMapTile({ y: pos.y-1, x: pos.x-1 });
    resetMapTile({ y: pos.y-1, x: pos.x+1 });

    // bottom corners
    resetMapTile({ y: pos.y+1, x: pos.x-1 });
    resetMapTile({ y: pos.y+1, x: pos.x+1 });

    // Iteration two!

    // cross
    resetMapTile({ y: pos.y-1, x: pos.x });
    resetMapTile({ y: pos.y, x: pos.x-1 });
    resetMapTile({ y: pos.y, x: pos.x+1 });
    resetMapTile({ y: pos.y+1, x: pos.x });

    // top corners
    resetMapTile({ y: pos.y-1, x: pos.x-1 });
    resetMapTile({ y: pos.y-1, x: pos.x+1 });

    // bottom corners
    resetMapTile({ y: pos.y+1, x: pos.x-1 });
    resetMapTile({ y: pos.y+1, x: pos.x+1 });
}

function setupCanvas() {
    gMapCanvas = window.document.getElementById('map');
    gMapCanvas.oncontextmenu = function (e) {
        e.preventDefault();
    };
    gMapCanvas.addEventListener('mousemove', function (event) {
        var rect = gMapCanvas.getBoundingClientRect();
        gMousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        gMapHover = translateScreenToMap({ x: gMousePos.x, y: gMousePos.y });

        if (gMouseDrag && gCamera.drag) {
            gCamera.x = gCamera.drag.x - (gMousePos.x - gMouseDrag.x);
            gCamera.y = gCamera.drag.y - (gMousePos.y - gMouseDrag.y);
        }
    }, false);
    gMapCanvas.addEventListener('mousedown', function (e) {
        if (e.button === 2) {
            gMouseDrag = { x: gMousePos.x, y: gMousePos.y };
            gCamera.drag = { x: gCamera.x, y: gCamera.y };
        } else if (e.button === 0 && gTool) {
            putMapTile(gMapHover, gTool.tile);
        }
    }, false);
    gMapCanvas.addEventListener('mouseup', function () {
        gMouseDrag = null;
        gCamera.drag = null;
    }, false);

    gCtx = gMapCanvas.getContext('2d');
}

function saveMap() {
    localStorage.map = JSON.stringify(gMap);
}

function loadMap() {
    var map = [];

    if (localStorage.map) {
        map = JSON.parse(localStorage.map);
    } else {
        for (var y = 0; y < 100; y++) {
            map[y] = [];
            for (var x = 0; x < 100; x++) {
                map[y][x] = new Tile('grass', 'straight', 45);
            }
        }
    }

    gMap = map;
}

function init() {
    setupWindow();
    setupCanvas();
    setupToolbar();

    resize();

    gCamera.x = 0;
    gCamera.y = 0;

    loadMap();
    renderLoop();
}

function renderLoop(){
  window.requestAnimationFrame(renderLoop);
  render();
}


function translateMapToScreen(map) {
    var screen = {};

    screen.x = (map.x - map.y) * (64/2);
    screen.y = (map.x + map.y) * (64/4);

    // start in the horizontal middle
    // screen.x = (gMapCanvas.width/2) - (64/2) + screen.x;

    screen.x -= gCamera.x;
    screen.y -= gCamera.y;

    return screen;
}


function translateScreenToMap(screen) {
    var map = {};

    screen.x += gCamera.x;
    screen.y += gCamera.y;

    map.x = (screen.x / (64/2) +  screen.y / (64/4))  / 2;
    map.y = (screen.y / (64/4) - (screen.x / (64/2))) / 2;

    map.y = map.y.toFixed() - 1;
    map.x = map.x.toFixed() - 2;

    return map;
}

function render() {
    gCtx.clearRect(0, 0, gMapCanvas.width, gMapCanvas.height);

    for (var y = 0; y < gMap.length; y++) {
        for (var x = 0; x < gMap[y].length; x++) {
            var coords = translateMapToScreen({x: x, y: y});

            var img = gTileCache[gMap[y][x].cacheKey];
            if (gTool && gMapHover && gMapHover.x === x && gMapHover.y === y) img = gTileCache[gTool.tile.cacheKey];

            gCtx.drawImage(img, coords.x, coords.y);
        }
    }
}
