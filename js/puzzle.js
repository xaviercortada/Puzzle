/**
 * Created by xavier on 13/06/14.
 */


var canvas;
var context;
var image;
var gridSize = 3;
var boardWidth;
var boardHeigt;
var deltaWidth;
var deltaHeight;
var boardParts = {};
var emptyCell;
var n = 0;
var board;
var dragCell = undefined;

var states = {
    stoped :0,
    started :1,
    finished :2
}

var Board = function(image){
    this.width = canvas.width;
    this.height = canvas.height;
    this.dw = this.width / gridSize;
    this.dh = this.height / gridSize;

    this.iwidth = image.width;
    this.iheight = image.height;
    this.diw = this.iwidth / gridSize;
    this.dih = this.iheight / gridSize;

    this.state = states.stoped;
    this.solved = false;
    this.pending = 0;
}

Board.prototype.shuffle = function(){
    var i = Math.pow(gridSize,2);
    var j;
    var celli, cellj;

    while(i--){
        j = Math.floor(Math.random()*(i+1));
        var xi = Math.floor(i / gridSize);
        var yi = (i % gridSize);
        celli = boardParts[xi][yi];

        if(celli == emptyCell) continue;

        var xj = Math.floor(j / gridSize);
        var yj = (j % gridSize);
        cellj = boardParts[xj][yj];

        if(cellj == emptyCell) continue;

        this.move(cellj,xi,yi);
        this.move(celli,xj,yj);
    }
}

Board.prototype.move = function(cell,i,j){
    boardParts[i][j] = cell;

    cell.moveTo(i,j);

    this.solved = this.pending == 0;

    if(this.solved)
      alert("Puzzle solucionad, enhorabuena!!!");
}

var Cell = function(row, col){
    this.n = n++;
    this.x = row ;
    this.y = col ;
    this.solved = true;
    this.dragActive = false;

}

Cell.prototype.moveTo = function(i,j){
    if(this.solved ^ (this.x == i && this.y == j)){
        this.solved = !this.solved;
        if(this.solved){
            board.pending--;
        }else{
            board.pending++;
        }

    }
}

Cell.prototype.drawImage = function(x, y, w, h){

    context.drawImage(image, this.x * board.diw, this.y * board.dih, board.diw, board.dih, x , y, w, h);
}



var DragCell = function(cell,i,j){
    this.cell = cell;
    this.i = i;
    this.j = j;

    this.startX = 0;
    this.startY = 0;
    this.dragX = 0;
    this.dragY = 0;
    this.cell.dragActive = true;

}

DragCell.prototype.startDrag = function(x,y){
    this.startX = x;
    this.startY = y;
    this.dragX = 0;
    this.dragY = 0;
}

DragCell.prototype.moveDrag = function(x, y){
    if(x > this.startX){
        this.dragX = x - this.startX;
    }else{
        this.dragX = - (this.startX - x);
    }
    if(y > this.startY){
        this.dragY = y - this.startY;
    }else{
        this.dragY = - (this.startY - y);
    }
}

DragCell.prototype.drop = function(target,i,j){
    if(target == emptyCell){
        board.move(this.cell,i,j);
        boardParts[this.i][this.j] = emptyCell;
    }
    this.cell.dragActive = false;
}

DragCell.prototype.drawImage = function(){
    var x = this.i * board.dw;
    var y = this.j * board.dh;

    x += this.dragX;
    y += this.dragY;

    this.cell.drawImage(x , y, board.dw, board.dh);
}



function init(canvasId){

    canvas = $("#"+canvasId)[0];
    context = canvas.getContext('2d');

    boardWidth = canvas.width;
    boardHeigt = canvas.height;

    deltaWidth = boardWidth / gridSize;
    deltaHeight = boardHeigt / gridSize;

    //setImage('img/venezia.jpg')
    var targetImg = $("#sampleImage").attr("src");
    setImage(targetImg);

    canvas.addEventListener( 'touchstart', onTouchStart, false);
    canvas.addEventListener( 'touchend', onTouchEnd, false);
    canvas.addEventListener( 'toucleave', onTouchEnd, false);

    canvas.onmousedown = myDown;
    canvas.onmouseup = myUp;
}

function initTiles(){
    maxWidth = document.body.clientWidth * 50 / 100;
    ratio = maxWidth / image.width;   // get ratio for scaling image
    $(canvas).attr("width", maxWidth);
    $(canvas).attr("height", image.height*ratio);

    setBoard();
    board.shuffle();
    drawTiles();

}


function drawTiles(){
    context.fillStyle = 'white';
    context.fillRect(0,0,board.width, board.height);

    for(var i = 0; i < gridSize; i++){
        for(var j=0; j < gridSize; j++){
            var cell = boardParts[i][j];
            if(cell != emptyCell && !cell.dragActive){
                var x = i * board.dw;
                var y = j * board.dh;
                cell.drawImage(x,y,board.dw, board.dh);

            }
        }
    }
}

function setImage(imagePath){
    image = new Image();
    image.src = imagePath;
    image.addEventListener("load", initTiles, false);
}


function setBoard(){
    board = new Board(image);
    boardParts = new Array(gridSize);
    for(var i = 0; i < gridSize; i++){
        boardParts[i] = new Array(gridSize);
        for(var j = 0; j < gridSize; j++){
            boardParts[i][j] = new Cell(i,j);
        }
    }
    emptyCell = boardParts[0][0];
    board.state = states.started;
}

function onTouchStart(evt){
    evt.preventDefault();
    var touches = evt.changedTouches;
    handleStart(touches[0].pageX, touches[0].pageY);
    canvas.addEventListener( 'touchmove', onTouchMove, false);
}

function onTouchMove(evt){
    evt.preventDefault();
    var touches = evt.changedTouches;
    handleMove(touches[0].pageX, touches[0].pageY);
}

function onTouchEnd(evt){
    evt.preventDefault();
    var touches = evt.changedTouches;
    handleEnd(touches[0].pageX, touches[0].pageY);
}

function myDown(evt){
    handleStart(evt.pageX, evt.pageY);
}


function myMove(evt){
    handleMove(evt.pageX, evt.pageY);
}

function myUp(e){
    handleEnd(e.pageX, e.pageY);
}


function handleStart(pageX, pageY){
    var x = pageX - canvas.offsetLeft;
    var y = pageY - canvas.offsetTop;

    var ix = Math.floor(x / board.dw);
    var iy = Math.floor(y / board.dh);

    var cell = boardParts[ix][iy];
    if(cell.solved) return;

    dragCell = new DragCell(cell,ix,iy);
    dragCell.startDrag(x, y);

    canvas.onmousemove = myMove;
    canvas.style.cursor = 'pointer';
}

function handleMove(pageX, pageY){
    var x = pageX - canvas.offsetLeft;
    var y = pageY - canvas.offsetTop;
    dragCell.moveDrag(x, y);
    drawTiles();
    dragCell.drawImage();
}

function handleEnd(pageX, pageY){
    var x = pageX - canvas.offsetLeft;
    var y = pageY - canvas.offsetTop;

    var ix = Math.floor(x / board.dw);
    var iy = Math.floor(y / board.dh);

    var cell = boardParts[ix][iy];

    dragCell.drop(cell,ix,iy);
    dragCell = undefined;

    drawTiles();

    canvas.removeEventListener( 'touchmove', onTouchMove, false);
    canvas.onmousemove = undefined;
    canvas.style.cursor = 'default';

}





var button = $("#resetButton");
button.click(function(){
    var cells = $("#grid_size")[0];
    gridSize = Math.floor(Math.sqrt(cells.value));
    init('game');
});

function handleFileSelect(evt) {
  var myImage = this.files[0];
    var reader = new FileReader();


  reader.onload = (function(theFile){
        return function(e){
            $("#sampleImage").attr("src", e.target.result);
        };

    })(myImage);

    reader.readAsDataURL(myImage);
}

$("#chooseImage").change(handleFileSelect);

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

//init('game');



