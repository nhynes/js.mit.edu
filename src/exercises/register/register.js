var $ = require('zeptojs'),
    exerciseUtils = require('../exercise.js'),
    editors = exerciseUtils.editors,
    feedbackTriggers = exerciseUtils.feedbackTriggers

$('input[type="submit"]').click( function() {
    var regInfo, loginInfo

    Object.keys( feedbackTriggers ).forEach( function( qId ) {
        feedbackTriggers[ qId ]()
    })

    if ( $('.feedback.shown:not(#submitFeedback').length ) {
        $('#submitFeedback').addClass('shown').html('Please correct the issues shown above')
    } else {
        regInfo = $('question').reduce( function( info, question ) {
            var $question = $( question ),
            questionName = $question.attr('name')
            inp = editors[ $question.find('.CodeMirror').attr('data-editorid') ].getValue()

            if ( questionName !== 'login' ) {
                info[ questionName ] = eval( inp )
            }
            return info
        }, {} )
        eval( editors[ $('question[name="login"]').find('.CodeMirror').attr('data-editorid') ]
             .getValue() )
         loginInfo = myLogin

        $('#submitFeedback').removeClass('shown')
        $.ajax({
            type: 'POST',
            url: '/user',
            data: {
                regInfo: regInfo,
                loginInfo: loginInfo
            },
            success: function() {
                $('#submitFeedback').addClass('shown good')
                .html('Registration submitted successfully! You are now logged in.')
            },
            error: function( xhr, type ) {
                if ( xhr.status === 409 ) {
                    $('#submitFeedback').addClass('shown')
                    .html('That username has already been taken :( Try another?')
                } else {
                    console.error( xhr.status, xhr.response )
                }
            }
        })
    }
})
