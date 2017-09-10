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
    // // タッチを開始すると実行されるイベント
    document.addEventListener("touchstart",TouchEventFunc);
    // タッチしたまま平行移動すると実行されるイベント
    document.addEventListener("touchmove",TouchEventFunc);
    // タッチを終了すると実行されるイベント
    document.addEventListener("touchend",TouchEventFunc);
}

// タッチすると実行される関数           
function TouchEventFunc(e){
    // TouchList オブジェクトを取得
   var touch_list = e.changedTouches;

   // 中身に順番にアクセス
   var i;
   var num = touch_list.length;
   for(i=0;i < num;i++){

        // Touch オブジェクトを取得
       var touch = touch_list[i];

       // 出力テスト
       console.log(touch);
    }
}

function drawPlayer(x,y,w,h){
    ctx.clearRect(0, 0, screenW, screenH);
    ctx.beginPath();
    ctx.fillRect(x, y, w, h);
}

function render() {
    var width = screenW / 4;
    var height = screenH / 25;
    drawPlayer(screenW / 2 - width / 2,screenH / 10 * 9 - height / 2,width,height);
}