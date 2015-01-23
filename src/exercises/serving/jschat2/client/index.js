// called when a user submits the login form
// the login form is displayed when a user loads the page and does not have a username set already
if ( localStorage.username ) {
    login( true )
}

$('.create-user').click( function() {
    $('.login-form').addClass('hidden')
    $('.create-user-form').removeClass('hidden')
})

function createUser() {
    var $createUser = $('.create-username'),
        $createPass = $('.create-password'),
        username = $createUser.val(),
        password = $createPass.val()

    $createUser.css('color', 'inherit')
    $createPass.css('color', 'inherit')
    $('.create-status').html('')

    $.post( '/user/create', { username: username, password: password } )
    .fail( function( res ) {
        if ( res.status === 409 ) {
            $('.create-status').html('Username already taken')
            $createPass.css('color', 'red')
            $createUser.css('color', 'red')
        } else {
            alert('Error!')
        }
    })
    .done( function() {
        doSetup( username )
    })

}
function login( autoLogin ) {
    console.log('doing login', autoLogin)
    var $user = $('.username'),
        $pass = $('.password'),
        username = autoLogin ? localStorage.username : $user.val(),
        password = autoLogin ? 'logged in' : $pass.val()

    $user.css('color', 'inherit')
    $pass.css('color', 'inherit')

    $.post( '/user/login', { username: username, password: password } )
    .fail( function( res ) {
        if ( autoLogin ) { // previous login expired. do nothing
            delete localStorage.username
            return
        }
        if ( res.status === 401 ) {
            $user.css('color', 'red')
            $pass.css('color', 'red')
        } else {
            alert('Error!')
        }
    })
    .done( function() {
        doSetup( username )
    })
}

function doSetup( username ) {
    console.log('doing setup')
    localStorage.username = username // store the username for logging back in later
    window.socket = io.connect('http://localhost:8888') // connect to the chat server
    $('.login').addClass('hidden')

    console.log( username )

    window.socket.on( 'connect', function() {
        console.log('connect')
        $('.chatroom-name').removeAttr('disabled')
        $('.username-disp').html( username )
    })
}

// called when the user submits the chatroom form
function joinRoom() {
    var room = $('.chatroom-name').val()

    $('.messages').html('')

    socket.emit( 'join', room )

	socket.on( 'joinsuccess', function() {
		socket.off( 'joinsuccess' )

        $('.user-message').removeAttr('disabled')
	})

    socket.on( 'message', function( data ) {
        var $msg = $('<li class="message">')

        console.log( data )
        $('<span class="user">').html( data.username ).appendTo( $msg )
        $('<p class="body">').html( data.msg ).appendTo( $msg )

        $('.messages').append( $msg )

        scrollMsgsToBottom()
    })
}

function sendMessage() {
    var $msgbox = $('.user-message'),
        msg = $msgbox.val()

    $msgbox.val('')

    socket.emit( 'message', msg )
}

function scrollMsgsToBottom() {
	$('.messages').animate( { scrollTop: $('.messages')[0].scrollHeight }, 500 )
}



// random init stuff
$('.user-message').attr('disabled', 'disabled') // the message input box should start out disabled
$('.user-message').val('') // the message input box should start out empty
