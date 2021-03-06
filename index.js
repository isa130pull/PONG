var ctx;
var screenW,screenH;
var touchX = 0,touchY = 0;
var isGame = false;
var isTitle = true;
var isLoading = false;
var isInitLoad = false;
var hitAudio = new Audio("http://isa130pull.pepper.jp/pong/hit.mp3");
var startAudio = new Audio("http://isa130pull.pepper.jp/pong/start.mp3");
var isMute = true;
var isPlayerPrePoint = false; //一つ前にプレイヤーがポイントを取ったかどうかのフラグ
var isGameOver = false;
var isGameClear = false;
var isStageSelect = false;
var difficult = 0; // 0..NORMAL,1..HARD
var isNormalCleared = false;
var isHardCleared = false;
var flashTimes = 0;


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
    baseSpeed: 0,
    speed: 0,
    rad: 0,
}



function init(){
    window.scrollTo(0,0);

    var canvas = document.getElementById("canvas");
    
    //画面サイズを取得、反映
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    canvas.width = screenW;
    canvas.height = screenH;

    initParam();

    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    //描画タイマー
    var requestAnimationFrame = window.requestAnimationFrame ||
    　　　　　　　　　　　　　　　　　　　window.mozRequestAnimationFrame ||
                                  　window.webkitRequestAnimationFrame ||
    　　　　　　　　　　　　　　　　　　　window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
//    window.requestAnimationFrame(render);
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

    if (isLoading) return;
    if(isTitle) {
        isLoading = true;
        //オーディオの読み込み(現在未使用)
        if (!isMute) {
            hitAudio.load();
            startAudio.load();
        }
        setTimeout(function(){
            isTitle = false;
            isLoading = false;
            isStageSelect = true;
        },1000);
    }
    else if(isStageSelect) {
        //難易度NORMALでSTART
        if (touchY >= screenH / 20 * 7 && touchY <= screenH / 20 * 10) {
            isLoading = true;
            difficult = 0;
            setTimeout(function(){
                isLoading = false;
                isStageSelect = false;
                initParam();
                setTimeout(fireBall,3000);    
            },1000);
        }
        //難易度NORMALでHARD
        else if (touchY >= screenH / 20 * 11 && touchY <= screenH / 20 * 15) {
            isLoading = true;
            difficult = 1;
            setTimeout(function(){
                isLoading = false;
                isStageSelect = false;
                initParam();
                setTimeout(fireBall,3000);    
            },1000);
        }

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
        player.x += (dx / 3);
    } else if(absDx > screenW / 4) {
        player.x += (dx / 5);        
    } else if(absDx > screenW / 50) {
        player.x += (dx / 8);
    } else if(absDx > screenW / 100) {
        player.x += (dx / 10);
    } 
    //プレイヤー描画
    // 実際の当たり判定より小さく描画するため補正値をかけている
    ctx.fillRect(player.x * 1.05, player.y * 1.02, player.w * 0.95, player.h * 0.98);
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
        //味方陣地エリアにボールがあり、角度が大きくついている場合は中央付近に移動させる
        if ( (ball.rad <= 0.3 || ball.rad >= 0.7) && ball.y > screenH / 10 * 7){
            moveEnemyCenter();
        }
        else {
            var adjustEnemySpeed = enemy.speed; 

            //ボールの反射角が一定以上ならば加速させる
            if (ball.rad < 0.30 || ball.rad > 0.70) adjustEnemySpeed *= 1.2;
            else if (ball.rad < 0.35 || ball.rad > 0.65) adjustEnemySpeed *= 1.1;
            
            //ボールの速度が一定以上なら加速させる
            //if (ball.speed > 2.5) adjustEnemySpeed *= 1.05;

            //ボールの速度より遅い移動速度であれば若干加速させる
            if (adjustEnemySpeed < Math.abs(ball.dx)) adjustEnemySpeed *= 1.05;
            
            //敵移動速度分移動させる
            enemy.x = (enemy.x + enemy.w / 2 < ball.x) ? enemy.x + adjustEnemySpeed / 2 : enemy.x - adjustEnemySpeed / 2; 
            if (Math.abs( (enemy.x + enemy.w / 2) - ball.x) < adjustEnemySpeed) {            
                enemy.x = ball.x + ball.w / 2 - enemy.w / 2; 
            }
            else {
                enemy.x = (enemy.x + enemy.w / 2 < ball.x) ? enemy.x + adjustEnemySpeed / 2 : enemy.x - adjustEnemySpeed / 2;            
            }
            //画面外に出ないように
            if(enemy.x < 0) enemy.x = 0;
            else if(enemy.x + enemy.w > screenW) enemy.x = screenW - enemy.w;
        }
    }
    else {
    // ボールが発射されるまでは画面中央に布陣させる
    moveEnemyCenter();
    }
    //HARDで5得点取っている時色が変わる
    if (difficult == 1 && player.point >= 5)     ctx.fillStyle = "#FF0000";    
    ctx.fillRect(enemy.x * 1.05, enemy.y * 0.9, enemy.w * 0.95, enemy.h * 0.9);    
    ctx.fillStyle = "#FFFFFF";
}

//敵バーを中央付近に移動させる
function moveEnemyCenter() {
    enemy.x = (enemy.x + enemy.w / 2 < screenW / 2) ? enemy.x + enemy.speed / 2 : enemy.x - enemy.speed / 2;
    if (Math.abs( (enemy.x + enemy.w / 2) - screenW) < enemy.speed) {
        enemy.x = screenW - enemy.w / 2; 
    }
    else {
        enemy.x = (enemy.x + enemy.w / 2 < screenW / 2) ? enemy.x + enemy.speed / 2 : enemy.x - enemy.speed / 2;            
    }
}


// 得点を描画
function drawPoint() {
    ctx.font = "100px Orbitron";

    if (isPlayerPrePoint && !isGame && flashTimes % 20 < 10){}
    else {
        if (player.point >= 6) ctx.fillStyle = "#FFFF00";
        ctx.fillText(player.point,screenW/30,screenH/ 20 * 11);
        ctx.fillStyle = "#FFFFFF";    
    }
    if (!isPlayerPrePoint && !isGame && flashTimes % 20 < 10 && enemy.point != 0){}
    else {
        if (enemy.point >= 6) ctx.fillStyle = "#FFFF00";    
        ctx.fillText(enemy.point,screenW/30,screenH/ 20 * 9);
        ctx.fillStyle = "#FFFFFF";
    }

    //最初のみ説明を表示
    if (!isGame && player.point + enemy.point == 0) {
        var text = "7 POINTS WIN";
        var textWidth = ctx.measureText(text);
        ctx.fillText(text,screenW/2 - textWidth.width / 2 ,screenH / 20 * 7);    
    }
}

// タイトルを描画
function drawTitle() {
    if(!isInitLoad) ctx.fillStyle = "black";
    
    //Tap Startの文字を点滅させる
    var flashTime = isLoading ? 10 : 100;
    ctx.font = "80px Orbitron";
    var text = "Tap Start";
    var textWidth = ctx.measureText(text);

    if(flashTimes % flashTime < flashTime/2 ) {
        ctx.fillText(text,screenW/2 - textWidth.width / 2 ,screenH / 1.5);    
    }

    ctx.font = "160px Orbitron";
    text = (isNormalCleared && isHardCleared) ? "DESHI" : "POPONG";
    textWidth = ctx.measureText(text);
    ctx.fillText(text,screenW/2 - textWidth.width / 2 ,screenH / 3);
}

// ステージセレクト画面
function drawStageSelect() {
    if(!isStageSelect) return;

    ctx.font = "60px Orbitron";
    var text = "SELECT DIFFICULTY";
    var textWidth = ctx.measureText(text);
    ctx.fillText(text,screenW/2 - textWidth.width / 2 ,screenH / 10 * 2);

    ctx.font = "120px Orbitron";

    text = "NORMAL";
    textWidth = ctx.measureText(text);

    if(!isLoading || difficult == 1 || flashTimes % 10 < 5 ) {
        if(isNormalCleared) ctx.fillStyle = "#FFFF00";
        ctx.fillText(text,screenW/2 - textWidth.width / 2 ,screenH / 20 * 9);        
    }
    ctx.fillStyle = "#FFFFFF";
    text = "HARD";
    textWidth = ctx.measureText(text);

    if(!isLoading || difficult == 0 || flashTimes % 10 < 5 ) {
        if(isHardCleared) ctx.fillStyle = "#FFFF00";        
        ctx.fillText(text,screenW/2 - textWidth.width / 2 ,screenH / 20 * 13);
    }

    ctx.fillStyle = "#FFFFFF";
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
    //敵ポイント
    else if(ball.y + ball.h >= screenH) {
        isGame = false;
        isPlayerPrePoint = false;

        if(++enemy.point >= 7) {
            isGameOver = true;
            setTimeout(function(){
                isTitle = true;
            },5000);
        }
        else {
            setTimeout(fireBall,1500);            
        }

    }
    else if(ball.x <= 0) {
        ball.x = 0;
        ball.dx = -ball.dx;

        playHitSE();
    }
    //プレイヤーポイント
    else if(ball.y <= 0) {
        isGame = false;        
        isPlayerPrePoint = true;

        if(++player.point >= 7) {
            isGameClear = true;
            if (difficult == 0) isNormalCleared = true;
            else if(difficult == 1) isHardCleared = true;

            setTimeout(function(){
                isTitle = true;
            },7500);
        }
        else {
            setTimeout(fireBall,1500);
        }

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

        //当たった場所によって角度を変える (範囲 0 〜 0.5)
        var hitXRate = (((ball.x + (ball.w / 2)) - player.x) / (player.w + (ball.w / 2)) ) / 2;

        //rad 1.25〜1.75の範囲
        var rad = Math.PI * 1.25 + (Math.PI * hitXRate);
//        alert("rad..." + rad + " ball.rad..." + ball.rad + " hitXRate..." + hitXRate);
//        alert("radacos..." + Math.acos(rad) + " radasin" + Math.asinh(rad));
        
        if (ball.rad >= 0.1 && ball.rad <= 0.5) rad -= 0.1 * Math.PI;
        else if (ball.rad >= 0.6 && ball.rad <= 0.9) rad += 0.1 * Math.PI;
        
        ball.dx = ball.baseSpeed * Math.cos(rad) * ball.speed;
        ball.dy = ball.baseSpeed * Math.sin(rad) * ball.speed;

        ball.rad = (rad - Math.PI) / Math.PI;

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

    if (isPlayerPrePoint) {
        //敵プレイヤーから発射
        ball.x = enemy.x + enemy.w / 2;
        ball.y = enemy.y + enemy.h + ball.h / 2;
    }
    else {
        //味方プレイヤーから発射
        ball.x = player.x + player.w / 2;
        ball.y = player.y - ball.h / 2;
    }


    var initSpeedArray,initRangeArray,enemySpeedArray,hdpArray;

    //難易度によってパラメータを変える

    //初速補正(ポイントが増えるごとに初速が増す)

    if(difficult == 0) {
        //NORMAL
        initSpeedArray = [1.3,1.5,1.6,1.7,1.8,2.0,2.2];
        initRangeArray = [130,115,100,90,80,70,60];
        enemySpeedArray = [170,150,135,110,100,90,75]
        hdpArray = [0,-10,-20,20,30];
    }
    else if(difficult == 1) {
        //HARD
        initSpeedArray = [2.6,2.8,3.0,3.2,3.3,3.4,3.5];
        initRangeArray = [80,70,60,50,40,30,25];
        enemySpeedArray = [90,80,70,65,50,45,40]
        hdpArray = [0,-10,-20,10,20];
    }


    var initSpeed,initRange,enemySpeed,hdp;
    var initRange = 80;

    var totalPoint = player.point * 1.3 + enemy.point;

    //// 敵との得失点差
    //こっちが大きく勝っている
    if (player.point - enemy.point >= 2) hdp = hdpArray[1];
    else if (player.point - enemy.point >= 4) hdp = hdpArray[2];
    //こっちが負けている
    else if(enemy.point - player.point >= 2) hdp = hdpArray[3];
    else if(enemy.point - player.point >= 4) hdp = hdpArray[4];
    //得失点差が小さい場合
    else hdp = hdpArray[0];

    //敵味方の総得点でパラメータを設定
    if(totalPoint <= 2) {
        initSpeed = initSpeedArray[0];
        initRange = initRangeArray[0];
        enemy.speed = screenW / (enemySpeedArray[0] + hdp);
    }
    else if(totalPoint < 5) {
        initSpeed = initSpeedArray[1];
        initRange = initRangeArray[1];
        enemy.speed = screenW / (enemySpeedArray[1] + hdp);
    }
    else if(totalPoint < 7) {
        initSpeed = initSpeedArray[2];
        initRange = initRangeArray[2];
        enemy.speed = screenW / (enemySpeedArray[2] + hdp);
    }
    else if(totalPoint < 10) {
        initSpeed = initSpeedArray[3];
        initRange = initRangeArray[3];
        enemy.speed = screenW / (enemySpeedArray[3] + hdp);
    }
    else if(totalPoint < 12) {
        initSpeed = initSpeedArray[4];
        initRange = initRangeArray[4];
        enemy.speed = screenW / (enemySpeedArray[4] + hdp);
    }
    else if(totalPoint < 15) {
        initSpeed = initSpeedArray[5];
        initRange = initRangeArray[5];
        enemy.speed = screenW / (enemySpeedArray[5] + hdp);
    }
    else if(totalPoint >= 15) {
        initSpeed = initSpeedArray[6];
        initRange = initRangeArray[6];
        enemy.speed = screenW / (enemySpeedArray[6] + hdp);
    }

    ball.dx = screenW / (initRange + Math.floor(Math.random() * (initRange*1.5) ));
    ball.dy = screenH / 150.0 * initSpeed;


    //ボールの飛ぶ方向をX方向はランダムに
    ball.dx = Math.random() * 2 >= 1 ? ball.dx : -ball.dx;

    //Y方向は前回ポイントを取った方(初回は必ず敵)
    ball.dy = isPlayerPrePoint ? ball.dy : -ball.dy;

    ball.baseSpeed = Math.sqrt(Math.pow(Math.abs(ball.dx),2) + Math.pow(Math.abs(ball.dy),2));
    ball.speed = 1.0;
}

function playHitSE(){
    if (!isMute){
        hitAudio.play();        
    }
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
    flashTimes++;    

    if (isTitle) {
        drawTitle();
        return;
    }
    else if(isStageSelect) {
        drawStageSelect();
        return;
    }

    drawPlayer();
    drawEnemy();
    drawCenterLine();
    drawPoint();
    drawBall();
    drawGameOver();
    drawGameClear();
    
    //デバッグ用 タッチ座標を表示
    // ctx.font = "40px Orbitron";
    // ctx.fillText("touchpoint...x=" + touchX + "  y=" + touchY,screenW / 3, screenH / 8);    
}

var gameEndStrY = 0;
function drawGameOver() {
    if(!isGameOver) return;

    gameEndStrY += 4;
    if (gameEndStrY > screenH / 3) {
        gameEndStrY = screenH / 3;
    }
    ctx.font = "120px Orbitron";
    var text = "GAME OVER...";
    var textWidth = ctx.measureText(text);
    ctx.fillText(text,screenW/2 - textWidth.width / 2 ,gameEndStrY);
    
}

function drawGameClear() {
    if(!isGameClear) return;

    gameEndStrY += 4;
    if (gameEndStrY > screenH / 3) {
        gameEndStrY = screenH / 3;
    }
    ctx.font = "120px Orbitron";
    var text  = "GAME CLEAR!!";
    var textWidth = ctx.measureText(text);
    ctx.fillText(text,screenW/2 - textWidth.width / 2 ,gameEndStrY);

}


function initParam(){
    //各パラメータ初期化
    touchX = screenW / 2;
    player.w = screenW / 4;
    player.h = screenH / 25;
    player.x = touchX - player.w / 2;
    player.y = screenH / 20 * 17 - player.h / 2;
    player.point = 0;

    enemy.w = player.w;
    enemy.h = player.h;
    enemy.x = player.x;
    enemy.y = screenH / 20 * 2 - enemy.h / 2;
    enemy.speed = screenW / 100;
    enemy.point = 0;

    ball.w = (screenW / 120 + screenH / 120);
    ball.h = ball.w;
    ball.rad = 0.5;

    gameEndStrY = - screenH / 10;

    isGameOver = false;
    isGameClear = false;

    isPlayerPrePoint = false;
    flashTimes = 0;
}
