var ctx;
var screenW,screenH;


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
}

function drawPlayer(x,y,w,h){
    ctx.clearRect(0, 0, screenW, screenH);
    ctx.beginPath();
    ctx.fillRect(x, y, w, h);
}

function render() {
    var width = screenW / 8;
    var height = screenH / 25;
    drawPlayer(screenW / 2 - width / 2,screenH / 10 * 9 - height / 2,width,height);
}