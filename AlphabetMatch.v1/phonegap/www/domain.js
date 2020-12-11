
var Domain = (function() {
    var M = {screenName: 'Domain'};

    M.init = function() {
        var bg = Draw.newsprite('bg');
        bg.x = -100;
        bg.y = -100;

        var stop = Draw.newsprite('stop_sign');
        stop.x = 20;
        stop.y = 20;
        stop.click = function() {
            analytics('backout');
            Main.changeScreen(Profile);
        };

        var title = Draw.newsprite('title');
        title.scale = .5;
        title.x = 330;
        title.y = 10;

        var glow = Draw.newsprite('diff_glow');
        glow.alpha = 0;
        
        var easy = Draw.newsprite('easy');
        easy.x = 300;
        easy.y = 150;
        easy.click = function() {
            Difficulty.init('easy');
            Main.changeScreen(Game);
        }

        var medium = Draw.newsprite('medium');
        medium.x = 80;
        medium.y = 450;
        medium.click = function() {
            Difficulty.init('medium');
            Main.changeScreen(Game);
        }

        var hard = Draw.newsprite('hard');
        hard.x = 520;
        hard.y = 450;
        hard.click = function() {
            Difficulty.init('hard');
            Main.changeScreen(Game);
        }

        var glowlist = [easy, medium, hard];
        var glowing = 0;
        function glow1() {
            glow.x = glowlist[glowing].x;
            glow.y = glowlist[glowing].y;
            glowing = (glowing + 1) % glowlist.length;
            glow.tween = {
                time: .5,
                alpha: 1,
                done: function() { return glow2(); },
            };
        }
        function glow2() {
            glow.tween = {
                time: .5,
                alpha: 0,
                done: function() { return glow1(); },
            };
        }
        glow1();
    };
    
    return M;
})();
