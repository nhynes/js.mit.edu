var http = require('http') // load the HTTP module

// create a server that runs the function when a client connects
http.createServer( function (req, res) {

    res.writeHead( 200, { // Set the status code to 200 Okay and add some important response headers
        'Content-Type': 'text/plain', // tells the client that the result is plain text
        'Access-Control-Allow-Origin': '*' // allows browser code (i.e. the checker) to query the server
    })

    res.end('Salutations!') // close the response stream and send the data

}).listen( 8888 ) // listen on port 8888

console.log('Server running at http://0.0.0.0:8888/')
