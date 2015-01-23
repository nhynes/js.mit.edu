var MongoClient = require('mongodb').MongoClient,
    Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    mysql = require('mysql'),
    createdbApp = require('express')(),
    btoa = require('btoa')

module.exports = function( opts ) {
    var dbcon = opts.dbcon,
        sqlcon = opts.sqlcon

    createdbApp.get( '/', function( req, res ) {
        var name = req.signedCookies.login,
        dbtype = req.query.type,
        pass


        if ( !name || !dbtype ) {
            return res.sendStatus( 400 )
        }

        dbcon.then( function( db ) {
            var users = db.collection('users')

            users.findOne( { name: name }, { 'reg.pass': 1 }, function( err, data ) {
                var pass,
                    sqb = sqlcon.query.bind( sqlcon )

                res.set('Content-Type', 'text/plain')

                if ( err ) {
                    return res.status(500).end( err )
                }
                if ( !data || !data.reg || !data.reg.pass ) {
                    return res.sendStatus( 403 )
                }

                pass = data.reg.pass

                if ( dbtype === 'sql' ) {
                    q.nfcall( sqb, 'CREATE DATABASE IF NOT EXISTS ??', name )
                    .then( function() {
                        return q.nfcall( sqb, 'GRANT ALL ON ??.* TO ??@`%` IDENTIFIED BY ?', [ name, name, pass ] )
                    })
                    .then( function() {
                        return q.nfcall( sqb, 'CREATE TABLE IF NOT EXISTS ??.`users` (`name` VARCHAR(64) NOT NULL PRIMARY KEY, `salt` CHAR(8) NOT NULL, `hash` CHAR(40) NOT NULL)', name )
                    })
                    .then( function() {
                        return q.nfcall( sqb, 'CREATE TABLE IF NOT EXISTS ??.`warmup` (`token` VARCHAR(64))', name )
                    })
                    .then( function( results ) {
                        if ( results[0].warningCount === 0 ) { // if table didn't already exist
                            var token = btoa( name + 'canconnecttosql' )
                            return q.nfcall( sqb, 'INSERT INTO ??.warmup VALUES (?)', [ name, token ] )
                        }
                    })
                    .catch( function( err ) {
                        console.error( err )
                        res.status( 500 ).send( err )
                    })
                    .done( function() {
                        res.send()
                    })
                } else if ( dbtype === 'mongo' ) {
                    var SERVER = 'localhost' // SHOULD CHANGE TO JS
                    var db = new Db( name, new Server( SERVER, 27017 ) )
                    db.open( function( err, db ) {
                        if( err ) {
                            console.error( err )
                            return res.status( 500 ).send( err )
                        }
                        var admin = db.admin()
                        admin.authenticate('admin', 'rbmllr', function( err, result ) {
                            db.addUser( name, pass, { roles: [ { role: 'readWrite', db: name } ], w: 1 }, function( err, result ) {
                                if( err && err.code !== 11000 ) {
                                    console.error( err )
                                    return res.status( 500 ).send( err )
                                }
                                console.log( name, pass, result )
                                res.send()
                            })
                        })
                    })
                } else {
                    res.sendStatus( 400 )
                }

            })
        })
    })

    return createdbApp
}
