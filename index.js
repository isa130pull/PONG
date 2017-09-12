var ctx;
var screenW,screenH;

var touchX = 0,touchY = 0;
var player;

var player = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,

    function(){

    }
};


function init(){
    window.scrollTo(0,0);

    var canvas = document.getElementById("canvas");
    
    //画面サイズを取得、反映
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    canvas.width = screenW;
    canvas.height = screenH;

    //各パラメータ初期化
    touchX = screenW / 2;
    player.w = screenW / 4;
    player.h = screenH / 25;
    player.x = touchX - player.w / 2;
    player.y = screenH / 20 * 17 - player.h / 2;

    

    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
//    console.log("width= " + screenW + " height= " + screenH);
    //描画タイマー
    setInterval(render,16.6);
    
    //タッチ可能か検出
    var touchStart = ('ontouchstart' in window) ? "touchstart" : "mousedown";
   // var touchMove = ('touchmove' in window) ? "touchmove" : "mousemove";    
    var touchEnd = ('touchend' in window) ? "touchend" : "mouseup";

    // // タッチを開始すると実行されるイベント
    document.addEventListener(touchStart,TouchEventStart);
    // タッチしたまま平行移動すると実行されるイベント
    document.addEventListener("touchmove",TouchEventMove);
    // タッチを終了すると実行されるイベント
    document.addEventListener(touchEnd,TouchEventEnd);

}


function TouchEventStart(e) {
    touchX =  event.changedTouches[0].pageX;
    touchY =  event.changedTouches[0].pageY;
}

function TouchEventMove(e) {
    event.preventDefault(); // タッチによる画面スクロールを止める
    touchX =  event.changedTouches[0].pageX;
    touchY =  event.changedTouches[0].pageY;
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
    var adjustTouchX = touchX - player.w / 10 * 6;
    var dx = adjustTouchX - player.x;
    var absDx = Math.abs(dx);
    if (absDx > screenW / 2) {
        player.x += (dx / 6);
    } else if(absDx > screenW / 4) {
        player.x += (dx / 9);        
    } else if(absDx > screenW / 50) {
        player.x += (dx / 12);
    } else if(absDx > screenW / 100) {
        player.x += (dx / 15);
    } 

    drawPlayer(player.x,player.y,player.w,player.h);
}