var app = require('express')(),
    q = require('q'),
    crypto = require('crypto'),
    mongo = q.nfcall( require('mongodb').MongoClient.connect, 'mongodb://localhost/introjs' ),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    dbcon = mongo.then( function( db ) { return db; }, function( err ) { console.error( err ); } );

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( cookieParser('rbmllr') );

app.post( '/user', function( req, res ) {
    var action = req.body.action,
        name = req.body.name,
        pass = req.body.pass;

    res.set( 'Content-Type', 'text/plain' );

    if ( !name || !pass ) {
        res.status(400).end();
        return;
    }

    if ( action === 'login' ) {
        dbcon.then( function( db ) {
            var users = db.collection('users');

            // q.nfcall( users.findOne.bind( users ), { name: name }, { hashword: 1, salt: 1 } )

            users.findOne( { name: name }, { hashword: 1, salt: 1 }, function( err, data ) {
                var hashpass;

                if ( err ) {
                    res.status(500).end( err );
                    return;
                }
                if ( !data || !data.salt || !data.hashword ) {
                    res.status(401).send();
                    return;
                }

                hashpass = crypto.createHash('sha512').update( data.salt ).update( pass ).digest('hex');
                if ( hashpass === data.hashword ) {
                    res.cookie( 'login', name, { maxAge: 42424242, signed: true } ).end();
                } else {
                    res.status(401).end();
                }
            });
        });
    } else if ( action === 'register' ) {
        dbcon.then( function( db ) {
            var users = db.collection('users');

            return q.nfcall( users.ensureIndex.bind( users ), { name: 1 }, { unique: true } )
            .then( function() {
                return q.nfcall( crypto.pseudoRandomBytes, 8 );
            }, function() {
                res.status(500).end();
            })
            .then( function( randBytes ) {
                var salt = randBytes.toString('base64'),
                    hashword = crypto.createHash('sha512')
                    .update( salt ).update( pass ).digest('hex');

                return q.nfcall( users.insert.bind( users ),
                                { name: name, salt: salt, hashword: hashword });
            })
            .then( function() {
                res.end();
            }, function( err ) {
                if ( err.code === 11000 ) { // duplicate key error
                    res.status(409).end();
                } else {
                    res.status(500).end( err );
                }
            });
        });
    } else {
        res.status(400).end();
    }
});

app.get( '/user', function( req, res ) {
    var action = req.query.action;

    res.set( 'Content-Type', 'text/plain' );

    if ( action === 'checklogin' ) {
        res.status( req.signedCookies.login ? 200 : 401 ).end();
    }  else {
        res.status(400).end();
    }
});

app.listen( 4242 );
