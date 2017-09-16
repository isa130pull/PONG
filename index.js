var ctx;
var screenW,screenH;
var touchX = 0,touchY = 0;

var player = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    point: 0,
};

var enemy = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    point: 0,
};

var ball = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    dx: 0,
    dy: 0,
    baseDx: 0,
    baseDy: 0,
}



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

    enemy.w = player.w;
    enemy.h = player.h;
    enemy.x = player.x;
    enemy.y = screenH / 20 * 2 - enemy.h / 2;


    ball.w = (screenW / 120 + screenH / 120);
    ball.h = ball.w;
    ball.x = screenW / 2 - ball.w;
    ball.y = screenH / 2 - ball.h;
    ball.dx = screenW / (100 + Math.floor(Math.random() * 101));
    ball.dy = screenH / (100 + Math.floor(Math.random() * 101));
    ball.baseDx = ball.dx;
    ball.baseDy = ball.dy;


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

function drawPlayer(){
//    ctx.beginPath();

    //プレイヤーの位置を計算
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
    //プレイヤー描画
    ctx.fillRect(player.x, player.y, player.w, player.h);
}

//画面中央の点線描画
function drawCenterLine(){
    var num = 15;

    var centerLineW = screenW / (num * 2);
    var centerLineH = screenH / 100;
    var centerLineY = screenH / 40 * 19 - centerLineH / 2;
    
    for(var i=0; i<num; i++) {
        //点線描画
        ctx.fillRect(centerLineW / 2 + (i * 2) * centerLineW,centerLineY,centerLineW,centerLineH);
    }    
}

// 敵プレイヤー描画
function drawEnemy() {
    enemy.x = ball.x + ball.w / 2 - player.w / 2;
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);    
}

// 得点を描画
function drawPoint() {
    ctx.font = "100px Orbitron";
    ctx.fillText(player.point,screenW/30,screenH/ 20 * 11);
    ctx.fillText(enemy.point,screenW/30,screenH/ 20 * 9);
}

// ボールを描画
function drawBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    //壁の跳ね返り
    if(ball.x + ball.w >= screenW) {
        ball.x = screenW - ball.w;
        ball.dx = -ball.dx;
    }
    else if(ball.y + ball.h >= screenH) {
        ball.y = screenH - ball.h;
        ball.dy = -ball.dy;
    }
    else if(ball.x <= 0) {
        ball.x = 0;
        ball.dx = -ball.dx;
    }
    else if(ball.y <= 0) {
        ball.y = 0;
        ball.dy = -ball.dy;
    }

    //プレイヤーバーの跳ね返りチェック
    // 当たり判定
    if( (player.x <= (ball.x + ball.w) && (player.x + player.w) >= ball.x)
    &&
        (player.y <= (ball.y + ball.h) )
    ){
        //当たった場所によって角度を変える
        var hitXRate = ((ball.x + ball.w) - player.x) / player.w;
        var cos = Math.PI + (Math.PI * hitXRate);
        ball.dx = ball.baseDx * Math.cos(cos);

        ball.y = player.y - ball.h;
        ball.dy = -ball.dy;
    }

    //敵バーの跳ね返りチェック
    // 当たり判定
    if( (enemy.x <= (ball.x + ball.w) && (enemy.x + enemy.w) >= ball.x)
        &&
        ((enemy.y + enemy.h) >= ball.y)
        ){
            ball.y = enemy.y + enemy.h;
            ball.dy = -ball.dy;
    }
    

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.w * 2, 0, Math.PI*2, false);
    ctx.fill();
}




function render() {
    ctx.clearRect(0, 0, screenW, screenH);
    drawPlayer();
    drawEnemy();
    drawCenterLine();
    drawPoint();
    drawBall();
    
    //デバッグ用 タッチ座標を表示
    // ctx.font = "40px Orbitron";
    // ctx.fillText("touchpoint...x=" + touchX + "  y=" + touchY,screenW / 3, screenH / 8);    
}