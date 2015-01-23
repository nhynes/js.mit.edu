var cookie = require('cookie'),
    cookieParser = require('cookie-parser')

module.exports = function( opts ) {
    var credentials = opts.credentials,
        io = opts.io

    io.use( function( ws, next ) {
        var cookies = cookie.parse( ws.request.headers.cookie ),
        signedCookies = cookieParser.signedCookies( cookies, COOKIE_SECRET )

        // TODO: call the next function appropriately by following the example provided
        ws.__username = signedCookies.chatlogin // attach the username here for access later in WebSocket world
    })

    io.on( 'connection', function( ws ) {
        var username = ws.__username,
        group

        ws.on( 'join', function( groupToJoin ) {
            if ( !username ) { return }
            if ( group ) {
                ws.leave( group )
            }
            group = groupToJoin
            ws.join( groupToJoin )
            ws.emit( 'joinsuccess' )
        })

        ws.on( 'message', function( msg ) {
            if ( !username || !group ) { return }

            io.to( group ).emit( 'message', { username: username, msg: msg } )
            ws.emit( 'testmessage', msg )
        })
    })
}
