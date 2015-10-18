var webSocketClient;
var dps = [];
var chart;
var resolutionHeight;
var resolutionWidth;
var canvasStillRatioH;
var canvasStillRatioW;
var dataLength = 500;

var gameName = "focus";//catchTheSquare";

var mousePos = new Array();

var clX;
var clY;

$(document).ready(function() {

	$('#connect').click(function() {
		if (webSocketClient) {
			webSocketClient.close();
			setTimeout(function() {
				webSocketClient = createWebSocketClient($('#ipTextBox').val());
			}, 500);
		} else {
			webSocketClient = createWebSocketClient($('#ipTextBox').val());
		}
	});
	$('#disconnect').click(function() {
		if (webSocketClient) {
			webSocketClient.close();
		}
	});
});

function createWebSocketClient(webSocketServerIp) {
	ws = new ReconnectingWebSocket('ws://' + webSocketServerIp + ':12012/', null, {reconnectInterval: 100});

	ws.onmessage = function(event) {
		var dataObject = JSON.parse(event.data);
		// console.log(dataObject);
		switch(gameName) {
			case "catchTheSquare":
				clX = dataObject.x * 640;
				clY = dataObject.y * 480;
				console.log("Normalized X coordinate" + " " + clX);
				console.log("Normalized Y coordinate" + " " + clY);
			break;
			case "focus":
				clX = dataObject.x * 1400;
				clY = dataObject.y * 670;
				console.log("Slumdog Millionaire" + " " + clX);
				console.log("Q&A" + " " + clY);
			break;
		}
		
		//setLaserBeam(dataObject.x,dataObject.y);
	};

	ws.onclose = function() {
		console.log("Socket closed");
	};

	ws.onopen = function() {
		console.log(new Date() + " Connected");
	};

	return ws;
};