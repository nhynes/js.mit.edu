var server = require('http').createServer(),
	io = require('socket.io')( server )

io.on( 'connection', function( socket ) {
    var username,
        room

    // NOTE: once again, if you find yourself writing more than three lines of code, you're writing
    //       too much code. This is just supposed to give you a feel for websocket libraries

    socket.on( 'login', function( uname ) {
        // store the provided username and emit a loginsuccess
    })

    socket.on( 'join', function( roomToJoin ) {
        if ( !username ) {
			return // ignore spurious joins
		}
        if ( room ) {
            socket.leave( room ) // only join most recent room
        }

        // store the user's new room, join it, and emit a joinsuccess
        // Hint: use http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving as a template
    })

    socket.on( 'message', function( msg ) {
        if ( !username || !room ) { return } // ignore spurious messages

        // emit a message event to only the currently joined room with an object payload
        // the format of which is { username: <the username>, msg: <the message> }
        // Hint: use http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving as a template
    })
})

server.listen( 8888 )
