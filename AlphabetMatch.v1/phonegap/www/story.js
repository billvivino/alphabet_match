
var Story = (function() {
    var M = {screenName: 'Story'};

    // 0. char intro
    // 1. char finds an object
    // 2. char brings the object to second char

    var scene = 0;
    var char1, objname, char2;

    const clearpad = 100;

    M.resetScene = function() {
        scene = 0;
    };
    
    M.init = function() {
        var bg = Draw.newsprite('bg');
        bg.x = -100;
        bg.y = -100;

        var mm = Game.makeMonitor();
        M.monitor = mm.monitor;
        M.squares = mm.squares;

        M.monitor.layer = 2;
        M.monitor.tween = {
            time: 1,
            y: M.monitor.y + Draw.getHeight(),
            done: anim1,
        };

        for (var i = 0; i < M.squares.length; i++) {
            M.squares[i].layer = 1;
            M.squares[i].tween = {
                time: 1,
                y: M.squares[i].y + Draw.getHeight(),
            };
        }

        function anim1() {
            M['scene' + scene]();
            scene = (scene + 1) % 3;
        }
    };

    M.scene0 = function() {
        char1 = randint(26);

        var c = Draw.newsprite('char_' + Alphabet[char1]);
        c.x = -c.w;
        c.y = Draw.getHeight() * .9 - c.h;
        c.tween = {
            time: 1,
            x: Draw.getWidth() / 2 - c.w / 2,
            done: anim1,
        };

        function anim1() {
            Resource.playAudio('charname_' + Alphabet[char1], 'voice');
            c.tween = {
                time: .5,
                y: c.y - 200,
                done: anim2,
            };
        };

        function anim2() {
            c.tween = {
                time: .5,
                y: c.y + 200,
                done: anim3,
            };
        };

        function anim3() {
            setTimeout(function() {
                c.tween = {
                    time: 1,
                    x: Draw.getWidth() + clearpad,
                    done: anim4,
                };
            }, 500);
        }

        function anim4() {
            sceneFinish();
        }
    };

    M.scene1 = function() {
        char2 = char1;
        while (char2 == char1)
            char2 = randint(26);
        
        var possible = [];
        for (var name in objects_spec) {
            if (name[0] == Alphabet[char2])
                possible.push(name);
        }
        objname = possible[randint(possible.length)];

        var c = Draw.newsprite('char_' + Alphabet[char1]);
        c.x = -c.w;
        c.y = Draw.getHeight() * .9 - c.h;
        c.tween = {
            time: 1,
            x: Draw.getWidth() / 3 - c.w/2,
            done: anim1,
        };

        var obj = Draw.newsprite('object_' + objname);
        obj.x = Draw.getWidth() * 2/3 - obj.w / 2;
        obj.y = Draw.getHeight() * .9 - obj.h;

        function anim1() {
            Resource.playAudio('object_' + objname, 'voice');
            obj.tween = {
                time: .5,
                y: obj.y - 200,
                done: anim2,
            };
        }

        function anim2() {
            obj.tween = {
                time: .5,
                y: obj.y + 200,
                done: anim3,
            };
        }

        function anim3() {
            c.tween = {
                time: .5,
                x: Draw.getWidth() * 2/3 - c.w/2,
                done: anim4,
            };
        }

        function anim4() {
            c.tween = {
                time: .5,
                x: Draw.getWidth() + clearpad,
                done: anim5,
            };
            obj.tween = {
                time: c.tween.time,
                x: c.tween.x,
            };
        }

        function anim5() {
            sceneFinish();
        }
    };

    M.scene2 = function() {
        var c = Draw.newsprite('char_' + Alphabet[char1]);
        c.x = -c.w;
        c.y = Draw.getHeight() * .9 - c.h;
        c.tween = {
            time: 1,
            x: Draw.getWidth() / 3 - c.w/2,
            done: anim1,
        };

        var c2 = Draw.newsprite('char_' + Alphabet[char2]);
        c2.x = Draw.getWidth() * 2/3 - c2.w / 2;
        c2.y = Draw.getHeight() * .9 - c2.h;

        var obj = Draw.newsprite('object_' + objname);
        obj.x = c.x + c.w/2;
        obj.y = c.y + c.h - obj.h;
        obj.tween = {
            time: c.tween.time,
            x: c.tween.x,
        };

        function anim1() {
            Resource.playAudio('object_' + objname, 'voice');
            obj.tween = {
                time: 2,
                x: c2.x + c2.w/2,
                done: function() {
                    setTimeout(anim2, 500);
                },
            };
        }

        function anim2() {
            Resource.playAudio('charname_' + Alphabet[char2], 'voice');
            c2.tween = {
                time: .5,
                y: c2.y - 200,
                done: anim3,
            };
        }

        function anim3() {
            c2.tween = {
                time: .5,
                y: c2.y + 200,
                done: anim4,
            };
        }

        function anim4() {
            setTimeout(sceneFinish, 2000);
        }
    };

    function sceneFinish() {
        if (scene == 0) {
            // on the last scene (scene is 0 because it looped), skip the monitor returning after the end of the story (Garden will fire)
            anim1();
            return;
        }
        
        M.monitor.tween = {
            time: 1,
            y: M.monitor.y - Draw.getHeight(),
            done: anim1,
        };

        for (var i = 0; i < M.squares.length; i++)
            M.squares[i].tween = {
                time: 1,
                y: M.squares[i].y - Draw.getHeight(),
            };

        function anim1() {
            Main.changeScreen(Game);
        }
    }

    return M;
})();
