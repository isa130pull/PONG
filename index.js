var ctx;
var screenW,screenH;

var touchX = 0,touchY = 0;

function init(){
    var canvas = document.getElementById("canvas");
    
    //画面サイズを取得、反映
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    canvas.width = screenW;
    canvas.height = screenH;

    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
//    console.log("width= " + screenW + " height= " + screenH);
    //描画タイマー
    setInterval(render,16.6);
    
    //タッチ可能か検出
    var touchStart = ('ontouchstart' in window) ? "touchstart" : "mousedown";
    var touchMove = ('touchmove' in window) ? "touchmove" : "mousemove";    
    var touchEnd = ('touchend' in window) ? "touchend" : "mouseup";

    // // タッチを開始すると実行されるイベント
    document.addEventListener(touchStart,TouchEventStart);
    // タッチしたまま平行移動すると実行されるイベント
    document.addEventListener(touchmove,TouchEventMove);
    // タッチを終了すると実行されるイベント
    document.addEventListener(touchend,TouchEventEnd);
}


function TouchEventStart(e) {
}

function TouchEventMove(e) {    
}

function TouchEventEnd(e) {
}

function drawPlayer(x,y,w,h){
    ctx.clearRect(0, 0, screenW, screenH);
    ctx.beginPath();
    ctx.fillRect(x, y, w, h);

    ctx.font = "40px 'ＭＳ Ｐゴシック'";
    ctx.fillText("touchpoint...x=" + touchX + "  y=" + touchY,screenW / 3, screenH / 8);
}

function render() {
    var width = screenW / 4;
    var height = screenH / 25;
    drawPlayer(screenW / 2 - width / 2,screenH / 10 * 9 - height / 2,width,height);
}