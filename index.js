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
var gDB = null;
var gTileCache = {};

function setTool(tool, source) {
    if (gTool) {
        gTool.button.classList.remove('active');
    } else {
        gTool = {};
    }

    source.classList.add('active');

    loadImage(tool);

    gTool.tool = tool;
    gTool.button = source;
}

function resize() {
    if (gMapCanvas) {
        gMapCanvas.width = window.innerWidth;
        gMapCanvas.height = window.innerHeight - gToolBarHeight;
    }
}

function setupWindow() {
    window.addEventListener('resize', resize, false);
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
            gMap[gMapHover.y][gMapHover.x] = gTool.tool;
        }
    }, false);
    gMapCanvas.addEventListener('mouseup', function () {
        gMouseDrag = null;
        gCamera.drag = null;
    }, false);

    gCtx = gMapCanvas.getContext('2d');
}

function saveMap() {
    console.log('Map saved')
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
                map[y][x] = 'ts_grass0';
            }
        }
    }

    gMap = map;
}

function init() {
    setupWindow();
    setupCanvas();

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

function loadImage(tile) {
    gTileCache[tile] = new Image();
    gTileCache[tile].src = 'Tiles/' + tile + '/straight/45/0.png';
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
            if (!gTileCache[gMap[y][x]]) loadImage(gMap[y][x]);

            var coords = translateMapToScreen({x: x, y: y});

            gCtx.fillStyle = 'rgb(' + (256 * Math.random()).toFixed() + ', ' + (256 * Math.random()).toFixed() + ', ' + (256 * Math.random()).toFixed() + ')';
            gCtx.fillRect(gCamera.x-4, gCamera.y-4, 8, 8);

            var img = gTileCache[gMap[y][x]];
            if (gTool && gMapHover && gMapHover.x === x && gMapHover.y === y) img = gTileCache[gTool.tool];

            gCtx.drawImage(img, coords.x, coords.y);
        }
    }
}
