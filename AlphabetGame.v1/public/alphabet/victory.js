
var Victory = function() {
    var M = {screenName: 'Victory'};

    var timer;
    var chars;
    
    M.init = function() {
        timer = 10;
        
        Draw.newsprite('bg');

        Draw.font = '120px Century Gothic';
        var t = Draw.newtext('NICE WORK');
        t.x = (Draw.getWidth() - t.w) / 2;
        t.y = 100;

        chars = [];
        for (var i = 0; i < 6; i++) {
            var s = Draw.newsprite('char_' + Alphabet[randint(0, 25)]);
            s.x = Draw.getWidth() * (i+1) / 7 - s.w / 2;
            s.y = Draw.getHeight() - 50 - s.h;
            chars.push(s);
        }
        
        Resource.playAudio('correct_' + randint(15), 'voice');
    };

    M.update = function(dt) {
        timer -= dt;
        if (timer <= 0)
            Main.changeScreen(Title);

        if (randint(1, 10) == 10) {
            var i = randint(0, chars.length - 1);
            var s = chars[i];
            var origy = s.y;
            if (!s.tween)
                s.tween = {
                    y: origy - 200,
                    time: .2,
                    done: function() {
                        s.tween = {
                            y: origy,
                            time: .2,
                        };
                    },
                };
        }
    };

    return M;
}();
