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
    // console.log('load tile', tile.name, tile.type, tile.orientation);

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

function Item(name, file) {
    this.name = name;
    this.cacheKey = file;

    if (!gTileCache[this.cacheKey]) {
        gTileCache[this.cacheKey] = new Image();
        gTileCache[this.cacheKey].src = file;
    }

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
    return gMap[pos.y][pos.x].tile;
}

function edgeMap(tile) {
    if (!tile) return null;

    var map = [];

    if (tile.name === 'grass') return ['g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'];
    if (tile.name === 'beach') return ['b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'];

    if (tile.name === 'grass-beach') {
        map = ['b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'];

        if (tile.type === 'straight') {
            if (tile.orientation === 45) map[0] = map[1] = map[2] = 'g';
            if (tile.orientation === 135) map[6] = map[7] = map[0] = 'g';
            if (tile.orientation === 225) map[4] = map[5] = map[6] = 'g';
            if (tile.orientation === 315) map[2] = map[3] = map[4] = 'g';
        } else if (tile.type === 'curve_in') {
            if (tile.orientation === 45) map[0] = map[1] = map[2] = map[3] = map[4] = 'g';
            if (tile.orientation === 135) map[6] = map[7] = map[0] = map[1] = map[2] = 'g';
            if (tile.orientation === 225) map[4] = map[5] = map[6] = map[7] = map[0] = 'g';
            if (tile.orientation === 315) map[2] = map[3] = map[4] = map[5] = map[6] = 'g';
        } else if (tile.type === 'curve_out') {
            if (tile.orientation === 45)  map[2] = 'g';
            if (tile.orientation === 135) map[0] = 'g';
            if (tile.orientation === 225) map[6] = 'g';
            if (tile.orientation === 315) map[4] = 'g';
        } else {
            throw(new Error('unknown tile ' + tile.name + ' type ' + tile.type));
        }

        return map;
    }

    throw(new Error('unknown tile ' + tile.name + ' type ' + tile.type));
}

function edgeMapToTile(map) {
    function check(type) {
        var args = [];
        for (var a in arguments) args.push(arguments[a]);
        args.shift();
        return args.every(function (a) { return map[a] === type; });
    }

    if (check('g', 0, 1, 2, 3, 4, 5, 6, 7)) return new Tile('grass', 'straight', 45);
    if (check('b', 0, 1, 2, 3, 4, 5, 6, 7)) return new Tile('beach', 'straight', 45);

    if (check('g', 2) && check('b', 0, 1, 3, 4, 5, 6, 7)) return new Tile('grass-beach', 'curve_out', 45);
    if (check('g', 0) && check('b', 1, 2, 3, 4, 5, 6, 7)) return new Tile('grass-beach', 'curve_out', 135);
    if (check('g', 6) && check('b', 0, 1, 2, 3, 4, 5, 7)) return new Tile('grass-beach', 'curve_out', 225);
    if (check('g', 4) && check('b', 0, 1, 2, 3, 5, 6, 7)) return new Tile('grass-beach', 'curve_out', 315);

    if (check('g', 0, 1, 2) && check('b', 3, 4, 5, 6, 7)) return new Tile('grass-beach', 'straight', 45);
    if (check('g', 6, 7, 0) && check('b', 1, 2, 3, 4, 5)) return new Tile('grass-beach', 'straight', 135);
    if (check('g', 4, 5, 6) && check('b', 0, 1, 2, 3, 7)) return new Tile('grass-beach', 'straight', 225);
    if (check('g', 2, 3, 4) && check('b', 0, 1, 5, 6, 7)) return new Tile('grass-beach', 'straight', 315);

    if (check('g', 0, 1, 2, 3, 4) && check('b', 5, 6, 7)) return new Tile('grass-beach', 'curve_in', 45);
    if (check('g', 6, 7, 0, 1, 2) && check('b', 3, 4, 5)) return new Tile('grass-beach', 'curve_in', 135);
    if (check('g', 4, 5, 6, 7, 0) && check('b', 1, 2, 3)) return new Tile('grass-beach', 'curve_in', 225);
    if (check('g', 2, 3, 4, 5, 6) && check('b', 7, 0, 1)) return new Tile('grass-beach', 'curve_in', 315);

    // add those to allow placing tile without similar neighbours
    if (check('g', 0, 1, 2) && check('b', 5)) return new Tile('grass-beach', 'straight', 45);
    if (check('g', 6, 7, 0) && check('b', 3)) return new Tile('grass-beach', 'straight', 135);
    if (check('g', 4, 5, 6) && check('b', 1)) return new Tile('grass-beach', 'straight', 225);
    if (check('g', 2, 3, 4) && check('b', 7)) return new Tile('grass-beach', 'straight', 315);

    if (check('g', 1, 2) && check('b', 3, 4, 5, 6, 7, 0)) return new Tile('grass-beach', 'curve_out', 45);
    if (check('g', 2, 3) && check('b', 4, 5, 6, 7, 0, 1)) return new Tile('grass-beach', 'curve_out', 45);

    if (check('g', 0, 7) && check('b', 1, 2, 3, 4, 5, 6)) return new Tile('grass-beach', 'curve_out', 135);
    if (check('g', 0, 1) && check('b', 2, 3, 4, 5, 6, 7)) return new Tile('grass-beach', 'curve_out', 135);

    if (check('g', 5, 6) && check('b', 7, 0, 1, 2, 3, 4)) return new Tile('grass-beach', 'curve_out', 225);
    if (check('g', 6, 7) && check('b', 0, 1, 2, 3, 4, 5)) return new Tile('grass-beach', 'curve_out', 225);

    if (check('g', 3, 4) && check('b', 5, 6, 7, 0, 1, 2)) return new Tile('grass-beach', 'curve_out', 315);
    if (check('g', 4, 5) && check('b', 6, 7, 0, 1, 2, 3)) return new Tile('grass-beach', 'curve_out', 315);

    // fallbacks in case all edges are from the same tile, ignore corners now
    if (check('b', 1, 3, 5, 7)) return new Tile('beach', 'straight', 45);
    if (check('g', 1, 3, 5, 7)) return new Tile('grass', 'straight', 45);

    console.error('No tile found for', map);
}

function setMapTile(pos, tile) {
    if (!tile) return;
    if (!gMap[pos.y]) return;
    if (!gMap[pos.y][pos.x]) return;
    gMap[pos.y][pos.x].tile = tile;
}

function calculateMapTile(pos) {
    // top row
    // var tl = edgeMap(getMapTile({ y: pos.y-1, x: pos.x-1 }));
    var to = edgeMap(getMapTile({ y: pos.y-1, x: pos.x }));
    // var tr = edgeMap(getMapTile({ y: pos.y-1, x: pos.x+1 }));

    // middle row
    var le = edgeMap(getMapTile({ y: pos.y, x: pos.x-1 }));
    var ri = edgeMap(getMapTile({ y: pos.y, x: pos.x+1 }));

    // bottom row
    // var bl = edgeMap(getMapTile({ y: pos.y+1, x: pos.x-1 }));
    var bo = edgeMap(getMapTile({ y: pos.y+1, x: pos.x }));
    // var br = edgeMap(getMapTile({ y: pos.y+1, x: pos.x+1 }));

    // calculate edges and corners

    //           0
    //        7 - - 1
    //      6 -     - 2
    //        5 - - 3
    //           4

    // return = edgeMapToTile([tl[4], to[5], tr[6], ri[7], br[0], bo[1], bl[2], le[3]]);
    return edgeMapToTile([to[6], to[5], to[4], ri[7], bo[2], bo[1], bo[0], le[3]]);
}

function resetMapTile(pos) {
    setMapTile(pos, calculateMapTile(pos));
}

function putMapTile(pos, tile) {
    setMapTile(pos, tile);


    for (var i = 0; i < 10; ++i) {
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
                map[y][x] = {
                    tile: new Tile('grass', 'straight', 45),
                    item: Math.random() < 0.03 ? new Item('tree_0', 'tree_0.png') : null
                };
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
  // window.requestAnimationFrame(renderLoop);
  window.setTimeout(renderLoop, 500);
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

    var y, x, coords;

    for (y = 0; y < gMap.length; y++) {
        for (x = 0; x < gMap[y].length; x++) {
            coords = translateMapToScreen({x: x, y: y});

            var img = gTileCache[gMap[y][x].tile.cacheKey];
            if (gTool && gMapHover && gMapHover.x === x && gMapHover.y === y) img = gTileCache[gTool.tile.cacheKey];

            gCtx.drawImage(img, coords.x, coords.y);
        }
    }

    for (y = 0; y < gMap.length; y++) {
        for (x = 0; x < gMap[y].length; x++) {
            if (!gMap[y][x].item) continue;

            coords = translateMapToScreen({x: x, y: y});

            var img = gTileCache[gMap[y][x].item.cacheKey];

            gCtx.drawImage(img, coords.x, coords.y);
        }
    }
}
