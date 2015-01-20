function checkSetup() {
    try { $ } catch( e ) { return console.error(e, 'Need to include jQuery') }
    if ( $('meta[username]').attr('username') === 'YOUR_USERNAME_HERE' ) {
        return console.error('Need to set <meta username>')
    }
    try { io } catch( e ) { return console.error('Need to include Socket.io') }

    console.log('Good work. Your token is ' + mkTok('hassetupok'))
}

function checkLogin() {
    var tmpUsername = localStorage.username,
        $login = $('.login'),
        $loginForm = $('.login-form'),
        $username = $loginForm.find('.username'),
        testTimeout = setTimeout( function() {
            console.error('Error: No response from server. Did you emit a login event?')
        }, 1000 )

    delete localStorage.username

    $login.removeClass('hidden')


    socket.on( 'testlogin', function( username ) {
        var uname = $('meta[username]').attr('username')

        socket.off( 'testlogin' )
        clearTimeout( testTimeout )
        if ( username !== 'testuser' ) {
            return console.error('Error: incorrect login username. Expected "testuser" but was ' + username )
        }
        if ( !$login.hasClass('hidden') ) {
            return console.error('Error: login overlay should be hidden after sending the login event')
        }
        if ( $('.username-disp').html() !== 'testuser' ) {
            return console.error('Error: username display is not showing the correct username')
        }
        if ( $('.chatroom-name').attr('disabled') !== undefined ) {
            return console.error('Error: chatroom name input should be enabled after login')
        }

        console.log('Right on! Your token is ' + mkTok('hasloginok') )

        $username.val( uname )
        $loginForm.submit()
    })

    $username.val('testuser')
    $loginForm.submit()
}

function checkJoinRoom() {
    var uname = $('meta[username]').attr('username'),
        tmpUsername = localStorage.username,
        $login = $('.login'),
        $loginForm = $('.login-form'),
        $username = $loginForm.find('.username'),
        loginTimeout = setTimeout( function() {
            console.error('Error: No login response from server. Does checkLogin() work?')
        }, 1000 )

    delete localStorage.username

    socket.on( 'testlogin', function( username ) {
        var testroom = 'testroom' + Math.floor( Math.random() * 42 ),
            joinTimeout = setTimeout( function() {
                console.error('Error: No join response from server. Did you emit a join event?')
            }, 1000 )

        socket.off( 'testlogin' )
        clearTimeout( loginTimeout )

        $('.chatroom-name').val( testroom )

        $('.messages').html('remove me')

        $('.chat-room').submit()

        socket.on( 'testjoin', function( room ) {
            socket.off('testjoin')
            clearTimeout( joinTimeout )

            if ( room !== testroom ) {
                return console.error('Error: wrong room joined. Expected ' + testroom + ' but was ' + room)
            }
            if ( $('.user-message').attr('disabled') !== undefined ) {
                return console.error('Error: user message input should be enabled after joining a room')
            }
            if ( $('.messages').html() !== '' ) {
                return console.error('Error: messages list should be cleared upon joining a room')
            }
            console.log('Way to go! Your token is ' + mkTok('hasjoinroomok') )

            $username.val( uname )
            $loginForm.submit()
        })
    })

    $username.val('testuser')
    $loginForm.submit()
}

function checkSendMessage() {
    var uname = $('meta[username]').attr('username'),
        tmpUsername = localStorage.username,
        $login = $('.login'),
        $loginForm = $('.login-form'),
        $username = $loginForm.find('.username'),
        loginTimeout = setTimeout( function() {
            console.error('Error: No login response from server. Does checkLogin() work?')
        }, 1000 )

    delete localStorage.username

    socket.on( 'testlogin', function( username ) {
        var testroom = 'testroom' + Math.floor( Math.random() * 42 ),
            joinTimeout = setTimeout( function() {
                console.error('Error: No join response from server. Does checkJoinRoom() work?')
            }, 1000 )

        socket.off( 'testlogin' )
        clearTimeout( loginTimeout )

        $('.chatroom-name').val( testroom )

        $('.messages').html('remove me')

        $('.chat-room').submit()

        socket.on( 'testjoin', function( room ) {
            var msgTimeout = setTimeout( function() {
                console.error('Error: No message sent to server. Did you emit a message event?')
            }, 1000 )
            socket.off('testjoin')
            clearTimeout( joinTimeout )

            $('.user-message').val('hello, world!')

            socket.on( 'testmessage', function( msg ) {
                socket.off('testmessage')
                clearTimeout( msgTimeout )

                if ( msg !== 'hello, world!' ) {
                    return console.error('Error: incorrect message sent. Expected "hello, world" but was ' + msg )
                }
                if ( $('.user-message').val() !== '' ) {
                    return console.error('Error: User message box should be cleared after sending')
                }
                console.log('Almost there! Your token (yet again) is ' + mkTok('hassendmessageok'))

                $username.val( uname )
                $loginForm.submit()
            })

            $('.chat-input').submit()
        })
    })

    $username.val('testuser')
    $loginForm.submit()
}

function checkReceiveMessage() {
    var uname = $('meta[username]').attr('username'),
        tmpUsername = localStorage.username,
        $login = $('.login'),
        $loginForm = $('.login-form'),
        $username = $loginForm.find('.username'),
        loginTimeout = setTimeout( function() {
            console.error('Error: No login response from server. Does checkLogin() work?')
        }, 1000 )

    delete localStorage.username

    socket.on( 'testlogin', function( username ) {
        var testroom = 'testroom' + Math.floor( Math.random() * 42 ),
            joinTimeout = setTimeout( function() {
                console.error('Error: No join response from server. Does checkJoinRoom() work?')
            }, 1000 )

        socket.off( 'testlogin' )
        clearTimeout( loginTimeout )

        $('.chatroom-name').val( testroom )

        $('.chat-room').submit()

        socket.on( 'testjoin', function( room ) {
            var msgTimeout = setTimeout( function() {
                console.error('Error: No message sent to server. Does checkSendMessage() work?')
            }, 1000 )
            socket.off('testjoin')
            clearTimeout( joinTimeout )

            $('.user-message').val('one small step')
            $('.messages').html('')

            socket.on( 'testmessage', function( message ) {
                var $msg = $('<li class="message">')

                socket.off('testmessage')
                clearTimeout( msgTimeout )

                $('<span class="user">').html( username ).appendTo( $msg )
                $('<p class="body">').html( message ).appendTo( $msg )

                if ( $('.messages').html() !== $msg[0].outerHTML ) {
                    console.log( $('.messages').html(), 'asdfasdfasdf', $msg[0].outerHTML )
                    return console.error('Error: incorrect message showing')
                }
                console.log('Hooray! All of the basic functionality is done! Enjoy your well earned token: ' + mkTok('hasrecvmessageok'))

                $username.val( uname )
                $loginForm.submit()
            })

            $('.chat-input').submit()
        })
    })

    $username.val('testuser')
    $loginForm.submit()
}

function mkTok( str ) {
    return btoa( str + $('meta[username]').attr('username') )
}
