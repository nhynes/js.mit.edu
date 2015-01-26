function checkMsgTmp() {
    var msg1 = {
            username: 'testuser',
            message: 'Hello, world!'
        },
        msg2 = {
            username: $('meta[username]').attr('username'),
            message: 'Hello, testuser!'
        },
        $msgs = $('.messages'),
        expectedHTML = '<ul class="messages"><li class="message"><span class="user">testuser</span><p class="body">Hello, world!</p></li><li class="message"><span class="user">nhynes</span><p class="body">Hello, testuser!</p></li></ul>',
        outputHTML

    $msgs.empty()
    addMessageToList( msg1 )
    addMessageToList( msg2 )

    outputHTML = $( $msgs.prop('outerHTML') ).prop('outerHTML').replace( />\s+</g, '><' )

    if ( $msgs.children().length < 2 ) {
        throw 'Error: Expected two messages to be displayed.'
    } else if ( outputHTML !== expectedHTML ) {
        throw 'Error: Incorrect output displaying.'
    } else {
        return 'Wasn\'t that easier? Here\'s your token: ' + btoa( $('meta[username]').attr('username') + 'hastemplateok' )
    }
}
