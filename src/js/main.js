'use strict';

var $ = require('zeptojs'),
    _ = require('lodash'),
    moment = require('moment'),
    modals = require('./modals'),
    tileGroupTmp = require('../templates/tile_group.hbs');

window.$ = $;

(function displayNextClass() {
    var CLASS_DATES = [ 5, 7, 9, 12, 14, 16, 21, 23, 26 ],
        CLASS_END_TIME = '12:30:00-05:00',
        now = moment();

    $('.next-class-date').html( CLASS_DATES.reduceRight( function( dispDate, date ) {
        var isoDate = '2015-01-' + ( date < 10 ? '0' + date : date ) + 'T' + CLASS_END_TIME,
            classEnd = moment( isoDate );
        if ( now.isBefore( classEnd ) ) {
            return classEnd.format('dddd M/D') +
                '&nbsp;in&nbsp;<a class="modal-trigger" data-modal="roomnumber">4-231</a>';
        } else {
            return dispDate;
        }
        return now.isBefore( classEnd ) ? classEnd.format('dddd M/D') + ' in 4-231' : dispDate;
    }, 'IAP 2016!' ) );
})();

function centerModal() {
    var modal = $('.modal'),
        modalBox = modal[0].getBoundingClientRect();
    modal.css({
        top: window.innerHeight / 2.3 - modalBox.height / 2,
        left: window.innerWidth / 2 - modalBox.width / 2
    });
}

$(window).resize( function() {
    var modal = $('.modal');
    if ( modal.hasClass('visible') ) {
        centerModal();
    }
});

(function renderTiles( groups ) {
    $('.tile-groups').html( tileGroupTmp( groups ) );
})({ groups: [
    {
        name: 'Register or <a class="modal-trigger" data-modal="login">Log In</a>',
        tiles: [ { ex: 'register', title: 'Register', maxpts: 10 } ]
    }, {
        name: 'The Basics',
        tiles: [
            { ex: 'basics1', title: 'Syntax & Semantics I', maxpts: 20 },
            { ex: 'basics2', title: 'Syntax & Semantics II', maxpts: 20 }
        ]
    }, {
        name: 'Frontend',
        tiles: [
            { ex: 'htmlcss', title: 'The Web GUI: HTML & CSS', maxpts: 20 },
            { ex: 'apis', title: 'Hello World AJAX & APIs', maxpts: 20 },
            { ex: 'fecap', title: 'Designing a Frontend', maxpts: 35 }
        ]
    }, {
        name: 'Backend',
        tiles: [
            { ex: 'backend', title: 'Node.js:<br>Server-Side JavaScript', maxpts: 20 },
            { ex: 'serving', title: 'Clients, the Cloud, & You', maxpts: 20 },
            { ex: 'becap', title: 'Designing a Backend', maxpts: 35 }
        ]
    }
] });

window.fetchUserData = function fetchUserData( callback ) {
    if ( !localStorage.login ) {
        $( $('.tile-group').slice(1) ).addClass('sunken');
    } else {
        $('.tile-group .group-name')[0].innerHTML = 'Register';
        $('.tile-group').removeClass('sunken');

        $.ajax({
            type: 'GET',
            url: '/questions',
            success: function( data ) {
                Object.keys( data.exercises ).map( function( exerciseName ) {
                    var exercise = data.exercises[ exerciseName ]

                    localStorage[ exerciseName + 'pts' ] = exercise.pts;
                    delete exercise.pts;

                    Object.keys( exercise ).map( function( questionId ) {
                        if ( !localStorage[ exerciseName + questionId ] ) {
                            localStorage[ exerciseName + questionId ] = exercise[ questionId ];
                        }
                    });
                });

                if ( callback ) callback();
            },
            error: function( xhr ) {
                if ( xhr.status === 401 ) {
                    delete localStorage.login;
                    window.location = window.location;
                }
            }
        });
    }
};
window.fetchUserData();

(function letterboxes() {
    var PHRASES = [ 'HelloWorld!', 'console.log', 'WebWidgets!', 'MagicalHTML',
        'Client-Side', 'Server-Side', 'WebAppGUIs', 'Asynchrony!', 'HTTP 200 :)' ];
    $('.letterboxes').each( function() {
        var $lboxes = $( this ),
            visible = $lboxes.html().split(''),
            flipped = _.sample( PHRASES ),
            boxes = _.zip( visible, flipped ).reduce( function( boxes, letters ) {
                var $lbox = $('<div class="letterbox">');
                $('<div class="front">').html( letters[0] || '&nbsp;' ).appendTo( $lbox );
                $('<div class="back">').html( letters[1] || '&nbsp;' ).appendTo( $lbox );
                $('<div class="placeholder">').html( '&nbsp;' ).appendTo( $lbox );
                return boxes.concat( $lbox );
            }, [] );

        $lboxes.html( boxes );

        $lboxes.click( function() {
            var ttFlip = 500, // 300 ms to flip
                speed = 8;
            boxes.forEach( function( box, i ) {
                setTimeout( function() {
                    $(box).toggleClass('flipped');
                }, ttFlip * i / speed );
            });
        });
    });
})();

(function eventTiles() {
    $('.tile').each( function() {
        var $tile = $( this );
        $tile.find('.front')
        .click( function() {
            window.location.hash = $tile.attr('data-exercise');
        });
    });
})();

function tallyPoints( $tile, animate ) {
    var $ptsEarnedDisp = $tile.find('.earned'),
    ptsPreviouslyEarned = parseInt( $ptsEarnedDisp.html() ) || 0,
    curPtsEarned = parseInt( localStorage[ $tile.attr('data-exercise') + 'pts' ] ),
    i,
    DELAY = 70;

    function inc( pts ) {
        $ptsEarnedDisp.html( pts );
        if ( pts >= parseInt( $ptsEarnedDisp.attr('data-maxpts') ) ) {
            $tile.find('.front').removeClass('started').addClass('complete');
        } else {
            $tile.find('.front').addClass('started');
        }
    }

    if ( animate !== false ) {
        for ( i = ptsPreviouslyEarned + 1; i <= curPtsEarned; i++ ) {
            setTimeout( inc.bind( null, i ), DELAY * ( i - ptsPreviouslyEarned - 1) );
        }
    } else {
        if ( !curPtsEarned ) { return; }
        inc( curPtsEarned );
    }
}

(function initTallyPoints() {
    $('.tile').each( function() {
        tallyPoints( $( this ), false );
    });
})();

function closeTile() {
    var $open = $('.tile.fixed'),
        cs = window.getComputedStyle( $open[0] );

    if ( localStorage.login ) {
        $('.tile-group .group-name')[0].innerHTML = 'Register';
        $('.tile-group').removeClass('sunken');
    }

    if ( !cs ) { return; } // there is no tile currently open

    $open.removeClass('fixed').css({
        transform: '',
        top: -parseInt( cs.marginTop ),
        left: -parseInt( cs.marginLeft )
    });
    $(document.body).removeClass('clip');
    setTimeout( function() {
        var ttClose = 800, // 800 ms to close
            dummyRect = $('.dummytile')[0].getBoundingClientRect();
        $open
        .addClass('closing')
        .removeClass('expanded notransition flipped')
        .css({
            transform: '',
            top: dummyRect.top + window.scrollY - parseInt( cs.marginTop ),
            left: dummyRect.left + window.scrollX - parseInt( cs.marginLeft )
        });
        setTimeout( function() {
            tallyPoints( $open );
            $('.dummytile').remove();
            $open.removeClass('detached notransition closing');
            setTimeout( function() {
                $('.tile').removeClass('backgrounded');
            }, 100 );
        }, ttClose );
    }, 50 );
}

(function eventModalTriggers() {
    function hideModal( shouldHide ) {
        if ( shouldHide === false ) {
            return;
        }

        var ttHide = 300, // 300 ms to fade out
            $modal = $('.modal');
        $modal.removeClass('visible');
        $('.modal-backsplash').removeClass('visible');
        setTimeout( function() {
            $modal.removeClass('floating');
        }, ttHide );
    }

    function showModal( opts ) {
        var $modalButtons = $('.modal-buttons').html('');
        opts.buttons.forEach( function( btn, i ) {
            var $btn = $('<button class="btn">')
                .html( typeof btn === 'string' ? btn : btn.txt )
                .click( function() {
                    btn.cb ? btn.cb( $('.modal-content').children(), hideModal ) : hideModal();
                });
            if ( i === opts.buttons.length - 1 ) {
                $btn.addClass('primary');
            }
            $btn.appendTo( $modalButtons );
        });
        $('.modal-content').html( opts.content );
        $('.modal').addClass('visible floating');
        $('.modal-backsplash').addClass('visible');
        setTimeout( centerModal, 80 );
    }

    $('.modal-trigger').each( function() {
        var $trigger = $(this);
        $trigger.attr( 'href', '' ).click( function( e ) {
            var modalOpts = modals[ $trigger.attr('data-modal') ];
            e.preventDefault();
            showModal( modalOpts() );
        });
    });

    $('.modal-backsplash').click( function() {
        hideModal();
    });
})();

function openTile( name ) {
    if ( $('.dummytile').length ) { return; }

    if ( $('[data-exercise="' + name + '"]').length === 0 ) {
        return;
    }

    var $tile = $('[data-exercise="' + name + '"]'),
    tile = $tile[0],
    ttFlip = 500, // 500 ms to flip
    tileSize = 150,

    rect = tile.getBoundingClientRect(),
    csTile = window.getComputedStyle( tile ),
    csWrap = window.getComputedStyle( $tile.find('.wrap')[0] ),
    borderWidth = parseInt( csWrap.borderWidth || csWrap.borderTopWidth ),
    topMargin = parseInt( csTile.marginTop ),
    leftMargin = parseInt( csTile.marginLeft ),
    leftOffset = rect.left - borderWidth,
    topOffset = rect.top + borderWidth,
    ratioWidth = tileSize / window.innerWidth,
    ratioHeight = tileSize / window.innerHeight;

    $tile.find('.content').css({
        transform: 'scale(' + ratioWidth + ',' + ratioHeight + ')',
        width: window.innerWidth,
        height: window.innerHeight
    });
    $tile.before('<li class="dummytile">');
    $tile.addClass('flipped detached').css({
        top: rect.top + window.scrollY - topMargin,
        left: rect.left + window.scrollX - leftMargin
    });
    $('.tile:not(.detached)').addClass('backgrounded');
    setTimeout( function() {
        var translate = 'translate(' + leftOffset + 'px, ' + (-topOffset) + 'px)',
        ttExpand = 800; // 800 ms to expand
        $tile.addClass('expanded');
        $tile.css( 'transform', 'rotate3d(0,1,0,180deg) ' + translate );
        setTimeout( function() {
            $(document.body).addClass('clip');
            $tile.addClass('fixed notransition');
        }, ttExpand );
    }, ttFlip );
}

(function openLinkedExercise() {
    setTimeout( function() {
        openTile( window.location.hash.substring( 1 ) );
    }, 1000 );
})();

function hashChange() {
    var hash = window.location.hash.substring( 1 ),
        ttClose = 900;

    function openTheTile() {
        openTile( hash );
        setTimeout( function() {
            window.onhashchange = hashChange;
        }, 900 );
    }

    window.onhashchange = function() {
        window.location.hash = hash;
    };

    if ( $('.tile.detached').length ) {
        closeTile();
        if ( $('[data-exercise="' + hash + '"]').length ) {
            setTimeout( openTheTile, ttClose );
        } else {
            setTimeout( function() {
                window.onhashchange = hashChange;
            }, ttClose );
        }
    } else {
        setTimeout( openTheTile(), 500 );
    }
}

window.onhashchange = hashChange;
