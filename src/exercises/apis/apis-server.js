var apisApp = require('express')(),
	crypto = require('crypto')

apisApp.get( '/', function( req, res ) {
	res.end('js.mit.edu REST API')
})

apisApp.get( '/hello', function( req, res ) {
	res.set('Content-Type', 'text/plain')
	res.end('Greetings!')
})

apisApp.post( '/save', function( req, res ) {
	var data = Object.keys( req.body )[0] || ''

	res.set('Content-Type', 'text/plain')
	res.end( data )
})
module.exports = apisApp
