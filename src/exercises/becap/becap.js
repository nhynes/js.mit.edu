var $ = require('jquery'),
    exercise = require('../exercise')

$('#maketables').click( function() {
    var $fb = $('#tablesfeedback').html('')

    $.get( '/createdb/jssit' )
    .done( function() {
        $fb.css( 'color', 'green' ).html('┬─┬ ノ( ^_^ノ)')
    })
    .fail( function( res ) {
        $fb.css( 'color', 'red' )
        if ( res.status === 403 ) {
            $fb.html('Error: You have not yet registered!')
        } else if ( res.status === 500 ) {
            $fb.html('Server Error. Please talk to Nick or email js@mit.edu')
        }
    })
})
