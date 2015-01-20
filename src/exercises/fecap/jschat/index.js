var socket = io.connect('http://js.mit.edu/chat') // connect to the chat server

// called when a user submits the login form
// the login form is displayed when a user loads the page and does not have a username set already
function login() {
    var username = undefined // 1. get the value of the login username input

	// 2. hide the login overlay by adding the "hidden" class to it

	// 3. set the contents of ".username-disp" to the chosen username


    socket.emit( 'login', username ) // send the username to the server to log in

	socket.on( 'loginsuccess', function() {
		socket.off( 'loginsuccess' ) // no longer need to listen for this event

		// 4. now that the user has logged in, allow him to join a room by
		//    removing the "disabled" attribute from the chatroom name input
		// Hint: use the jQuery removeAttr method (https://api.jquery.com/removeAttr/)
	})

    localStorage.username = username // store the username for logging back in later
}

// called when the user submits the chatroom form
function joinRoom() {
    var room = undefined // 1. get the requested chatroom name from the appropriate input element

	// 2. clear the innerHTML of the messages list so that the user can have a fresh start

    // 3. request that the server add the user to the room by emitting a join event

	socket.on( 'joinsuccess', function() {
		socket.off( 'joinsuccess' )

		// 4 now that the user has joined a room, enable the chat message input box
	})
}

function sendMessage() {
    var msg = undefined // 1. get the value of the chat message box

	// 2. clear the chat message box so the user can type another message

	// 3. send the message to the server
}

socket.on( 'message', function( data ) {
	/* template out a message entry and display it in (i.e. append it to) the messages list
	   a message entry looks like this:
	      <li class="message">
	        <span class="user">The username</span>
	        <p class="body">The message</p>
	      </li>

	    Hint 1: console.log( data )
		Hint 2: call the $ function with an HTML string to make a new element wrapped in a jQuery object
	    Hint 3: you shouldn't have to write more than 10 uncomplicated lines of code
	 */

	scrollMsgsToBottom()
})

function scrollMsgsToBottom() {
	$('.messages').animate( { scrollTop: $('.messages')[0].scrollHeight }, 500 )
}




// you only have to look below if you want to see an example of localStorage

// so the user doesn't have to re-enter her username when reloading the page
if ( !localStorage.username ) {
    $('.login').removeClass('hidden')
} else {
    $('.username-disp').html( localStorage.username )
    socket.emit( 'login', localStorage.username )
	$('.chatroom-name').removeAttr('disabled')
}

$('.user-message').attr('disabled', 'disabled') // the message input box should start out disabled

