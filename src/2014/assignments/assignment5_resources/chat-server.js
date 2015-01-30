//When using Express, make sure you set up sockets.io this way
var express		= require("express");
var app			= express();
var server		= require("http").createServer(app);
var io			= require("socket.io").listen(server);
//don't forget to npm install socket.io


io.sockets.on('connection', function(socket) {
	/* Check out socket.io rooms for an easy way to make "rooms"
	   This library provides a lot of out-of-the-box functionality */

	//you can use socket.broadcast.emit("event name", "some data")
	//to send a message to all users except the current socket.
	//If the event name argument is left out, it will default to be "message"
	//Here's an example:
	socket.broadcast.emit('connect', 'Someone has joined the room'); //Maybe make this "username has joined the room"?

	socket.on('join', funtion(data, callback)) {
		//here's where you'd handle your multiple rooms
		//using socket.join("roomName")
		//you could then socket.broadcast.to("roomName").emit("event", "data")

		socket.set("username", data, function() {
			socket.emit("ACK"); //sends to only the socket
		});
	});

	socket.on('message', function(data, callback) {
		//Possibly store the message to an chat room object
		//At the very least, broadcast the message to the other users
		//This must include the sender's username (don't assume that the client will offer one)

		socket.get("username", function(err, username) {
			if(err !== null) {
				console.log("Error getting username");
				return;
			}
			if(!username) {
				socket.emit("error", "no username");
				return;
			}

			//your code here
			//note that you can emit JS objects that will be serialized as JSON
		});
	});

	socket.on('disconnect', function() {
		//Maybe send a "username has left the room message"
	});
});

//Start listening on port 4242 on all interfaces (localhost included)
server.listen(4242, "0.0.0.0");