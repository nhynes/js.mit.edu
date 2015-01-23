var mysql = require('mysql'),
    crypto = require('crypto'),
    usersApp = require('express').Router(),
    sqlcon

module.exports = function( opts ) {
    var credentials = opts.credentials

    sqlcon = mysql.createConnection({
        host: 'js.mit.edu',
        user: credentials.user,
        password: credentials.pass,
        database: credentials.user // created DB has same name as username
    })

    // WARMUP
    // ======
    // Selects (returns) all rows from the `warmup` table, showing only the `token` column
    // Prints out the token found in the first row (in this case, it's guaranteed to exit)
    // Feel free to comment this out once you've received your token
    sqlcon.query('SELECT token FROM warmup', function( err, results ) {
        if ( err ) { throw err }
        console.log( 'Your warmup token is:', results[0].token )
    })


    // User creation/login endpoint
    // ============================
    usersApp
    .post( '/:action', function( req, res ) {
        var action = req.params.action,
            username = req.body.username,
            password = req.body.password,

            setLoginCookie = function() {
                var MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000
                res.cookie( 'chatlogin', username, { signed: true, maxAge: MS_IN_WEEK } )
            }

        res.set( 'Content-Type', 'text/plain' )

        if ( username === undefined || password === undefined ) {
            // required params are missing. Send a 400 Bad Request
            return res.sendStatus( 400 )
        }

        if ( action === 'create' ) { // Task 1: Creating users

            crypto.pseudoRandomBytes( 4, function( err, bytes ) {
                var salt = bytes.toString('hex'),
                    hash = crypto.createHash('sha1').update( salt + password ).digest('hex')

                // TODO: insert the username, salt, and hash into the `users` table
                sqlcon.query( 'YOUR CODE HERE', function( err, results ) {
                    if ( err && err.code === 'ER_DUP_ENTRY' ) {
                        // username has already been taken. return an appropriate HTTP status code
                        return res.sendStatus(/* your status code here */)
                    } else if ( err ) {
                        console.error( err )
                        return res.status( 500 ).end() // Internal Server Error
                    }

                    // set a cookie to remember the login
                    setLoginCookie()
                    res.send()
                })
            })

        } else if ( action === 'login' ) { // Task 2: Authenticating users

            if ( req.signedCookies.chatlogin ) {
                return res.send() // user is already logged in, so there's no need to query the DB
            }

            sqlcon.query( 'YOUR CODE HERE', function( err, results ) {
                // your variables here

                if ( err ) {
                    console.error( err )
                    return res.status( 500 ).end() // Internal Server Error
                }
                if ( results.length === 0 ) {
                    // your code here
                }

                if ( false /* stored hash and new hash are the same */) {
                    // set a cookie to remember the login. sign it to deter user modification
                    setLoginCookie()
                    res.send()
                } else {
                    // otherwise...
                }
            })

        } else {
            res.sendStatus( 400 ) // Bad Request
        }
    })
    .get( '/*', function( req, res ) { // * matches all
        res.sendStatus( 405 ) // GET Method Not Allowed
    })

    return usersApp
}

