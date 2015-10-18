function createWebSocketClient(webSocketServerIp, webSocketServerPort, messageHandler) {
	var webSocketClient = new ReconnectingWebSocket('ws://' + webSocketServerIp + ':' + webSocketServerPort + '/', null, {reconnectInterval: 100});

	webSocketClient.onmessage = function(event) {
		var dataObject = JSON.parse(event.data);
        messageHandler(dataObject);
	};

	webSocketClient.onclose = function() {
		console.log(new Date() + " Socket closed");
	};

	webSocketClient.onopen = function() {
		console.log(new Date() + " Connected");
	};

	return webSocketClient;
};