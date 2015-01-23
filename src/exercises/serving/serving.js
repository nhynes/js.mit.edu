var $ = require('jquery'),
    exercise = require('../exercise')

$.ajaxSetup({
    xhrFields: { withCredentials: true },
    crossDomain: true
})

$('#createsql').click( function() {
    var $fb = $('#createsqlfeedback').html('')

    $.get( '/createdb', { type: 'sql' } )
    .done( function() {
        $fb.css( 'color', 'green' ).html('One database. ORDERR UUUPPP!')
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

$('#createmongo').click( function() {
     var $fb = $('#createmongofeedback').html('')

    $.get( '/createdb', { type: 'mongo' } )
    .done( function() {
        $fb.css( 'color', 'green' ).html('One database. ORDERR UUUPPP!')
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
