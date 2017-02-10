(function(app, $) {
    "use strict";

    app.init = function() {
        app.container = $('#pojan');
        app.cookies();

        $('#hamburger').on('click', function () {
            $('#navbar').toggle();
            /*
            if (currHeight<0){
                $('#navbar').animate({'width':newWidth+'px','height':newHeight+'px'},750);
            }else{
                $('#navigation').animate({'height':'30px','width':'27px'},750);
            }
            */
        });


    };

    app.cookies = function() {
        var $ccont = $('.cookies'),
            name = 'accept_cookies',
            $btn = $ccont.find('button');
        if (app.cookie.get(name) === null) {
            $ccont.removeClass('out');
            $btn.on('click', function(e) {
                e.preventDefault();
                app.cookie.set(name, true, 8760);
                $ccont.addClass('out');
            });
        }
    };

    app.cookie = {
        get: function(key) {
            var tmp = document.cookie.match((new RegExp(key + '=([^;]*)', 'g')));
            if (!tmp || !tmp[0]) {
                return null;
            }
            return unescape(tmp[0].substring(key.length + 1, tmp[0].length).replace(';', '')) || null;

        },
        set: function(key, value, hours, path, domain, secure) {
            var exp = '',
                ok, ckie = [key + '=' + escape(value), 'path=' + ((!path || path === '') ? '/' : path), 'domain=' + ((!domain || domain === '') ? window.location.hostname : domain)];

            if (hours) {
                if (parseInt(hours) === 'NaN') {
                    exp = '';
                } else {
                    var now = new Date();
                    now.setTime(now.getTime() + hours * 60 * 60 * 1000);
                    exp = now.toGMTString();
                }
                ckie.push('expires=' + exp);
            }
            if (secure) {
                ckie.push('secure');
            }
            ok = (document.cookie = ckie.join('; '));
            return ok;
        },
        unset: function(key, path, domain) {
            var p = (!path || typeof path !== 'string') ? '' : path,
                d = (!domain || typeof domain !== 'string') ? '' : domain;

            if (this.get(key)) {
                this.set(key, '', 'Thu, 01-Jan-70 00:00:01 GMT', p, d);
            }
        }
    };

    app.customSelects = function() {
        app.selects = [];
        $('.select').each(function() {
            var select = new Select(this, {
                select: this.nodeName.toLowerCase() === 'select',
                scrollOptions: {
                    scrollbars: false,
                    scrollingX: false
                }
            });
            app.selects.push(select);
        });

        $(window).on('resize', function() {
            app.mobile =
                $.each(app.selects, function(key, select) {
                    select[app.mobile ? 'on' : 'off']();
                });
        });
    };

    app.cache = function() {
        window.addEventListener('load', function(e) {
            window.applicationCache.addEventListener('updateready', function(e) {
                if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                    window.applicationCache.swapCache();
                    window.location.reload();
                }
            }, false);
        }, false);
    };


    $(function() {
        app.init();
    });

})({}, jQuery);

initMap = function() {
    var pojanPos = {lat: 47.505385, lng: 18.925661};
    var center = {lat: 47.505385, lng: 18.920661};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: center
    });
    var marker = new google.maps.Marker({
        position: pojanPos,
        map: map
    });
}    
