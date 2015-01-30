//When using Express, make sure you set up sockets.io this way
var express		= require("express");
var app			= express();
var server		= require("http").createServer(app);
var io			= require("socket.io").listen(server);
//don't forget to npm install socket.io

var board = [["", "", ""], ["", "", ""], ["", "", ""]];

io.sockets.on('connection', function(socket) {

	socket.join("ttt");

	console.log("socket connected!");

	console.log(io.sockets.clients('ttt').length);

	if(io.sockets.clients('ttt').length > 1) {
		socket.set("player","o");
	} else {
		socket.set("player", "x", function() {
			console.log("SET X");
		});
	}

	socket.on('play', function(data) {
		var moveX = data.x;
		var moveY = data.y;
		socket.get("player", function(err, letter) {
			if(!board[moveX][moveY]) {
				console.log("sending letter: "+letter);
				board[moveX][moveY] = letter;
				var won = checkIfWon(moveX, moveY);
				io.sockets.emit("play", { x: moveX, y: moveY, letter: letter, win: won});
			}
		});
	});

	socket.on('disconnect', function() {
		// crashEverything();
	});
});

//Start listening on port 4242 on all interfaces (localhost included)
server.listen(4242, "0.0.0.0");

function checkIfWon(rank, file) {
	var isRowSame = board[0][file] === board[1][file] &&
					board[1][file] === board[2][file] &&
					 board[0][file]
	var isColumnSame = board[rank][0] === board[rank][1] &&
					   board[rank][1] === board[rank][2] &&
					   board[rank][0];
	if(isRowSame || isColumnSame) {
		return true;
	}
	return false;
}