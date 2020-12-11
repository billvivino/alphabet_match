
window.Title = (function() {
    var M = {screenName: 'Title'};

    var state = 0;
    var configState = 0;

    var girl, boy, looloo, loading;

    M.init = function() {
        //Main.goFullscreen();

        if (!Debug.lessannoying)
            Resource.playAudio('intro', 'voice');

        var bg = Draw.newsprite('bg');
        bg.x = -100;
        bg.y = -100;

        var kcrew = Draw.newsprite('kangaroo_crew');
        kcrew.x = 50;
        kcrew.y = 20;
        kcrew.scale = .66;

        looloo = Draw.newsprite('looloo_face');
        looloo.x = 400;
        looloo.y = 450;

        girl = Draw.newsprite('girl_face');
        girl.x = 105;
        girl.y = 450;

        boy = Draw.newsprite('boy_face');
        boy.x = 760;
        boy.y = 450;

        var bgclip = Draw.newsprite('bg_bottomclip');
        bgclip.y = 468;

        var title = Draw.newsprite('title');
        title.x = 100;
        title.y = 400;

        var looloo_paw_left = Draw.newsprite('looloo_paw');
        looloo_paw_left.x = 375;
        looloo_paw_left.y = 385;
        var looloo_paw_right = Draw.newsprite('looloo_paw');
        looloo_paw_right.x = 610;
        looloo_paw_right.y = looloo_paw_left.y;

        loading = Draw.newsprite('loading_button1');
        loading.x = 315;
        loading.y = 650;

        girl.tween = {
            y: 235,
            time: .5,
        };

        boy.tween = {
            y: 240,
            time: .5,
        };

        looloo.tween = {
            y: 100,
            time: .75,
        };

        loading.click = function(x, y) {
            clickPlay();
        };
    };

    var progtimer = 0
    var lastprog = 0;
    
    M.update = function(dt) {
        var prog = Resource.loadProgress();

        if (prog != lastprog)
            progtimer = 0;
        else
            progtimer += dt;
        lastprog = prog;

        if (state == 0 && prog >= 1) {
            Resource.loadFonts();
            console.log('loading images:', Resource.loadAllImages());
            console.log('loading audio:', Resource.loadAllAudio());
            state = 1;
        } else if (state == 1) {
            if (prog >= 1 || progtimer >= 1)
                state = 2;
        }

        /*
        var info = 'state=' + state + ' prog=' + prog;
        if (lastinfo != info) {
            analytics({msg: 'debug', info: info});
            lastinfo = info;
        }
        */
        
        if (configState == 0 && Main.deviceReadyFired) {
            queryConfiguration();
            configState = 1;
        }
        // eventually configState is set to 2

        if (state == 2 && configState == 2) {
            loading.image = 'loading_button2';
            state = 100;  // allow play button click
        }
    };

    function queryConfiguration() {
        Server.call('getconfig', {}, function(data) {
            M.reconfigure(data);
            configDone();

        }, function(err) {
            // only display network error icon if we have a cached profile
            if (Storage.getSmall('config')) {
                var neterr = Draw.newsprite('network_error');
                neterr.x = 940;
                neterr.y = 20;
                neterr.click = function() {
                    alert("Couldn't reach the server. Using cached data.");
                };
            }

            M.reconfigure({config: 'cached'});
            configDone();
        });
    }

    function configDone() {
        configState = 2;
    }

    M.reconfigure = function(data) {
        // data = response from api/getconfig
        
        if (data.config == 'cached')
            Config = (Storage.getSmall('config') || defaultConfig());
        else if (data.config) {
            Config = data.config;
            Storage.setSmall('config', Config);
        } else {
            Config = defaultConfig();
            Storage.delSmall('config');
        }

        console.log('configured', Config);
        
        Profile.characters = (data.characters || Storage.getSmall('profile_characters') || {});
        setDefaultCharacters();
        Storage.setSmall('profile_characters', Profile.characters);
    };

    function setDefaultCharacters() {
        if (!Profile.characters['1']) Profile.characters['1'] = 'c';
        if (!Profile.characters['2']) Profile.characters['2'] = 'q';
        if (!Profile.characters['3']) Profile.characters['3'] = 'k';
        if (!Profile.characters['4']) Profile.characters['4'] = 'd';
    }

    function clickPlay() {
        if (state < 100)
            return;

        if (Config.version == 'web')
            Main.changeScreen(Login);
        else
            Main.changeScreen(Profile);
    }

    return M;
})();
