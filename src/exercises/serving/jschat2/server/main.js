var credentials = {
        user: 'YOUR USERNAME HERE',
        pass: 'YOUR PASSWORD HERE'
    },
    COOKIE_SECRET = 'secret cookie signing key',
    app = require('express')(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    path = require('path'),
    serveStatic = require('serve-static'),
    server = require('http').Server( app ),
    io = require('socket.io')( server ),
    user = require('./user')({ credentials: credentials }),
    chat = require('./chat')({ credentials: credentials, io: io })

app.all( '*', function( req, res, next ) {
    res.set( 'Access-Control-Allow-Origin', '*' ) // Allow the checker to make requests
    next()
})

app.use( serveStatic( path.resolve( __dirname, '..', 'client' ) ) )
app.use( cookieParser( COOKIE_SECRET ) )
app.use( bodyParser.urlencoded({ extended: false }) )
app.use( '/user', user ) // mount the user sub-application

server.listen( 8888 )
