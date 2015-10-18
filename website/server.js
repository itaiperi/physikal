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

app.use("/catchTheSquare",express.static(__dirname + '/resources/external-libraries'));
app.use("/catchTheSquare",express.static(__dirname + '/resources/img'));
app.use("/catchTheSquare",express.static(__dirname + '/views/js'));
app.use("/catchTheSquare",express.static(__dirname + '/views/css'));
app.use("/catchTheSquare",express.static(__dirname + '/views/gameScripts'));

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

app.get('/', function(req,res) {
	res.sendFile(__dirname+ '/index.html');
});

app.get('/catchTheSquare', function(req,res) {
	res.sendFile(__dirname+ '/views/games/catchTheSquare/catchTheSquare.html');
});

app.get('/focus', function(req,res) {
	res.sendFile(__dirname+ '/views/games/focus/focus.html');
});

app.get('/spaceInvader', function(req,res) {
	res.sendFile(__dirname+ '/views/games/spaceInvader/spaceInvader.html');
});

server.on('request', app);
server.listen(port, function() {
	console.log('Listening to port ' + port);
});

function Timestamp() {
	return (new Date()).toLocaleString();
}

function Log(message) {
	console.log(Timestamp() + ' ' + message);
}