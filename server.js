var app = require('express')(),
    server = require('http').Server( app ),
    io = require('socket.io')( server )
    q = require('q'),
    crypto = require('crypto'),
    mongo = q.nfcall( require('mongodb').MongoClient.connect, 'mongodb://localhost/introjs' ),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    dbcon = mongo.then( function( db ) { return db }, function( err ) { console.error( err ) } ),
    sqlcon = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'UnH4cKaBle'
    }),

    // Exercise servers
    apis = require('./dist/exercises/apis/apis-server'),
    createdb = require('./dist/exercises/serving/createdb')({ dbcon: dbcon, sqlcon: sqlcon }),
    createdbjssit = require('./dist/exercises/becap/createdb')({ dbcon: dbcon, sqlcon: sqlcon })

app.use( bodyParser.json() )
app.use( bodyParser.urlencoded({ extended: true }) )
app.use( cookieParser('rbmllr') )

app.use( '/e/apis', apis )
app.use( '/createdb', createdb )
app.use( '/createdb/jssit', createdbjssit )

app.get( '/user/ip', function( req, res ) {
    res.set( 'Content-Type', 'text/plain' )
    res.end( 'localhost' )
})

app.post( '/user', function( req, res ) {
    var action = req.body.action,
        name = req.body.name,
        pass = req.body.pass,
        question = req.body.question

    res.set( 'Content-Type', 'text/plain' )

    if ( !name || !pass ) {
        console.log( req.body )
        return res.status(400).end()
    }

    if ( action === 'login' ) {
        dbcon.then( function( db ) {
            var users = db.collection('users')

            users.findOne( { name: name }, { hashword: 1, salt: 1 }, function( err, data ) {
                var hashpass

                if ( err ) {
                    res.status(500).end( err )
                    return
                }
                if ( !data || !data.salt || !data.hashword ) {
                    res.status(401).send()
                    return
                }

                hashpass = crypto.createHash('sha512').update( data.salt ).update( pass ).digest('hex')
                if ( hashpass === data.hashword ) {
                    res.cookie( 'login', name, { maxAge: 4242424242, signed: true } ).end()
                } else {
                    res.status(401).end()
                }
            })
        })
    } else if ( action === 'register' ) {
        dbcon.then( function( db ) {
            var users = db.collection('users')

            q.nfcall( users.ensureIndex.bind( users ), { name: 1 }, { unique: true } )
            .then( function() {
                return q.nfcall( crypto.pseudoRandomBytes, 8 )
            }, function() {
                res.status(500).end()
            })
            .then( function( randBytes ) {
                var salt = randBytes.toString('base64'),
                    hashword = crypto.createHash('sha512')
                    .update( salt ).update( pass ).digest('hex')

                return q.nfcall( users.insert.bind( users ),
                                { name: name, salt: salt, hashword: hashword })
            })
            .then( function() {
                res.cookie( 'login', name, { maxAge: 42424242, signed: true } ).end()
                res.end()
            }, function( err ) {
                if ( err.code === 11000 ) { // duplicate key error
                    res.status(409).end()
                } else {
                    res.status(500).end( err )
                }
            })
        })
    } else {
        res.status(400).end()
    }
})

app.post( '/questions', function( req, res ) {
    var user = req.signedCookies.login,
        action = req.body.action,
        qn = req.body.question,
        missing = function() {
            var vals = Array.prototype.slice.call( arguments ).reduce( function( allDefined, val ) {
                return val !== undefined && allDefined
            }, true )
        }


    res.set( 'Content-Type', 'text/plain' )

    if ( !user ) {
        return res.status(401).end()
    }
    if ( missing( qn.questionName, qn.exerciseName, qn.pts, qn.data ) ) {
        return res.status(400).end()
    }


    if ( action === 'save' ) {
        dbcon.then( function( db ) {
            var users = db.collection('users'),
                exerciseField = { _id: 0 },
                enqn = 'exercises.' + qn.exerciseName + '.' + qn.questionName

            exerciseField[ enqn ] = 1

            q.nfcall( users.findOne.bind( users ), { name: user }, exerciseField )
            .then( function( savedData ) {
                var theUpdate = { $set: {} }

                theUpdate.$set[ enqn ] = qn.data

                console.log( enqn )

                if ( !savedData.exercises ||
                     !savedData.exercises[ qn.exerciseName ] ||
                     !savedData.exercises[ qn.exerciseName ][ qn.questionName ] ) {
                    theUpdate.$inc = {}
                    theUpdate.$inc[ 'exercises.' + qn.exerciseName + '.pts' ] = parseInt( qn.pts )
                }

                return q.nfcall( users.update.bind( users ), { name: user }, theUpdate )
            })
            .then( function( result ) {
                console.log( result )
                res.end()
            })
            .catch( function( err ) {
                console.error( err )
                res.status(500).end()
            })
        })
    } else {
        res.status(400).end()
    }
})

app.get( '/questions', function( req, res ) {
    var user = req.signedCookies.login

    res.set( 'Content-Type', 'application/json' )

    if ( !user ) {
        return res.status(401).end()
    }

    dbcon.then( function( db ) {
        var users = db.collection('users'),
        exerciseField = { _id: 0, exercises: 1 }

        q.nfcall( users.findOne.bind( users ), { name: user }, exerciseField )
        .then( function( savedData ) {
            res.end( JSON.stringify( savedData ) )
        })
        .catch( function( err ) {
            console.error( err )
            res.status(500).end()
        })
    })
})

var chat = io.of('/chat').on( 'connection', function( ws ) {
    var username,
        group
    ws.on( 'login', function( uname ) {
        username = uname
        ws.emit( 'loginsuccess' )
        ws.emit( 'testlogin', username )
    })

    ws.on( 'join', function( groupToJoin ) {
        if ( !username ) { return }
        if ( group ) {
            ws.leave( group )
        }
        group = groupToJoin
        ws.join( groupToJoin )
        ws.emit( 'joinsuccess' )
        ws.emit( 'testjoin', group )
    })

    ws.on( 'message', function( msg ) {
        if ( !username || !group ) { return }

        chat.to( group ).emit( 'message', { username: username, msg: msg } )
        ws.emit( 'testmessage', msg )
    })
})

server.listen( 4242 )
