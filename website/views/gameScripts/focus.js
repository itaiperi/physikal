var clX, clY;
var webSocketClient;
var canvasWidth = 1400;
var canvasHeight = 670;

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

$('.hoverable').hover(
    function() {
        $(this).data('inTime', new Date().getTime()); //setting inTime property to div
    },
    function() {
        var outTime = new Date().getTime();       
        var hoverTime = (outTime - $(this).data('inTime'))/1000; 
        //console.log($('#tally').html());
        var currScore = parseInt($('#tally').html()); 
        console.log(currScore); 
        //var sum = currScore + parseInt($('#tally').html(hoverTime));    
        //console.log("currernt sum is " + sum); 
        $('#tally').html(hoverTime + 's');
    }
);

// Main function that handles the websocket and canvas
function focus() {
    // THIS WILL BE USED WHEN WEB SOCKET SERVER WILL BE ON LOCALHOST
    // webSocketClient = createWebSocketClient('localhost', 12012, webSocketMessageHandler);
    setWebsocketConnectionControls();
    var strSec=0;
    var flag = false;
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
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


    var Ball = function(x,y){
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

        balls.push(new Ball(x,y));
    }

    var coordinates=[{}];
    var Location = function Location(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    var circle1 = new Location(289,82,65);
    var circle2 = new Location(704,145,125);
    var circle3 = new Location(1081,98,75);
    var circle4 = new Location(308,477,155);
    var circle5 = new Location(726,392,70);
    var circle6 = new Location(1125,441,120);

    coordinates.push(circle1);
    coordinates.push(circle2);
    coordinates.push(circle3);
    coordinates.push(circle4);
    coordinates.push(circle5);
    coordinates.push(circle6);

    // Main loop
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);

        // Update and render the game
        render();
    }

    function render(){
        initiateLaserSequenceRecursion();
        // Draw the frame
        drawFrame();
        balls[0].drawBall();
    }


    function resizeWindow(evt) {
        canvas.height = $(window).height();
        canvas.width = $(window).width();
    }

    function drawFrame() {
        // Draw background and a border
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        //context.fillStyle = "#e8eaec";
        //context.fillRect(1, 1, canvas.width-2, canvas.height-2);


        cxt.beginPath();
        cxt.arc(289,82,65,0,2*Math.PI);
        cxt.stroke();

        cxt.beginPath();
        cxt.arc(704,145,125,0,2*Math.PI);
        cxt.stroke();

        cxt.beginPath();
        cxt.arc(1081,98,75,0,2*Math.PI);
        cxt.stroke();

        cxt.beginPath();
        cxt.arc(308,477,155,0,2*Math.PI);
        cxt.stroke();

        cxt.beginPath();
        cxt.arc(726,392,70,0,2*Math.PI);
        cxt.stroke();

        cxt.beginPath();
        cxt.arc(1125,441,120,0,2*Math.PI);
        cxt.stroke();

        //console.log(clX + " " + clY);
        circleCheck(clX,clY,coordinates);
    }

    function addscore(){
        //setting inTime property to div

        var outTime = new Date().getTime();       
        var hoverTime = (outTime - strSec)/1000; 
        $('#tally').html(hoverTime + 's');

    }

    function circleCheck(x,y,coordinates) {
        var xDistance = 0;
        var yDistance = 0;
        var stillIn = false;
        for(var i = 0 ; i < coordinates.length ; i++) {
            xDistance = Math.abs(x - coordinates[i].x);
            yDistance = Math.abs(y - coordinates[i].y);
            if(xDistance <= coordinates[i].r && yDistance <= coordinates[i].r) {
                if(!flag) strSec = new Date().getTime();
                flag=true;
                stillIn = true;
                balls[0].c="#0099FF";
                break;
            }
        }

        if(!stillIn && flag) {
            balls[0].c="#339933";
            flag=false;
            addscore();
        }
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
    cxt.fillStyle="#fff";
    cxt.fillRect(0, 0, canvasWidth, canvasHeight);

    for(var i=0;i<figureNum;i++){
        beginBall(Math.random()*260+10,Math.random()*260+10,
                  Math.random()*2-1,Math.random()*.5-.5)
    }   


    // Enter main loop
    main(0);

    //$(window).bind("resize", resizeWindow);

};