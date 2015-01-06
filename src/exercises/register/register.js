var $ = require('zeptojs'),
    exerciseUtils = require('../exercise.js'),
    editors = exerciseUtils.editors

$('input[type="submit"]').click( function() {
    var regInfo, loginInfo

    exerciseUtils.triggerFeedbacks()

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
                action: 'register',
                regInfo: regInfo,
                name: loginInfo.user,
                pass: loginInfo.pass
            },
            success: function() {
                localStorage.login = true;
                $('#submitFeedback').addClass('shown good')
                .html('Registration submitted successfully! You are now logged in.')
                exerciseUtils.triggerFeedbacks() // save all exercises
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
