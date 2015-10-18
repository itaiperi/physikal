var _ = require('underscore');
var server = require('http').createServer();
var webSocketServer = require('websocket').server;
var wsServer = new webSocketServer({httpServer: server});
var express = require('express');
var app = new express();
var port = 12012;

app.use(express.static(__dirname + '/resources/external-libraries'));

server.on('request', app);
server.listen(port, function () {
    console.log('Listening to port ' + port);
});


var clientConns = [];
var imageProcessorConn = null;

wsServer.on('request', function(request) {

    var isImageProcessor = false;
    if (request.httpRequest.headers.device && request.httpRequest.headers.device == "ImageProcessor") {
        if (imageProcessorConn) {
            request.reject();
            return;
        } else {
            var connection = imageProcessorConn = request.accept(null, request.origin);
            isImageProcessor = true;
            Log('Connection accepted from image processor.');
        }
    } else {
        var connection = request.accept(null, request.origin);
        var index = clientConns.push(connection);
        Log('Connection accepted from client.');
    }

    // user sent some message
    connection.on('message', function(message) {
        if(message.utf8Data === 'keep-alive') {
            return;
        }
        if(isImageProcessor) {
            _.each(clientConns, function broadcast(conn, key, clientConns) {
                conn.send(message.utf8Data);
            });
        } else {
            console.log(message.utf8Data);
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if(isImageProcessor) {
            imageProcessorConn = null;
            Log('Image processor disconnected.');
        } else {
            clientConns.splice(index, 1);
            Log('Client disconnected.');
        }
    });
});

function Timestamp() {
    return (new Date()).toLocaleString();
}

function Log(message) {
    console.log(Timestamp() + ' ' + message);
}