function checkCreateUser() {
    var addr = '/user/create',
    enoarg = function() {
        clearTimeout( connTimeout )
        console.error('Error: Expected passing in no arguments to return a 400 Bad Request')
    },
    testuser = 'testuser' + Math.floor( Math.random() * 42424242 ),
    initpost,
    connTimeout = setTimeout( function() {
        initpost.abort()
        console.error('Error: No response from server. Did you start the server and are you sending responses?')
    }, 1000 )

    initpost = $.post( addr ).done( enoarg )
    .fail( function( res ) {
        clearTimeout( connTimeout )
        var brpost,
        brTimeout = setTimeout( function() {
            brpost.abort()
            console.error('Error: No response from server when sending bad request. Are you sending responses?')
        }, 1000 )
        eonearg = function() {
            clearTimeout( brTimeout )
            console.error('Error: Expected passing in only one of the required params to return a 400 Bad Request')
        }

        if ( res.status !== 400 ) {
            return enoarg()
        }
        brpost = $.post( addr, { user: testuser } ).done( eonearg )
        .fail( function( res ) {
            clearTimeout( brTimeout )
            if ( res.status !== 400 ) {
                return eonearg()
            }
            $.post( addr, { username: testuser, password: 'testpass' } )
            .done( function() {
                var dupost,
                dupTimeout = setTimeout( function() {
                    dupost.abort()
                    console.error('Error: No response from server when creating duplicate users. Are you sending responses?')
                }, 1000 )
                dupost = $.post( addr, { username: testuser, password: 'testpass' } )
                .done( function() {
                    clearTimeout( dupTimeout )
                    console.error('Error: Expected a non-successful (i.e. non-200) status code when picking an already-chosen name')
                })
                .fail( function() {
                    clearTimeout( dupTimeout )
                    console.log('Cool! Your token is ' + mkTok('hascreateuserok') )
                })
            })
            .fail( function() {
                console.error('Error: Expected correct API call to create new user')
            })
        })
    })
}

function checkUserLogin() {
    var addr = '/user/create',
    testuser = 'testuser' + Math.floor( Math.random() * 42424242 ),
    createpost,
    createTimeout = setTimeout( function() {
        createpost.abort()
        console.error('Error: No response from server. Did you start the server and are you sending responses?')
    }, 1000 )

    createpost = $.post( addr, { username: testuser, password: 'testpass' } )
    .done( function() {
        clearTimeout( createTimeout )
        var wrongloginpost,
        wrongloginTimeout = setTimeout( function() {
            wrongloginpost.abort()
            console.error('Error: No response from server. Did you start the server and are you sending responses?')
        }, 1000 )

        addr = 'http://localhost:8888/user/login'
        wrongloginpost = $.post( addr, { username: testuser, password: 'blah' } )
        .done( function() {
            clearTimeout( wrongloginTimeout )
            console.error('Error: Expected submitting wrong password to yield 401 Unauthorized')
        })
        .fail( function( res ) {
            clearTimeout( wrongloginTimeout )
            if ( res.status !== 401 ) {
                return console.error('Error: Expected submitting wrong password to yield 401 Unauthorized')
            }
            var rightloginPost,
            rightloginTimeout = setTimeout( function() {
                rightloginPost.abort()
                console.error('Error: No response from server after supplying correct credentials. Are you sending responses?')
            }, 1000 )

            rightloginPost = $.post( addr, { username: testuser, password: 'testpass' } )
            .done( function() {
                clearTimeout( rightloginTimeout )
                console.log('Keep the good times rolling! Your token is ' + mkTok('hasuserloginok') )
                done( null )
            })
        })
    })
    .fail( function( res ) {
        clearTimeout( createTimeout )
        console.error('Error: Expected correct API call to /users/create to create new user')
    })
}

function checkWSAuth() {
    var ws = io.connect('http://localhost:8888'),
        connTimeout = setTimeout( function() {
            console.log('Nice work. Here is your token: ' + mkTok('haswsauthokprobably') )
        }, 2000 )

    if ( localStorage.username || ws.connected ) {
        clearTimeout( connTimeout )
        console.log('The page is about to refresh. Run checkWSAuth() again once it reloads.')
        document.cookie = 'chatlogin='
        delete localStorage.username
        setTimeout( function() {
            window.location = 'http://localhost:8888'
        }, 2000 )
    }
    ws.on( 'connect', function( err ) {
        clearTimeout( connTimeout )
        console.error('WebSocket connected but should not have.')
    })
}


function mkTok( str ) {
    return btoa( str + $('meta[username]').attr('username') )
}
