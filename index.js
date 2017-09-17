var ctx;
var screenW,screenH;
var touchX = 0,touchY = 0;
var isGame = false;
var isTitle = true;
var isLoading = false;
var isInitLoad = false;
var hitAudio = new Audio("http://isa130pull.pepper.jp/pong/hit.mp3");
var startAudio = new Audio("http://isa130pull.pepper.jp/pong/start.mp3");

var player = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    point: 0,
    isHitWait: false,
};

var enemy = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    point: 0,
    speed: 0,
    isHitWait: false,
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
    speed: 0,
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
    enemy.speed = screenW / 100;

    ball.w = (screenW / 120 + screenH / 120);
    ball.h = ball.w;

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

    //フォントの初期読み込みにかかりそうな短い時間
    setTimeout(function() {
        isInitLoad = true;
        ctx.fillStyle = "white";
    }, 100);

}

function TouchEventStart(e) {

    touchX =  event.changedTouches[0].pageX;
    touchY =  event.changedTouches[0].pageY;

    if(isTitle && !isLoading) {
        isLoading = true;
        hitAudio.load();
        startAudio.load();
        startAudio.play();
        setTimeout(function(){
            isTitle = false;
            isLoading = false;
            setTimeout(fireBall,1000);            
        },1000);
    }
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
    if(isGame) {
        enemy.x = (enemy.x + enemy.w / 2 < ball.x) ? enemy.x + enemy.speed / 2 : enemy.x - enemy.speed / 2;            
        if (Math.abs( (enemy.x + enemy.w / 2) - ball.x) < enemy.speed) {
            enemy.x = ball.x + ball.w / 2 - enemy.w / 2; 
        }
        else {
            enemy.x = (enemy.x + enemy.w / 2 < ball.x) ? enemy.x + enemy.speed / 2 : enemy.x - enemy.speed / 2;            
        }
    }
    else {
        // ボールが発射されるまでは画面中央に布陣させる
        enemy.x = (enemy.x + enemy.w / 2 < screenW / 2) ? enemy.x + enemy.speed / 2 : enemy.x - enemy.speed / 2;
        if (Math.abs( (enemy.x + enemy.w / 2) - screenW) < enemy.speed) {
            enemy.x = screenW - enemy.w / 2; 
        }
        else {
            enemy.x = (enemy.x + enemy.w / 2 < screenW / 2) ? enemy.x + enemy.speed / 2 : enemy.x - enemy.speed / 2;            
        }
    }
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);    
}

// 得点を描画
function drawPoint() {

    ctx.font = "100px Orbitron";
    ctx.fillText(player.point,screenW/30,screenH/ 20 * 11);
    ctx.fillText(enemy.point,screenW/30,screenH/ 20 * 9);
}

// タイトルを描画
function drawTitle() {
    
    ctx.font = "100px Orbitron";
    var text = "Tap Start";
    var textWidth = ctx.measureText(text);
    if(!isInitLoad){
        ctx.fillStyle = "black";
    }
    ctx.fillText(text,screenW/2 - textWidth.width / 2 ,screenH / 2);        
    
}


// ボールを描画
function drawBall() {
    if (!isGame) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    //壁の跳ね返り
    if(ball.x + ball.w >= screenW) {
        ball.x = screenW - ball.w;
        ball.dx = -ball.dx;

        playHitSE();
    }
    //プレイヤーポイント
    else if(ball.y + ball.h >= screenH) {
        isGame = false;
        setTimeout(fireBall,1000);
        enemy.point++;
    }
    else if(ball.x <= 0) {
        ball.x = 0;
        ball.dx = -ball.dx;

        playHitSE();
    }
    //敵ポイント
    else if(ball.y <= 0) {
        isGame = false;
        setTimeout(fireBall,1000);
        player.point++;
    }

    //プレイヤーバーの跳ね返りチェック
    // 当たり判定
    if( (player.x <= (ball.x + ball.w) && (player.x + player.w) >= ball.x - ball.w)
    &&
        (player.y <= (ball.y + ball.h / 2)  && (player.y + player.h) >= ball.y - ball.h)
    &&
        (!player.isHitWait)
    ){
        playHitSE();
        accelBall();

        //当たった場所によって角度を変える
        var hitXRate = ((ball.x + (ball.w / 2)) - player.x) / player.w;
        var cos = Math.PI + (Math.PI * hitXRate);
        ball.dx = ball.baseDx * Math.cos(cos) * ball.speed;
        ball.dy = -Math.abs(ball.baseDy) * ball.speed;

        player.isHitWait = true;
        setTimeout(function(){
            player.isHitWait = false;
        },100);
    }

    //敵バーの跳ね返りチェック
    // 当たり判定
    if( (enemy.x <= ball.x + ball.w && (enemy.x + enemy.w) >= ball.x - ball.w)
    &&
        (enemy.y + enemy.h >= ball.y - ball.h / 2  &&  enemy.y <= ball.y + ball.h / 2)
    &&
        (!enemy.isHitWait)
        ){
            playHitSE();
            accelBall();
            ball.dy = -ball.dy;

            enemy.isHitWait = true;
            setTimeout(function(){
                enemy.isHitWait = false;
            },100);
    }
    

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.w * 2, 0, Math.PI*2, false);
    ctx.fill();
}

//ボールを発射
function fireBall() {
    isGame = true;

    ball.x = screenW / 2 - ball.w;
    ball.y = screenH / 2 - ball.h;
    ball.dx = screenW / (50 + Math.floor(Math.random() * 150));

    //初速補正(ポイントが増えるごとに初速が増す)
    var initSpeed = 1.0;
    var totalPoint = player.point * 1.3 + enemy.point;
    if(totalPoint >= 2 && totalPoint < 5) {
        initSpeed = 1.2;
    }
    else if(totalPoint < 10) {
        initSpeed = 1.4;
    }
    else if(totalPoint < 15) {
        initSpeed = 1.6;
    }
    else if(totalPoint < 20) {
        initSpeed = 1.8;
    }
    else if(totalPoint < 25) {
        initSpeed = 2.0;
    }
    else if(totalPoint >= 25) {
        initSpeed = 2.2;
    }

    ball.dy = (screenH / (120 + Math.floor(Math.random() * 50)) ) * initSpeed;


    //ボールの飛ぶ方角をランダムに
    ball.dx = Math.random() * 2 >= 1 ? ball.dx : -ball.dx;
    ball.dy = Math.random() * 2 >= 1 ? ball.dy : -ball.dy;
    
    ball.baseDx = Math.abs(ball.dx);
    ball.baseDy = Math.abs(ball.dy);

    ball.speed = 1.0;

    //敵の能力もスコアによって変動    
    if (totalPoint < 3) {
        enemy.speed = screenW / 160;        
    }
    else if (totalPoint < 6) {
        enemy.speed = screenW / 140;        
    }
    else if (totalPoint < 8) {
        enemy.speed = screenW / 125;        
    }
    else if (totalPoint < 12) {
        enemy.speed = screenW / 100;        
    }
    else if (totalPoint < 16) {
        enemy.speed = screenW / 90;        
    }
    else if (totalPoint < 20) {
        enemy.speed = screenW / 80;        
    }
    else{
        enemy.speed = screenW / 75;        
    }
}

function playHitSE(){
//    hitAudio.currentTime = 0;
    hitAudio.play();
}

function accelBall(){
    if(ball.speed <= 1.5) {
        ball.speed += 0.15;
    }
    else if(ball.speed <= 2.0) {
        ball.speed += 0.1;
    }
    else if(ball.speed <= 3.0) {
        ball.speed += 0.05;
    }
    else if(ball.speed <= 5.0) {
        ball.speed += 0.02;
    } 
    else {
        ball.speed += 0.005;
    }
}


function render() {
    ctx.clearRect(0, 0, screenW, screenH);
    if (isTitle) {
        drawTitle();
        return;
    }
    drawPlayer();
    drawEnemy();
    drawCenterLine();
    drawPoint();
    drawBall();
    
    //デバッグ用 タッチ座標を表示
    // ctx.font = "40px Orbitron";
    // ctx.fillText("touchpoint...x=" + touchX + "  y=" + touchY,screenW / 3, screenH / 8);    
}