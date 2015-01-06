'use strict';

var $ = require('zeptojs');

module.exports = {
    roomnumber: function() {
        return {
            content: '<a href="http://whereis.mit.edu/?go=4" target="_blank"><img src="bldg_4.png" alt="MIT Building 4"></a>',
            buttons: [ 'A-Okay' ]
        };
    },
    login: function() {
        return {
            content: '<form class="login"><input type="text" name="name" placeholder="Username"><br><input type="password" name="pass" placeholder="Password"><input type="hidden" name="action" value="login"></form>',
            buttons: [
                'Cancel',
                {
                    txt: 'Log in',
                    cb: function( $form, done ) {
                        var $inputs = $form.find('input');

                        $.ajax({
                            type: 'POST',
                            url: '/user',
                            data: $form.serialize(),
                            success: function() {
                                localStorage.login = true;
                                fetchUserData(function() {
                                    window.location = window.location;
                                });
                            },
                            error: function( xhr, type ) {
                                if ( xhr.status === 401 ) {
                                    $form.addClass('error');
                                    $inputs.focus( function() {
                                        $form.removeClass('error');
                                        $inputs.off('focus');
                                    });
                                } else {
                                    console.error( xhr.status, xhr.response );
                                    $form.before('<span style="color:red">Server Error</span>');
                                }
                                done( false );
                            }
                        });
                    }
                }
           ]
        };
    }
};
