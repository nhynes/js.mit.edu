var mysql = require('mysql'),
    createdbApp = require('express')()

module.exports = function( opts ) {
    var dbcon = opts.dbcon,
        sqlcon = opts.sqlcon

    createdbApp.get( '/', function( req, res ) {
        var name = req.signedCookies.login,
            pass


        if ( !name ) {
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

                q.nfcall( sqb, 'CREATE DATABASE IF NOT EXISTS ??', name )
                .then( function() {
                    return q.nfcall( sqb, 'GRANT ALL ON ??.* TO ??@`%` IDENTIFIED BY ?', [ name, name, pass ] )
                })
                .then( function() {
                    return q.nfcall( sqb, 'CREATE TABLE IF NOT EXISTS ??.posts ( id SERIAL PRIMARY KEY, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, title VARCHAR(255) NOT NULL, message LONGTEXT NOT NULL, score MEDIUMINT NOT NULL DEFAULT 0 )', name )
                })
                .then( function() {
                    return q.nfcall( sqb, 'CREATE TABLE IF NOT EXISTS ??.comments ( id SERIAL PRIMARY KEY, postId BIGINT UNSIGNED NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, message LONGTEXT NOT NULL, CONSTRAINT FOREIGN KEY (postId) REFERENCES ??.posts (id) )', [ name, name ] )
                })
                .catch( function( err ) {
                    console.error( err )
                    res.status( 500 ).send( err )
                })
                .done( function() {
                    res.send()
                })
            })
        })
    })

    return createdbApp
}
