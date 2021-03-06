var CodeMirror = require('codemirror'),
    $ = require('jquery'),
    _ = require('lodash'),
    stringify = require('stringify-object'),
    editors = {},
    feedbackHelpers = {
        _: _,
        stringify: function( obj ) {
            return stringify( obj, { indent: '    ' } )
        }
    },
    feedbackTriggers = {}

require('codemirror/addon/runmode/runmode')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/edit/closebrackets')
require('codemirror/mode/javascript/javascript')
require('codemirror/mode/htmlmixed/htmlmixed')

function getExerciseName() {
    var nameRe = /exercise-(.+)/
    return document.body.className.split('\w').reduce( function( name, className ) {
        var match = nameRe.exec( className )
        return match ? match[1] : name
    }, '' )
}

$('textarea[cm]').each( function() {
    var rows = parseInt( this.getAttribute('rows') ) || undefined,
        cols = parseInt( this.getAttribute('cols') ) || undefined,
        opts = this.getAttribute('cm').split(' ').reduce( function( optsHash, opt ) {
            optsHash[ opt ] = true
            return optsHash
        }, {} ),

        editor =  CodeMirror.fromTextArea( this, {
            mode: 'javascript',
            indentUnit: 4,
            lineNumbers: opts.lineno,
            scrollbarStyle: rows === 1 ? null : 'native',
            matchBrackets: true,
            autoCloseBrackets: true
        }),

        lineHeight = editor.defaultTextHeight(),
        charWidth = editor.defaultCharWidth(),
        codePad = 4 * 2, // default for .CodeMirror-lines
        gutterWidth = 29, // default for .CodeMirror-gutters
        editorHeight = rows ? lineHeight * rows + codePad : null,
        editorWidth = cols ? charWidth * cols + ( opts.lineno ? gutterWidth : 0 ) + codePad : null,

        editorId = Math.random() * 1e17

    editor.setSize( editorWidth, editorHeight )

    if ( rows === 1 || opts.limitlines ) {
        $( editor.display.scroller ).addClass('noscroll');
        editor.on( 'beforeChange', function( _, change ) {
            if ( change.origin === '+input' && change.text[0] === '' ) {
                change.cancel();
            }
        })
    }

    if ( opts.inline ) {
        if ( !editorWidth ) { throw new Error('Inline editor must have explicit width') }
        $( editor.display.wrapper ).addClass('inline')
    }

    editor.display.wrapper.setAttribute( 'data-editorid', editorId )
    editors[ editorId ] = editor;
})

$('pc').each( function() {
    var text = $('<div/>').html( this.innerHTML ).text(),
        $code = $('<code>').html( text ).addClass('cm-s-default'),
        $pre = $('<pre>').append( $code ).addClass('pc'),
        hlType = this.getAttribute('html') !== null ? 'htmlmixed' : 'javascript'

    if ( this.getAttribute('i') !== null ) { $pre.addClass('inline') }
    $( this ).replaceWith( $pre )
    CodeMirror.runMode( text, hlType, $code[0] )
})

$('script[type="feedback-helper"]').each( function() {
    var helperName = this.getAttribute('name'),
        helperFn = eval( '(' + this.innerHTML + ')' )

    if ( helperName in feedbackHelpers ) {
        throw Error('Redefinition of feedback helper: ' + helperName )
    }

    feedbackHelpers[ helperName ] = helperFn
})

$('question').each( function() {
    var $question = $( this ),
        questionName = $question.attr('name'),
        pointValue = parseInt( $question.attr('pts') ),
        editorId = $question.find('.CodeMirror').attr('data-editorid'),
        editor = editors[ editorId ],
        $feedbutton = $question.find('.feedbutton'),
        $fbDef = $question.find('script[type~="feedback"]'),
        fbFn = eval( '(function( editorValue, $q, done ) { try {\n' + $fbDef.html() +
                    '\n} catch( e ) { return e } })' ),
        async = $fbDef.attr('type').indexOf('async') !== -1,
        fbTrigger = $fbDef.attr('trigger'),
        $fbDisplay = $('<p class="feedback">').appendTo( $question ),
        format = $fbDef.attr('format'),
        exerciseName = getExerciseName(),
        qId = exerciseName + questionName,
        ptsId = exerciseName + 'pts',

        saveQuestion = function( content ) {
            if ( !localStorage.login ) { return }

            var editorValue = editor ? editor.getValue() : null,
                saveData = {
                    questionName: questionName,
                    exerciseName: exerciseName,
                    pts: pointValue,
                    data: editorValue
                },
                prevSave = localStorage[ qId ]

            if ( !localStorage[ qId ] ) {
                localStorage[ ptsId ] = ( parseInt( localStorage[ ptsId ] ) || 0 ) + pointValue
            }
            localStorage[ qId ] = editorValue
            if ( prevSave !== editorValue ) {
                $.ajax({
                    type: 'POST',
                    url: '/questions',
                    data: {
                        action: 'save',
                        question: saveData
                    },
                    error: function( xhr, type ) {
                        console.error( xhr.status, xhr.response )
                    }
                })
            }

            if ( $feedbutton.length > 0 ) {
                $feedbutton.css('color', 'green').append('&nbsp;&#10004;')
            }
        },
        done = function( feedback ) {
            var dispOutput = format ? format.replace( '%s', feedback ) : feedback

            if ( feedback ) {
                $fbDisplay.addClass('shown').html( dispOutput )
            } else if ( !async || feedback === null ) {
                $fbDisplay.removeClass('shown')
                saveQuestion()
            }
        },
        triggerFeedback = function() {
            $fbDisplay.removeClass('shown')
            var feedback = ( fbFn.call( feedbackHelpers, editor ? editor.getValue() : null, $question, done ) || {} ).message
            done( feedback )
        }

    if ( localStorage[ qId ] && editor ) {
        editor.setValue( localStorage[ qId ] )
    } else if ( localStorage[ qId ] && $feedbutton.length > 0 ) {
        $feedbutton.css('color', 'green').append('&nbsp;&#10004;')
    }

    feedbackTriggers[ qId ] = triggerFeedback

    if ( fbTrigger === 'blur' ) {
        editor.on( 'blur', function() {
            triggerFeedback()
        })
    } else if ( fbTrigger === 'button' ) {
        $feedbutton.click( triggerFeedback )
    }
})

module.exports = {
    getExerciseName: getExerciseName,
    editors: editors,
    feedbackTriggers: feedbackTriggers,
    triggerFeedbacks: function() {
        Object.keys( feedbackTriggers ).forEach( function( qId ) {
            feedbackTriggers[ qId ]()
        })
    }
}
