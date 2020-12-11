
// hack for electron
if (typeof($) === 'undefined')
    window.$ = window.jQuery = require('./jquery-3.4.1.min.js');

CurScreen = null;

// XXX when doing a release, make sure this stuff is all false
Debug = {
    disablesound: false,
    allowkeys: false,
    lessannoying: false,
    fastmode: false,
    unlockdog: false,
};

Alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

function randint(a, b) {
    // randint(a) = random int from 0 to a-1 (inclusive)
    // randint(a, b) = random int from a to b (inclusive)

    if (typeof(b) === 'undefined') {
        b = a - 1;
        a = 0;
    }
    return Math.floor((b - a + 1) * Math.random() + a);
}

window.Main = (function() {
    var M = {screenName: 'Main'};

    M.deviceReadyFired = false;

    function makeUUID() {
        function addZero(s) {
            s = '' + s;
            if (s.length == 1)
                s = '0' + s;
            return s;
        }

        var now = new Date();

        uuid = (
            (now.getYear() + 1900)
                + addZero(now.getMonth() + 1)
                + addZero(now.getDate()) + '-'
                + addZero(now.getHours())
                + addZero(now.getMinutes())
                + addZero(now.getSeconds())
        );
        uuid += '-';
        for (var i = 0; i < 8; i++)
            uuid += '0123456789abcdef'[randint(16)];
        return uuid;
    }

    M.init = function() {
        var cacheid = Storage.getSmall('cacheid');
        if (cacheid == null) {
            cacheid = makeUUID();
            Storage.setSmall('cacheid', cacheid);
        }

        Server.setvalue('cacheid', cacheid);
        Analytics.load();

        // kick off analytics thread
        setInterval(function() {
            Analytics.send();
        }, 5000);

        analytics('app-start');
        
        // disable right-click
        $("body").on("contextmenu", function(e) {
            return false;
        });

        window.addEventListener('error', function(event) {
            //console.info(event);
            var error = event.error;
            analytics({msg: 'js-error', event: {message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno, error: {name: error.name, message: error.message, stack: error.stack}}});
        });

        if (window.cordova)
            document.addEventListener('deviceready', deviceReady, false);
        else
            browserReady();

        document.addEventListener('resume', appResume, false);

        if (Debug.allowkeys)
            document.addEventListener('keypress', function(event) {
                if (event.key == 'f') {
                    Debug.fastmode = !Debug.fastmode;
                }
                if (event.key == 'x') {
                    for (var i = 0; i < 26 * 2; i++) {
                        Difficulty.levels[i] = Math.random() * 5.5;
                    }
                }
                if (event.key == 's' && Game.allowClick) {
                    Debug.fastmode = true;
                    for (var i = 0; i < 6; i++){
                        Game.squares[i].letter.char = Game.goalLetter;
                        Game.squares[i].letter.victorycheck = true;
                    }
                    Game.squares[0].letter.victorycheck = false;
                    Game.clickSquare(0);
                }
            });

        // images

        Resource.specImages({
            bg: 'images/landscape.png',
            bars_lr: 'images/bars_lr.png',
            bars_tb: 'images/bars_tb.png',

            kangaroo_crew: 'images/kangaroo_crew.png',
            title: 'images/title.png',
            boy_face: 'images/boy_face.png',
            girl_face: 'images/girl_face.png',
            looloo_face: 'images/looloo_face.png',
            looloo_paw: 'images/looloo_paw.png',

            char_c_glow: 'images/char_c_glow.png',
            char_d_glow: 'images/char_d_glow.png',
            char_k_glow: 'images/char_k_glow.png',
            char_q_glow: 'images/char_q_glow.png',

            loading_button1: 'images/loading_button1.png',
            loading_button2: 'images/loading_button2.png',
            network_error: 'images/network_error.png',
            menu_button: 'images/menu_button.png',
            link_button: 'images/link_button.png',
            back_button: 'images/back_button.png',
            stop_sign: 'images/stop_sign.png',
            back_sign: 'images/back_sign.png',
            letter_menu_button: 'images/letter_menu_button.png',
            green_box: 'images/green_box.png',
            green_box_listen: 'images/green_box_listen.png',
            green_box_wide: 'images/green_box_wide.png',
            green_box_extrawide: 'images/green_box_extrawide.png',
            green_box_empty: 'images/green_box_empty.png',
            lock: 'images/lock.png',
            linkscreenfont: 'images/linkscreenfont.png',
            arrow_left: 'images/arrow_left.png',
            arrow_right: 'images/arrow_right.png',
            difficulty: 'images/difficulty.png',

            monitor_front: 'images/monitor_front.png',
            monitor_square: 'images/monitor_square.png',
            monitor_pick: 'images/monitor_pick.png',
            alphabet: 'images/alphabet.png',
            //alphabet_mixed: 'images/alphabet_mixed.png',
            alphabet_lower: 'images/alphabet_lower.png',
            cloud: 'images/cloud.png',
            stars: 'images/stars.png',
            objects: 'images/objects.png',
            objects_bw: 'images/objects_bw.png',
            crops: 'images/crops.png',
            garden: 'images/garden.png',
        });

        Draw.specsubs('bg', {'bg_bottomclip': [100, 568, 1100, 257]});

        Draw.specsubs('bars_lr', {
            bars_left: [0, 0, 500, 800],
            bars_right: [500, 0, 500, 800],
        });
        Draw.specsubs('bars_tb', {
            bars_top: [0, 0, 1100, 500],
            bars_bottom: [0, 500, 1100, 500],
        });

        for (var i = 0; i < 26; i++)
            Resource.specImage('char_' + Alphabet[i], 'images/char_' + Alphabet[i] + '.png');

        // sprite sheets
        
        Draw.specsubs('difficulty', {
            easy: [0, 0, 500, 333],
            medium: [500, 0, 500, 333],
            hard: [0, 333, 500, 333],
            diff_glow: [500, 333, 500, 333],
        });

        var letters = {}, letters_mixed = {}, letters_lower = {};
        for (var i = 0; i < 26; i++) {
            var x = i % 5;
            var y = Math.floor(i / 5);
            letters[Alphabet[i]] = [x * 120, y * 100, 120, 100];
            letters_mixed[Alphabet[i] + '_mixed'] = [x * 230, y * 120, 230, 120];
            letters_lower[Alphabet[i] + '_lower'] = [x * 120, y * 120, 120, 120];
        }
        Draw.specsubs('alphabet', letters);
        //Draw.specsubs('alphabet_mixed', letters_mixed);
        Draw.specsubs('alphabet_lower', letters_lower);

        Draw.specsubs('stars', {
            star_outline: [0, 0, 170, 150],
            star_red: [170, 0, 170, 150],
            star_yellow: [170*2, 0, 170, 150],
            star_green: [170*3, 0, 170, 150],
            star_orange: [170, 150, 170, 150],
            star_blue: [170*2, 150, 170, 150],
            star_purple: [170*3, 150, 170, 150],
        });

        var objspec = {};
        for (var name in objects_spec)
            objspec['object_' + name] = objects_spec[name];
        Draw.specsubs('objects', objspec);

        objspec = {};
        for (var name in objects_spec)
            objspec['object_' + name + '_bw'] = objects_spec[name];
        Draw.specsubs('objects_bw', objspec);

        Draw.specsubs('crops', {
            tiny_1: [75*1, 0, 75, 75],
            tiny_2: [75*2, 0, 75, 75],
            tiny_3: [75*3, 0, 75, 75],
            tiny_4: [75*4, 0, 75, 75],

            dirt_a: [0, 150, 75, 150],
            short_a1: [75*1, 150, 75, 150],
            short_a2: [75*2, 150, 75, 150],
            short_a3: [75*3, 150, 75, 150],
            short_a4: [75*4, 150, 75, 150],

            dirt_b: [0, 450, 75, 150],
            short_b1: [75*1, 450, 75, 150],
            short_b2: [75*2, 450, 75, 150],
            short_b3: [75*3, 450, 75, 150],
            short_b4: [75*4, 450, 75, 150],

            tall_1: [450+150*0, 375, 150, 225],
            tall_2: [450+150*1, 375, 150, 225],
            tall_3: [450+150*2, 375, 150, 225],
            tall_4: [450+150*3, 375, 150, 225],

            flower_small1: [75, 375, 75, 75],
            flower_small2: [150, 375, 75, 75],
            flower_small3: [375, 75*0, 75, 75],
            flower_small4: [375, 75*1, 75, 75],
            flower_small5: [375, 75*2, 75, 75],
            flower_small6: [375, 75*3, 75, 75],
            flower_small7: [375, 75*4, 75, 75],
            flower_small8: [375, 75*5, 75, 75],
            flower_small9: [375, 75*6, 75, 75],

            flower_large1: [450+150*0, 0, 150, 150],
            flower_large2: [450+150*1, 0, 150, 150],
            flower_large3: [450+150*2, 0, 150, 150],
            flower_large4: [450+150*3, 0, 150, 150],
            flower_large5: [450, 150, 150, 150],
        });

        // sounds

        Resource.specAudios({
            intro: 'sounds/title_new.mp3',
            touchandsay: 'sounds/touch_and_say_letter.mp3',
        });

        for (var i = 0; i < 26; i++) {
            Resource.specAudio(Alphabet[i], 'sounds/letter/' + Alphabet[i] + '.mp3');
            Resource.specAudio('charname_' + Alphabet[i], 'sounds/charname/' + Alphabet[i] + '.mp3');
        }

        for (var i = 0; i < 15; i++) {
            var n = (i < 10 ? '0' : '') + i;
            Resource.specAudio('correct_' + i, 'sounds/correct/ex_' + n + '.mp3');
        }

        for (var i = 0; i < 3; i++)
            Resource.specAudio('incorrect_' + i, 'sounds/incorrect/try_another_0' + i + '.mp3');

        for (var name in objects_spec)
            Resource.specAudio('object_' + name, 'sounds/objects/' + name + '.mp3');

        // start the game

        Draw.init();
        Draw.cameraViewport(1100, 800);

        M.changeScreen(Title);
    }

    // only fires in phonegap
    var deviceReady = function() {
        analytics({
            msg: 'device-ready',
            model: device.model,
            platform: device.platform + ' ' + device.version,
            uuid: device.uuid,
        });

        M.deviceReadyFired = true;
    };

    var browserReady = function() {
        analytics({
            msg: 'device-ready',
            model: navigator.userAgent,
            platform: navigator.platform,
            uuid: null,
        });

        M.deviceReadyFired = true;
    }

    var appResume = function() {
        analytics('app-resume');
    };

    M.changeScreen = function(scr) {
        if (CurScreen && CurScreen.deinit)
            CurScreen.deinit();
        Draw.clear();
        if (!scr.screenName)
            console.warn('screen without name:', scr);
        analytics({msg: 'changescreen', dest: scr.screenName});
        CurScreen = scr;
        Draw.setUpdate(scr.update);
        scr.init();
    };

    M.goFullscreen = function() {
        var body = $('body')[0];
        if (body.requestFullscreen)
            body.requestFullscreen();
        else if (body.webkitRequestFullscreen)
            body.webkitRequestFullscreen();
        else if (body.mozRequestFullScreen)
            body.mozRequestFullScreen();
        else
            console.warn('no requestFullscreen() found');
    };

    M.leaveFullscreen = function() {
        if (document.exitFullscreen)
            document.exitFullscreen();
        else if (document.mozCancelFullScreen)
            document.mozCancelFullScreen();
        else
            console.warn('no exitFullscreen() found');
    };

    return M;
})();

Main.init();
