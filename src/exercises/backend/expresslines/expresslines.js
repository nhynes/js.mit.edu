// Instructions
// ============
//
// Task 1:
// 1. Run `npm install express` to get the 'express' module
// 2. Implement the /words GET endpoint as given by the specification above `app.get( '/words', ...`
// 3. Run the "Choo choo!" checker
//
// Task 2:
// 1. `npm install body-parser`, require it, and `app.use` bodyParser.urlencoded
//    Hint: follow the example here (http://expressjs.com/4x/api.html#req.body)
// 2. Implement the /words POST endpoint as given by the spec above `app.post('/words', ...`
// 3. Run the "The Webappville Post" checker

var express = require('express'),
    app = express(),
    // your code here

    FILENAME = 'words_list.txt'

// your code here

/**
 * Returns stored words that contain a given string
 * @param {String} contains the contained string. Default: the empty string (all words match)
 * @return {Array} an array of matching words
 */
app.get( '/words', function( req, res ) { // req and res are Express objects
    // get the GET variable `contains` using req.query (http://expressjs.com/4x/api.html#req.query)
    // Tip: use || to default to ''
    var contains = undefined

    res.set({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    })

    fs.readFile( FILENAME, { encoding: 'utf8' }, function( err, data ) {
        if ( err ) {
            return res.sendStatus( 500 ) // Internal server error
        }

        // do the same thing as before, but this time filter words, keeping those that contain `contains`
        // Hint: you can use the indexOf method of strings to check for containment

        // Tip: read the docs for Express res.send (http://expressjs.com/4x/api.html#res.send) and
        //      notice that it automatically JSON.stringifies objects
    })
})

/**
 * Adds a word to the list of stored words
 * @param {String} word the new word to add. Required.
 * @return {status code} 200 OK if word was successfully added
 */
app.post( '/words', function( req, res ) {
    // obtain the word POST variable from req.body (http://expressjs.com/4x/api.html#req.body)

    res.set( 'Access-Control-Allow-Origin', '*' ) // no content-type because no data is returned

    // send a 400 Bad Request if the user did not supply the word param

    // your file updating code here
    // Hint: use fs.appendFile and send() the response once the file has been updated
    //       (http://nodejs.org/api/fs.html#fs_fs_appendfile_filename_data_options_callback)
    // Remember to add the separator!
})

app.listen( 8888 ) // start the HTTP server listening on port 8888
