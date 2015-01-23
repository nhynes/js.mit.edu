(function() { // immediately invoked function prevents leaking variables into global scope

function showPostDetail( postId ) {

    $.get( '/posts/' + postId )
    .done( function( post ) {
        $('.post-detail').html( postDetailTmp( post ) )

        $('.post-detail').removeClass('hidden')
        $('.posts').addClass('hidden')
        $('.pager').addClass('hidden')
    })
    .fail( function() {
        alert('Could not load post...')
    })
}

function postDetailTmp( post ) {
    var $wrap = $('<div>'),
        $header = $('<header class="post-header">').appendTo( $wrap ),
        $vote = $('<div class="vote">').appendTo( $header ),
        timeSincePost = moment( post.timestamp ).fromNow(),
        lsPrev = localStorage[ 'vote' + post.id ],
        prevVote = lsPrev === 'true' ? true : lsPrev === 'false' ? false : undefined,
        $uv = $('<div class="upvote">').toggleClass( 'active', !!prevVote ),
        $dv = $('<div class="downvote">').toggleClass( 'active', prevVote === false ),
        vote = function( postId, inc, uv ) {
                var rawPrev = localStorage[ 'vote' + postId ],
                prevVote = rawPrev === 'true' ? true : rawPrev === 'false' ? false : undefined,
                sendVote = function( incr ) {
                    $.ajax({
                        type: 'PATCH',
                        url: '/posts/' + postId,
                        data: { increment: incr }
                    })
                }

                if ( ( prevVote && !inc && uv ) || ( !prevVote && inc && !uv ) ) {
                    sendVote( inc )
                    localStorage[ 'vote' + postId ] = undefined
                } else {
                    sendVote( inc )
                    if ( prevVote !== undefined ) {
                        sendVote( inc )
                    }
                    localStorage[ 'vote' + postId ] = inc
                }
            }.bind( null, post.id ),
        $commentsList = $('<ol class="comments-list">'),
        $commentForm = $('<form class="comment-form">').attr( 'action', 'javascript:undefined' )

    $('<h2 class="post-heading">').html( post.title ).appendTo( $header ).click( showPostDetail.bind( null, post.id ) )

    $uv.appendTo( $vote ).click( function() {
        $uv.toggleClass('active')
        $dv.removeClass('active')
        vote( $uv.hasClass('active'), true )
    })
    $('<div class="score">').appendTo( $vote ).toggleClass( 'nil', post.score === 0 ).html( post.score || '' )
    $dv.appendTo( $vote ).click( function() {
        $dv.toggleClass('active')
        $uv.removeClass('active')
        vote( !$dv.hasClass('active'), false )
    })

    $('<p class="post-msg">').html( post.message ).appendTo( $wrap )
    $('<hr class="sep"><h3 class="comments-heading">Comments</h3>').appendTo( $wrap )

    $commentsList.appendTo( $wrap )
    post.comments.forEach( function( comment) {
        var timeSinceComment = moment( comment.timestamp ).fromNow()
        $('<li class="comment">').appendTo( $commentsList ).html('<span class="timeposted">Posted ' + timeSinceComment + ' by Anonymous</span><br>' + comment.message )
    })

    $('<hr class="sep">').appendTo( $wrap )

    $commentForm.appendTo( $wrap )
    $('<b>Post new comment</b><br><textarea rows="8" cols="70" class="comment-message" name="message" required>').appendTo( $commentForm )
    $('<input type="submit" value="Submit" class="comment-submit">').appendTo( $commentForm ).click( function() {
        $.post( '/posts/' + post.id, $commentForm.serialize() )
        $('.comment-message').val(' ')
        showPostDetail( post.id )
    })

    return $wrap[0]
}

function postsTmp( posts ) {
    return posts.map( function( post ) {
        var $li = $('<li class="post">').attr('data-postid', post.id),
            $vote = $('<div class="vote">').appendTo( $li ),
            timeSincePost = moment( post.timestamp ).fromNow(),
            lsPrev = localStorage[ 'vote' + post.id ],
            prevVote = lsPrev === 'true' ? true : lsPrev === 'false' ? false : undefined,
            $uv = $('<div class="upvote">').toggleClass( 'active', !!prevVote ),
            $dv = $('<div class="downvote">').toggleClass( 'active', prevVote === false ),
            vote = function( postId, inc, uv ) {
                var rawPrev = localStorage[ 'vote' + postId ],
                    prevVote = rawPrev === 'true' ? true : rawPrev === 'false' ? false : undefined,
                    sendVote = function( incr ) {
                        $.ajax({
                            type: 'PATCH',
                            url: '/posts/' + postId,
                            data: { increment: incr }
                        })
                    }

                if ( ( prevVote && !inc && uv ) || ( !prevVote && inc && !uv ) ) {
                    sendVote( inc )
                    localStorage[ 'vote' + postId ] = undefined
                } else {
                    sendVote( inc )
                    if ( prevVote !== undefined ) {
                        sendVote( inc )
                    }
                    localStorage[ 'vote' + postId ] = inc
                }
                showPosts()
            }.bind( null, post.id )

            $uv.appendTo( $vote ).click( function() {
                $uv.toggleClass('active')
                $dv.removeClass('active')
                vote( $uv.hasClass('active'), true )
            })
            $('<div class="score">').appendTo( $vote ).toggleClass( 'nil', post.score === 0 ).html( post.score || '' )
            $dv.appendTo( $vote ).click( function() {
                $dv.toggleClass('active')
                $uv.removeClass('active')
                vote( !$dv.hasClass('active'), false )
            })

            $('<h3 class="post-heading">').html( post.title ).appendTo( $li ).click( showPostDetail.bind( null, post.id ) )

            $('<div class="post-info">').appendTo( $li )
            .html('<span class="rel-time">' + timeSincePost + '</span>&nbsp;by&nbsp;Anonymous')

            $('<a class="comments-link">').appendTo( $li )
            .html( post.numComments + '&nbsp;comments' ).click( showPostDetail.bind( null, post.id ) )

        return $li[0]
    })
}

function showPosts( page ) {
    $.get( '/posts', { pageNumber: page } )
    .done( function( result ) {
        $('.posts').html( postsTmp( result.posts ) )
        $('.posts').removeClass('hidden')
        $('.post-detail').addClass('hidden')
        $('.pager').removeClass('hidden')

        $('.next-page').toggleClass( 'hidden', !result.nextPage ).off()
            .click( showPosts.bind( null, result.nextPage ) )
        $('.prev-page').toggleClass( 'hidden', !result.prevPage ).off()
            .click( showPosts.bind( null, result.prevPage ) )
    })
    .fail( function( res ) {
        console.error( res.status )
    })
}

(function setupNewPostForm() {
    var $npForm = $('.new-post-form'),
        $npBtn = $('.new-post-button'),
        toggleNewPostDisp = function() {
            $npForm.toggleClass('hidden')
            $npBtn.toggleClass('hidden')
        }

    $npForm.submit( function() {
        $.post( '/posts', $npForm.serialize(), function( postInfo ) {
            toggleNewPostDisp()
            showPosts.call( postInfo )
        })
        .fail( function() {
            $('.new-post-feedback').html('Error. Unable to post message')
        })
    }).attr( 'action', 'javascript:undefined' )

    $npBtn.click( toggleNewPostDisp )
})()

showPosts()

})()
