function createWebSocketClient(webSocketServerIp, webSocketServerPort, messageHandler) {
	var webSocketClient = new ReconnectingWebSocket('ws://' + webSocketServerIp + ':' + webSocketServerPort + '/', null, {reconnectInterval: 100});

	webSocketClient.onmessage = function(event) {
		var dataObject = JSON.parse(event.data);
        messageHandler(dataObject);
		/*switch(gameName) {
			case "catchTheSquare":
				clX = dataObject.x * 640;
				clY = dataObject.y * 480;
				console.log("Normalized X coordinate" + " " + clX);
				console.log("Normalized Y coordinate" + " " + clY);
			break;
		}*/
	};

	webSocketClient.onclose = function() {
		console.log("Socket closed");
	};

	webSocketClient.onopen = function() {
		console.log(new Date() + " Connected");
	};

	return webSocketClient;
};