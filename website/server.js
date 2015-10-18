var _ = require('underscore');
var server = require('http').createServer();
var webSocketServer = require('websocket').server;
var wsServer = new webSocketServer({httpServer: server});
var express = require('express');
var app = new express();
var port = 3000;

app.use(express.static(__dirname + '/resources/external-libraries'));
app.use(express.static(__dirname + '/resources/font-awesome'));
app.use(express.static(__dirname + '/resources/img'));
app.use(express.static(__dirname + '/views/css'));
app.use(express.static(__dirname + '/views/js'));
app.use(express.static(__dirname + '/views/games'));
app.use(express.static(__dirname + '/views/gameScripts'));

app.use("/focus",express.static(__dirname + '/resources/external-libraries'));
app.use("/focus",express.static(__dirname + '/resources/img'));
app.use("/focus",express.static(__dirname + '/views/js'));
app.use("/focus",express.static(__dirname + '/views/css'));
app.use("/focus",express.static(__dirname + '/views/gameScripts'));

app.use("/spaceInvader",express.static(__dirname + '/resources/external-libraries'));
app.use("/spaceInvader",express.static(__dirname + '/resources/img'));
app.use("/spaceInvader",express.static(__dirname + '/views/js'));
app.use("/spaceInvader",express.static(__dirname + '/views/css'));
app.use("/spaceInvader",express.static(__dirname + '/views/gameScripts'));

app.get('/catchTheSquare', function(req,res) {
	res.sendFile(__dirname+ '/views/games/catchTheSquare/catchTheSquare.html');
});

app.get('/focus', function(req,res) {
	res.sendFile(__dirname+ '/views/games/focus/focus.html');
});

app.get('/spaceInvader', function(req,res) {
	res.sendFile(__dirname+ '/views/games/spaceInvader/spaceInvader.html');
});

app.get('/home', function(req,res) {
	res.sendFile(__dirname+ '/index.html');
});

server.on('request', app);
server.listen(port, function() {
	console.log('Listening to port ' + port);
});



var clientConns = [];
var motionSensorConn = null;

// wsServer.on('request', function(request) {
	
// 	var isMotionSensor = false;
// 	if (request.httpRequest.headers.device && request.httpRequest.headers.device == "MotionSensor") {
// 		if (motionSensorConn) {
// 			request.reject();
// 			return;
// 		} else {
// 			var connection = motionSensorConn = request.accept(null, request.origin);
// 			isMotionSensor = true;
// 			Log('Connection accepted from motion sensor.');
// 		}
// 	} else {
// 		var connection = request.accept(null, request.origin);
// 		var index = clientConns.push(connection);
// 		Log('Connection accepted from client.');
// 	}

// 	// user sent some message
// 	connection.on('message', function(message) {
// 		if(isMotionSensor) {
// 			try {
// 				jsonMessage = JSON.parse(message.utf8Data);
// 				console.log(jsonMessage);
// 				_.each(clientConns, function broadcast(conn, key, clientConns) {
// 					conn.send(JSON.stringify(jsonMessage));
// 				});
// 			} catch (e) {
// 				Log('Received non-JSON formatted data from motion sensor');
// 			}
// 		} else {
// 			console.log(message.utf8Data);
// 		}
// 	});

// 	// user disconnected
// 	connection.on('close', function(connection) {
// 		if(isMotionSensor) {
// 			motionSensorConn = null;
// 			Log('Motion sensor disconnected.');
// 		} else {
// 			clientConns.splice(index, 1);
// 			Log('Client disconnected.');
// 		}
// 	});
// });

function Timestamp() {
	return (new Date()).toLocaleString();
}

function Log(message) {
	console.log(Timestamp() + ' ' + message);
}