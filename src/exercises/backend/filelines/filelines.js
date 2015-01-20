// Instructions:
// 1. Import (require) the 'fs' module (http://nodejs.org/api/fs.html)
// 2. Change the Content-Type of the response to application/json
// 3. Read the docs for fs.readFile
//    (http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback)
//    and complete the server function to return the lines of the file as a JSON array
//
// Hint: use the String split() method and JSON.stringify the resulting array
//   Subhint: the newline character is represented as '\n'

var http = require('http')
    // your code here

http.createServer( function (req, res) {
    var FILENAME = 'words_list.txt'

    // setting headers here because writeHead can only be called once and we don't
    // want to duplicate writeHead for each of the status codes
    res.setHeader( 'Content-Type', 'text/plain' )
    res.setHeader( 'Access-Control-Allow-Origin', '*' )

    // read FILENAME and interpret the binary as utf8-encoded text
    fs.readFile( FILENAME, { encoding: 'utf8' }, function( err, data ) {
        if ( err ) {
            res.statusCode = 500 // server error
            return res.end() // close the connection and return to prevent further execution
        }

        // your code here
    })

    // don't end the response here because the file has not yet been read!
}).listen( 8888 )

console.log('Server running at http://0.0.0.0:8888/')
