var credentials = {
        user: 'YOUR USERNAME HERE',
        pass: 'YOUR PASSWORD HERE'
    },
    app = require('express')(),
    bodyParser = require('body-parser'),
    mysql = require('mysql'),
    path = require('path'),
    serveStatic = require('serve-static'),
    sql = mysql.createConnection({
        host: 'js.mit.edu',
        user: credentials.user,
        password: credentials.pass,
        database: credentials.user,
        supportBigNumbers: true
    })

app.use( serveStatic( path.resolve( __dirname, '..', 'client' ) ) )
app.use( bodyParser.urlencoded({ extended: false }) )
app.use( bodyParser.json() )

app.all( '*', function( req, res, next ) {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-ALlow-Methods': 'GET, POST, PATCH, PUT, DELETE', // Semantic HTTP = on
        'Content-Type': 'application/json' // this API returns JSON!
    })
    next()
})

// Task 1 - Implement Post posting
app.post( '/posts', function( req, res ) {
    var title = req.body.title,
        message = req.body.message,
        insertData = { title: title, message: message }

    if ( !title || !message ) {
        return res.status( 400 ).send('A title and message must be supplied')
    }

    sql.query( 'YOUR SQL HERE', insertData, function( err ) {
        // your code here
    })
})


// Task 2 - Implement Comment posting
app.post( '/posts/:postId', function( req, res ) {
    // your code here
})

// Task 3 - Implement getting a Post and its Comments
app.get( '/posts/:postId', function( req, res ) {
    // your code here
})

// Task 4 - Upvotes and Downvotes
app.patch( '/posts/:postId', function( req, res ) {
    var inc = req.body.increment
        // your code here

    if ( inc === undefined ) {
        return res.sendStatus( 400 )
    }

    // your code here
})


app.get( '/posts', function( req, res ) {
    var pageNo = parseInt( req.query.pageNumber ) || 1,
        POSTS_PER_PAGE = 25,
        offset = (pageNo - 1) * POSTS_PER_PAGE,

        COUNT_TOTAL_POSTS = 'SELECT COUNT(*) AS totalPosts FROM posts',
        GET_POSTS_AND_COMMENT_COUNT = 'SELECT posts.*, count(comments.id) AS numComments FROM posts LEFT JOIN comments ON comments.postid = posts.id GROUP BY posts.id ORDER BY numComments DESC, posts.score DESC LIMIT ?, 25'

    sql.query( COUNT_TOTAL_POSTS, function( err, results ) {
        var totalPosts

        if ( err ) {
            console.error( err )
            return res.sendStatus( 500 )
        }

        totalPosts = results[0].totalPosts

        sql.query( GET_POSTS_AND_COMMENT_COUNT, offset, function( err, results ) {
            if ( err ) {
                console.error( err )
                return res.sendStatus( 500 )
            }

            res.send({
                nextPage: offset + POSTS_PER_PAGE > totalPosts ? undefined : pageNo + 1,
                prevPage: offset - POSTS_PER_PAGE < 0 ? undefined : pageNo - 1,
                posts: results.map( function( post ) {
                    delete post.message
                    return post
                })
            })
        })
    })
})

app.listen( 8888 )
