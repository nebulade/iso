'use strict';

window.addEventListener('load', init, false);

var gMapCanvas = null;
var gCtx = null;
var gGroundTileMap = null;
var gCamera = {};
var gMousePos = {};
var gMouseDrag = false;
var gMapHover = {};

var map = [
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
    ['ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0','ts_grass0',],
];

var gTileCache = {};

function init() {
    gMapCanvas = window.document.getElementById('map');
    gMapCanvas.width = 1280;
    gMapCanvas.height = 500;
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
        }
    }, false);
    gMapCanvas.addEventListener('mouseup', function () {
        gMouseDrag = null;
        gCamera.drag = null;
    }, false);

    gCtx = gMapCanvas.getContext('2d');

    gCamera.x = 0;
    gCamera.y = 0;

    loadImage('ts_beach0');

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
    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[y].length; x++) {
            if (!gTileCache[map[y][x]]) loadImage(map[y][x]);

            var coords = translateMapToScreen({x: x, y: y});

            gCtx.fillStyle = 'rgb(' + (256 * Math.random()).toFixed() + ', ' + (256 * Math.random()).toFixed() + ', ' + (256 * Math.random()).toFixed() + ')';
            gCtx.fillRect(gCamera.x-4, gCamera.y-4, 8, 8);

            var img = gTileCache[map[y][x]];
            if (gMapHover && gMapHover.x === x && gMapHover.y === y) img = gTileCache['ts_beach0'];

            gCtx.drawImage(img, coords.x, coords.y);
        }
    }
}
