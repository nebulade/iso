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

function setMapTile(pos, tile) {
    if (tile.name === 'beach') {
        if (gMap[pos.y-1][pos.x].name === 'grass') gMap[pos.y][pos.x] = new Tile('grass-beach', 'straight', 45);
        else  gMap[pos.y][pos.x] = tile;
    } else {
        gMap[pos.y][pos.x] = tile;
    }
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
            setMapTile(gMapHover, gTool.tile);
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
