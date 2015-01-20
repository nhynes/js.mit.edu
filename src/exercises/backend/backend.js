var $ = require('jquery'),
    exercise = require('../exercise')

$.get('/user/ip', function( ip ) {
    $('.yourip').val( ip )
})

window.parent.showIPEntry = function() {
    $('.ipfloater').css( 'display', 'block' )
}
