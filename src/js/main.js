'use strict';

var $ = require('zeptojs'),
    _ = require('lodash'),
    moment = require('moment'),
    modals = require('./modals'),
    tileGroupTmp = require('../templates/tile_group.hbs'),
    PHRASES = [ 'HelloWorld!', 'console.log', 'WebWidgets!', 'MagicalHTML',
        'Client-Side', 'Server-Side', 'WebAppGUIs', 'Asynchrony!', 'HTTP 200 :)' ];

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
        tiles: [ { ex: 'register', title: 'Register' } ]
    }, {
        name: 'The Basics',
        tiles: [
            { ex: 'basics1', title: 'Syntax & Semantics I' },
            { ex: 'basics2', title: 'Syntax & Semantics II' }
        ]
    }, {
        name: 'Frontend',
        tiles: [
            { ex: 'htmlcss', title: 'The Web GUI: HTML & CSS' },
            { ex: 'apis', title: 'Hello Backend: AJAX & APIs' },
            { ex: 'fecap', title: 'Designing a Frontend' }
        ]
    }, {
        name: 'Backend',
        tiles: [
            { ex: 'backend', title: 'Node.js: Server-Side JavaScript' },
            { ex: 'serving', title: 'Clients, the Cloud, & You' },
            { ex: 'becap', title: 'Designing a Backend' }
        ]
    }
] });

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
        var tile = this,
            $tile = $( tile ),
            ttFlip = 500, // 500 ms to flip
            tileSize = 150,
            ratioWidth = tileSize / window.innerWidth,
            ratioHeight = tileSize / window.innerHeight;

        // scale the back content
        $tile.find('.content').css({
            transform: 'scale(' + ratioWidth + ',' + ratioHeight + ')',
            width: window.innerWidth,
            height: window.innerHeight
        });

        // add the tile opener listener
        $tile.find('.front')
        .mouseover( function() {
            var ex = $tile.attr('data-exercise'),
                $content = $tile.find('.content');

            if ( $content.attr('src') ) {
                return;
            }
            $content.attr( 'src', 'exercises/' + ex );
        })
        .click( function() {
            var rect = tile.getBoundingClientRect(),
                csTile = window.getComputedStyle( $tile[0] ),
                csWrap = window.getComputedStyle( $tile.find('.wrap')[0] ),
                borderWidth = parseInt( csWrap.borderWidth || csWrap.borderTopWidth ),
                topMargin = parseInt( csTile.marginTop ),
                leftMargin = parseInt( csTile.marginLeft ),
                leftOffset = rect.left - borderWidth,
                topOffset = rect.top + borderWidth;
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
                $(document.body).addClass('clip');
                setTimeout( function() {
                    $tile.addClass('fixed notransition');
                }, ttExpand );
            }, ttFlip );
        });
    });
})();

window.closeTile = function() {
    var $open = $('.tile.fixed'),
        cs = window.getComputedStyle( $open[0] ),
        dummyRect = $('.dummytile')[0].getBoundingClientRect();

    $open.removeClass('fixed').css({
        transform: '',
        top: -parseInt( cs.marginTop ),
        left: -parseInt( cs.marginLeft )
    });
    setTimeout( function() {
        var ttClose = 800; // 800 ms to close
        $open
        .addClass('closing')
        .removeClass('expanded notransition flipped')
        .css({
            transform: '',
            top: dummyRect.top + window.scrollY - parseInt( cs.marginTop ),
            left: dummyRect.left + window.scrollX - parseInt( cs.marginLeft )
        });
        setTimeout( function() {
            // $open.removeClass('flipped');
            setTimeout( function() {
                $('.dummytile').remove();
                $open.removeClass('detached notransition closing');
                $(document.body).removeClass('clip');
                setTimeout( function() {
                    $('.tile').removeClass('backgrounded');
                }, 100 );
            }, ttClose );
        }, ttClose );
    }, 50 );
};

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
        setTimeout( centerModal, 10 );
    }

    $('.modal-trigger').each( function() {
        var $trigger = $(this);
        $trigger.attr( 'href', '' ).click( function( e ) {
            var modalOpts = modals[ $trigger.attr('data-modal') ];
            e.preventDefault();
            showModal( modalOpts() );
        });
    });
})();

(function checkLogin() {
    if ( !localStorage.login ) {
        $( $('.tile-group').slice(1) ).addClass('sunken');
    } else {
        $('.tile-group .group-name')[0].innerHTML = 'Register';
        $.ajax({
            type: 'GET',
            url: '/user?action=checklogin',
            error: function( xhr, type ) {
                if ( xhr.status === 401 ) {
                    delete localStorage.login;
                    window.location = window.location;
                }
            }
        });
    }
})();
