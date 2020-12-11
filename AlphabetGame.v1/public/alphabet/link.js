
window.Link = function() {
    var M = {screenName: 'Link'};

    M.init = function() {
        var bg = Draw.newsprite('bg');
        bg.x = -100;
        bg.y = -100;

        var backbtn = Draw.newsprite('back_sign');
        backbtn.x = 10;
        backbtn.y = 10;
        backbtn.click = function() {
            Main.changeScreen(Profile);
        };

        var text = Draw.newsprite('linkscreenfont');
        text.x = Draw.getWidth() / 2 - text.w / 2;
        text.y = 80;

        // we have to make sure the analytics array is empty, otherwise the server may not get the device uuid before generating the link code, won't link our device properly, and we'll end up with an invalid link code

        function waitForEmpty() {
            if (Analytics.outgoing.length > 0) {
                if (CurScreen == Link)
                    setTimeout(waitForEmpty, 100);
                return;
            }

            Server.call('getlinkcode', {}, function(data) {
                var text = Draw.newtext('Link code: ' + data.code);
                text.x = Draw.getWidth() / 2 - text.w / 2;
                text.y = 500;
            }, function(data) {
                console.log(data);
                var text = Draw.newtext("Can't access server.");
                text.x = Draw.getWidth() / 2 - text.w / 2;
                text.y = 500;
            });
        }

        Analytics.send();
        waitForEmpty();

        // also, we want to query the config in case it changes as a result of our device being linked

        function queryConfig() {
            Server.call('getconfig', {}, function(data) {
                if (data.config != null) {
                    Title.reconfigure(data);
                    Main.changeScreen(Profile);
                    
                } else if (CurScreen == Link)
                    setTimeout(queryConfig, 1000);
                
            }, function(err) {
                if (CurScreen == Link)
                    setTimeout(queryConfig, 1000);
            });
        }

        queryConfig();
    };

    return M;
}();
