var clX, clY;

var webSocketClient;
var canvasWidth = 640;
var canvasHeight = 480;
//clX = 450;
//clY = 250;
console.log("X:", clX, ", Y:", clY);

// WebSocket message handler. when message arrives, this function handle the data.
function webSocketMessageHandler(data) {
    switch (data.type) {
        case "COORDINATE":
            clX = data.x * canvasWidth;
            clY = data.y * canvasHeight;
            console.log("X:", clX, ", Y:", clY);
            break;
        case "GESTURE":
            break;
    }
}

// Handles connection to websocket with connect and disconnect buttons. takes IP from textbox
function setWebsocketConnectionControls() {
    $('#connect').click(function() {
        if (webSocketClient) {
            webSocketClient.close();
        }
        setTimeout(function() {
            webSocketClient = createWebSocketClient($('#ipTextBox').val(), 12012, webSocketMessageHandler);
        }, 200);
    });
    $('#disconnect').click(function() {
        if (webSocketClient) {
            webSocketClient.close();
        }
    });
}

// Main function that handles the websocket and canvas
function catchTheSquare() {
    // THIS WILL BE USED WHEN WEB SOCKET SERVER WILL BE ON LOCALHOST
    // webSocketClient = createWebSocketClient('localhost', 12012, webSocketMessageHandler);
    setWebsocketConnectionControls();
    var currX =0;
    var currY = 0;
    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");

    // Timing and frames per second
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;

    // Level properties
    var level = {
        x: 1,
        y: 65,
        width: canvas.width - 2,
        height: canvas.height - 66
    };

    // Square
    var square = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        xdir: 0,
        ydir: 0,
        speed: 0
    }

    // Score
    var score = 0;

    //mouse
    var cxt = $(canvas).get(0).getContext("2d");
    var canvasWidth = $(canvas).width();
    var canvasHeight = $(canvas).height();

    var balls=[];
    var speedAnimate=40;
    var speedMouse=50;
    var figureNum=1;
    var mousePress=false;
    var ballSelect=false;
    var ballSelectNum;


    var Ball =  function(x,y){
        this.x=x;
        this.y=y;
        this.r=10;
        this.c="#339933";
        this.select=true;

        this.update = function(){
            if(!this.select){
            }

        }

        this.drawBall= function (){

            cxt.fillStyle=this.c;
            cxt.beginPath();
            cxt.arc(this.x,this.y,10,0,Math.PI*2,true);
            cxt.closePath();
            cxt.fill();
        }
    }


    var beginBall = function(x,y){

        balls.push(new Ball(x,y));}

    // Initialize the game
    function init() {
        // Add mouse events
        onMouseMove();
        initiateLaserSequenceRecursion();
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseout", onMouseOut);

        // Initialize the square
        square.width = 100;
        square.height = 100;
        square.x = level.x + (level.width - square.width) / 2;
        square.y = level.y + (level.height - square.height) / 2;
        square.xdir = 1;
        square.ydir = 1;
        square.speed = 100;

        // Initialize the score
        score = 0;

        // Enter main loop
        main(0);

        $(window).bind("resize", resizeWindow);
    }

    function resizeWindow(evt) {
        canvas.height = $(window).height();
        canvas.width = $(window).width();
    }

    // Main loop
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);

        // Update and render the game
        update(tframe);
        render();
    }

    // Update the game state
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;

        // Update the fps counter
        updateFps(dt); //this function is not vital. just calculates frame per second. no effect on game.

        // Move the square, time-based
        square.x += dt * square.speed * square.xdir;
        square.y += dt * square.speed * square.ydir;

        // Handle left and right collisions with the level
        if (square.x <= level.x) {
            // Left edge
            square.xdir = 1;
            square.x = level.x;
        } else if (square.x + square.width >= level.x + level.width) {
            // Right edge
            square.xdir = -1;
            square.x = level.x + level.width - square.width;
        }

        // Handle top and bottom collisions with the level
        if (square.y <= level.y) {
            // Top edge
            square.ydir = 1;
            square.y = level.y;
        } else if (square.y + square.height >= level.y + level.height) {
            // Bottom edge
            square.ydir = -1;
            square.y = level.y + level.height - square.height;
        }
    }

    function updateFps(dt) { //why would i need this?
        if (fpstime > 0.25) {
            // Calculate fps
            fps = Math.round(framecount / fpstime);

            // Reset time and framecount
            fpstime = 0;
            framecount = 0;
        }

        // Increase time and framecount
        fpstime += dt;
        framecount++;
    }

    // Render the game
    function render() {
        onMouseMove();
        initiateLaserSequenceRecursion();
        // Draw the frame
        drawFrame();

        // Draw the square
        context.fillStyle = "#ff8080";
        context.fillRect(square.x, square.y, square.width, square.height);

        // Draw score inside the square
        context.fillStyle = "#ffffff";
        context.font = "38px Verdana";
        var textdim = context.measureText(score);
        context.fillText(score, square.x+(square.width-textdim.width)/2, square.y+65);

        // console.log(Ball);
        balls[0].drawBall();

    }

    // Draw a frame with a border
    function drawFrame() {
        // Draw background and a border
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#e8eaec";
        context.fillRect(1, 1, canvas.width-2, canvas.height-2);

        // Draw header
        context.fillStyle = "#303030";
        context.fillRect(0, 0, canvas.width, 65);

        // Draw title
        context.fillStyle = "#ffffff";
        context.font = "24px Verdana";
        context.fillText("Bouncy Square - Physikal", 10, 30);

        // Display fps
        context.fillStyle = "#ffffff";
        context.font = "12px Verdana";
        context.fillText("Fps: " + fps, 13, 50);
    }

    // Mouse event handlers
    function onMouseDown(e) {}

    function onMouseMove() {
        // Get the mouse position
        var pos = getMousePos(canvas, clX, clY);

        // Check if we clicked the square

        if (pos.x >= square.x && pos.x <= square.x + square.width &&
            pos.y >= square.y && pos.y <= square.y + square.height) {
            // Increase the score
            score += 1;

            // Increase the speed of the square by 10 percent
            square.speed *= 1.1;

            // Give the square a random position
            square.x = Math.floor(Math.random()*(level.x+level.width-square.width));
            square.y = Math.floor(Math.random()*(level.y+level.height-square.height));

            // Give the square a random direction
            square.xdir = Math.floor(Math.random() * 2) * 2 - 1;
            square.ydir = Math.floor(Math.random() * 2) * 2 - 1;
        }
    }

    function onMouseUp(e) {}
    function onMouseOut(e) {}

    // Get the mouse position
    function getMousePos(canvas, clientX, clientY) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: clientX,// Math.round((clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: clientY//Math.round((clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }

    //mouse
    //$(canvas).mousemove(function(e){
    function initiateLaserSequenceRecursion(){
        mousePress = true;
        currX =balls[0].x=clX;//e.pageX;
        currY =balls[0].y=clY;//e.pageY;
        balls[0].select=true;
        balls[0].c="#339933";


        for(var i=0;i<figureNum;i++){

            //var distX=e.pageX-balls[i].x;
            var distX=clX-balls[i].x;
            //var distY=e.pageY-balls[i].y;
            var distY=clY-balls[i].y;
            var distance = Math.sqrt((distX*distX)+(distY*distY));

            if(distance<=10){
                ballSelect=true;
                ballSelectNum=i;
                balls[i].select=true;

                break;
            }

            //else{balls[i].c="#FFED79";}

        }

        if(mousePress && ballSelect){
            balls[ballSelectNum].x=clX;//e.pageX;
            balls[ballSelectNum].y=clY;//e.pageY;
            balls[ballSelectNum].c="#339933";
        }
    }
    //});


    cxt.fillRect(0, 0, canvasWidth, canvasHeight);

    for(var i=0;i<figureNum;i++){
        beginBall(Math.random()*260+10,Math.random()*260+10,
                  Math.random()*2-1,Math.random()*.5-.5)
    }   

    // Call init to start the game
    init();
};