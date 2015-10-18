//window.onload = function() {
function mouseExperimentload(){
var canvas = $(document.getElementById("viewport")); //$("#myCanvas");
var cxt = canvas.get(0).getContext("2d");

var canvasWidth = canvas.width();
var canvasHeight = canvas.height();

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
		cxt.globalAlpha = 0.7;
	}
}


var beginBall = function(x,y){

		balls.push(new Ball(x,y));}

// This works in the beginning in drawing all the balls
		
var animate = function(){
	cxt.clearRect(0, 0, canvasWidth, canvasHeight);
	
	for(var i=0; i<figureNum; i++){
		balls[i].update();
		balls[i].drawBall();
	}

	setTimeout(animate, speedAnimate);
}

// End of the starter animation function
		
	$(canvas).mousemove(function(e){

		mousePress = true;
		balls[0].x=e.pageX;
		balls[0].y=e.pageY;
		balls[0].select=true;
		balls[0].c="#339933";
	
			for(var i=0;i<figureNum;i++){
			
					var distX=e.pageX-balls[i].x;
					var distY=e.pageY-balls[i].y;
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
			balls[ballSelectNum].x=e.pageX;
			balls[ballSelectNum].y=e.pageY;
			balls[ballSelectNum].c="#339933";
		}
	});
		
	
	$(canvas).mouseup(function(e){
		
		if(ballSelect){
		mousePress=false;
		ballSelect=false;

	
			balls[ballSelectNum].select=false;
			balls[ballSelectNum].c="#FFED79";
	
		}
	})
	


		cxt.fillRect(0, 0, canvasWidth, canvasHeight);
	
		for(var i=0;i<figureNum;i++){
			beginBall(Math.random()*260+10,Math.random()*260+10,
Math.random()*2-1,Math.random()*.5-.5)
		}	
	
	
		animate();
	

	};