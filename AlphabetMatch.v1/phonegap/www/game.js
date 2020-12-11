
window.Game = (function() {
    var M = {screenName: 'Game'};

    var showGarden = true;

    var animspeed = 1;
    var shakeDuration = 1;
    var played;
    
    var idleTimer;
    var showHint;

    // called when entering the game from the profile screen, but not after the garden or story screens
    M.openProfile = function() {
        showGarden = true;
        M.combo = 0;  // combo is only reset when first starting
    };
    
    M.init = function() {
        played = 0;
        M.timeron = false;
        /*
          M.timer = 5 * 60;
          M.timeron = true;
        */

        var bg = Draw.newsprite('bg');
        bg.x = -100;
        bg.y = -100;

        var menubtn = Draw.newsprite('stop_sign');
        menubtn.x = 10;
        menubtn.y = 10;
        menubtn.click = function() {
            analytics('backout');
            Main.changeScreen(Profile);
        };

        Draw.font = '16px Century Gothic';

        M.allowClick = true;
        M.shakeTimer = 0;

        M.character = null;

        var mm = M.makeMonitor(M.clickSquare);
        M.monitor = mm.monitor;
        M.squares = mm.squares;

        setupNextLetter();
    };

    M.makeMonitor = function(clickHandler) {
        var monitor = Draw.newsprite('monitor_front');
        monitor.layer = 1;
        monitor.x = 40;
        monitor.y = 120;

        var squares = [];
        
        function loop(x, y) {
            var i = x + y * 3;

            var sprite = Draw.newsprite('monitor_square');
            sprite.x = monitor.x + 48 + x * 310;
            sprite.y = monitor.y + 47 + y * 287;
            if (clickHandler)
                sprite.click = function() {
                    clickHandler(i);
                };

            squares.push(sprite);
        }
        
        for (var y = 0; y < 2; y++)
            for (var x = 0; x < 3; x++)
                loop(x, y);

        return {
            monitor: monitor,
            squares: squares,
        };
    };

    var timertext = null;
    var timersprite = null;
    var timery = 0;

    var updateTimerText = function() {
        var sec = Math.floor(M.timer % 60);
        if (sec < 10)
            sec = '0' + sec;

        var s = 'Timer: ' + Math.floor(M.timer / 60) + ':' + sec;
        if (s != timertext) {
            timertext = s;
            if (timersprite)
                timersprite.dead = true;
            var s = Draw.newtext(timertext);
            s.x = Draw.getWidth() - s.w;
            s.y = timery;
            timersprite = s;
        }
    };

    var randomObject = function(letter, used) {
        var list = [];
        for (var name in objects_spec) {
            if (name.substring(0, 1) == letter && !used[name])
                list.push(name);
        }
        var obj = list[randint(list.length)];
        //console.log('randomObject', used, obj);
        used[obj] = true;
        return obj;
    };

    var makeObjectSprite = function(obj, objectLevel, case_, lit) {
        return Draw.newdynamic(function(ctx, setsize) {
            // this can fit any object image
            var imgw = 191, imgh = 149 + 50;
            setsize(imgw, imgh);
            
            var acorn = Draw.newfreesprite('object_' + obj + (objectLevel == 'medium' && !lit ? '_bw' : ''));

            var text = obj.replace(/_/g, ' ');
            if (case_ == 0)
                text = text.toUpperCase();
            if (objectLevel == 'medium')
                text = text.substring(0, 1);

            var textsize;
            var px = (objectLevel == 'medium' ? 80 : 40);
            while (px > 0) {
                ctx.font = px + 'px Century Gothic';
                textsize = ctx.measureText(text);
                if (textsize.width > imgw * .9) {
                    px -= 3;
                    continue;
                }
                break;
            }
            
            acorn.draw(ctx, (imgw - acorn.w) / 2, (imgh - acorn.h) / 2);
            
            var tx, ty = imgh - px;
            if (objectLevel == 'medium')
                tx = imgw * .75 - textsize.width / 2;
            else
                tx = (imgw - textsize.width) / 2;
            var pad = 5;
            
            ctx.fillStyle = 'rgba(255, 255, 255, .9)';
            ctx.fillRect(tx - pad, ty - pad, textsize.width + pad*2, px * .85 + pad*2);
            ctx.strokeStyle = 'rgb(127, 127, 127)';
            ctx.strokeRect(tx - pad, ty - pad, textsize.width + pad*2, px * .85 + pad*2);

            ctx.textBaseline = 'bottom';
            if (objectLevel == 'medium') {
                if (lit)
                    ctx.fillStyle = 'rgb(0, 0, 0)';
                else
                    ctx.fillStyle = 'rgb(255, 0, 0)';
                ctx.fillText(text, tx, ty + px);
            } else {
                ctx.fillStyle = 'rgb(255, 0, 0)';
                ctx.fillText(text.substring(0, 1), tx, ty + px);
                var ts = ctx.measureText(text.substring(0, 1));
                ctx.fillStyle = 'rgb(0, 0, 0)';
                ctx.fillText(text.substring(1), tx + ts.width, ty + px);
            }
        });
    };
    
    var setupNextLetter = function() {
        if (Difficulty.atborder() && showGarden) {
            showGarden = false;
            Main.changeScreen(Garden);
            return;
        } else
            showGarden = true;

        M.diff = Difficulty.getdiff();

        M.level = {};
        M.level.lettercase = ['upper', 'lower'][Math.floor(M.diff.letter / 26)];

        var objectLevel = Difficulty.domain;

        /*
        if (M.combo > 10) {
            animspeed = 1 - (M.combo - 10) / 30;
            if (animspeed < .1)
                animspeed = .1;
        } else
            animspeed = 1;
        */

        var n = M.diff.letter;
        var case_ = Math.floor(n / 26);

        M.goalLetter = Alphabet[n % 26];
        M.wrongs = 0;
        M.timespent = 0;
        M.timespentrun = false;

        M.level.goalcloud = (M.diff.level == 3);
        M.level.goalvanish = (M.diff.level >= 3);
        M.level.goalcount = (M.diff.level >= 2 ? 1 : [3, 2][M.diff.level]);

        var chars;
        var objused = {};
        do {
            // set up letters
            chars = [];
            for (var i = 0; i < 6; i++) {
                var c = {};

                do {
                    if (c.letter)
                        delete objused[c.letter];
                    c.number = randint(26) + case_ * 26;
                    c.letter = Alphabet[c.number % 26];
                    if (objectLevel != 'easy')
                        c.letter = randomObject(c.letter, objused);
                } while (c.letter.substring(0, 1) == M.goalLetter);

                chars.push(c);
            }

            // set up goal letters
            for (var i = 0; i < M.level.goalcount; i++) {
                var k;
                do {
                    k = randint(6);
                } while (chars[k].letter.substring(0, 1) == M.goalLetter);
                //console.log('overwrote', chars[k].letter);
                delete objused[chars[k].letter];
                chars[k].letter = M.goalLetter;
                if (objectLevel != 'easy')
                    chars[k].letter = randomObject(chars[k].letter, objused);
                chars[k].number = n;
            }
        } while (badLetters(chars));

        var choices = '';

        for (var i = 0; i < 6; i++) {
            var square = M.squares[i];
            if (square.letter)
                square.letter.dead = true;

            square.number = chars[i].number;

            var letter;
            if (chars[i].letter.length == 1) {
                var name = chars[i].letter;
                if (case_ == 1)
                    name += '_lower';
                letter = Draw.newsprite(name);
                
            } else {
                letter = makeObjectSprite(chars[i].letter, objectLevel, case_);
            }
            
            letter.level = chars[i].level;
            letter.char = chars[i].letter.substring(0, 1);
            letter.scale = (objectLevel == 'easy' ? 2.5 : 1.75);
            letter.x = square.x + square.w / 2 - letter.scale * letter.w / 2;
            letter.basex = letter.x;
            letter.y = square.y + square.h / 2 - letter.scale * letter.h / 2;
            if (objectLevel != 'easy')
                letter.y -= 30;
            letter.layer = 3;

            // set up sprite change on click
            if (objectLevel == 'medium') {
                var lit = makeObjectSprite(chars[i].letter, objectLevel, case_, true);
                letter.canvas_lit = lit.canvas;
                letter.source_lit = lit.source;
                lit.dead = true;
            }

            square.letter = letter;

            if (choices)
                choices += ' ';
            switch (case_) {
            case 0: choices += letter.char.toUpperCase(); break;
            case 1: choices += letter.char; break;
            }
        }

        analytics({msg: 'newletter', goal: M.goalLetter, choices: choices, level: M.diff.rawlevel});

        var gs_ox = 20, gs_oy = 20;

        M.goalBox = Draw.newsprite('green_box' + (M.diff.level >= 4 ? '_listen' : ''));
        M.goalBox.x = (Draw.getWidth() - M.goalBox.w) / 2;
        M.goalBox.y = 20;
        M.goalBox.scale = 1;
        M.goalBox.layer = 1;

        M.allowClick = true;
        M.timespentrun = true;
        
        idleTimer = 0;
        showHint = 0;

        // clicking goal box plays reminder + animation
        M.goalBox.click = function(params) {
            if (params == null) params = {};
            if (!params.artificial)
                resetHintTimer();
            
            if (M.allowClick && !M.goalBox.tween && !M.goalCloud) {
                if (!params.artificial)
                    analytics('goalcheck');

                if (!params.silent)
                    Resource.playAudio(M.goalLetter, 'voice');

                M.goalBox.layer = 4;
                if (!M.level.goalvanish)
                    M.goalSprite.layer = 4;

                var origx = M.goalBox.x, origy = M.goalBox.y;
                M.goalBox.tween = {
                    x: origx - M.goalBox.w/2,
                    y: origy - M.goalBox.h/2,
                    scale: 2,
                    time: .5 * animspeed,
                    done: function() {
                        M.goalBox.tween = {
                            x: origx,
                            y: origy,
                            scale: 1,
                            time: .5 * animspeed,
                            done: function() {
                                M.goalBox.layer = 1;
                                M.goalSprite.layer = (M.level.goalvanish ? 0: 1);
                                if (M.goalCloud)
                                    M.goalCloud.layer = M.goalBox.layer;
                            },
                        };
                    },
                };

                M.goalSprite.tween = {
                    x: origx + gs_ox*2 - M.goalBox.w/2,
                    y: origy + gs_ox*2 - M.goalBox.h/2,
                    scale: 2,
                    time: .5 * animspeed,
                    done: function() {
                        M.goalSprite.tween = {
                            x: origx + gs_ox,
                            y: origy + gs_oy,
                            scale: 1,
                            time: .5 * animspeed,
                        };
                    },
                };
            }
        };

        var lname = M.goalLetter;
        if (M.level.lettercase == 'lower')
            lname += '_' + M.level.lettercase;
        M.goalSprite = Draw.newsprite(lname);
        M.goalSprite.scale = M.goalBox.scale;
        if (M.level.goalvanish)
            M.goalSprite.layer = M.goalBox.layer - 1;
        else
            M.goalSprite.layer = M.goalBox.layer;
        M.goalSprite.x = M.goalBox.x + gs_ox;
        M.goalSprite.y = M.goalBox.y + gs_oy;

        if (M.goalCloud) {
            M.goalCloud.dead = true;
            M.goalCloud = null;
        }

        // trigger the initial letter sound + hint as to what the goal is
        // this has to be after goalCloud is cleared and before it's reset, otherwise it won't trigger
        M.goalBox.click({artificial: true});

        if (M.level.goalcloud) {
            M.goalCloud = Draw.newsprite('cloud');
            M.goalCloud.scale = 1.5;
            M.goalCloud.timer = 0;
            M.goalCloud.maxtime = 10;
            M.goalCloud.startx = M.goalBox.x + M.goalBox.w / 2 - M.goalCloud.scale * M.goalCloud.w / 2 - 50;
            M.goalCloud.x = M.goalCloud.startx;
            M.goalCloud.y = M.goalBox.y + M.goalBox.h / 2 - M.goalCloud.scale * M.goalCloud.h / 2;
            M.goalCloud.layer = M.goalBox.layer;
            M.goalCloud.click = function() {
                resetHintTimer();
                if (M.allowClick) {
                    analytics('cloudtouch');
                    M.goalCloud.timer += 3;
                    Resource.playAudio(M.goalLetter, 'voice');
                }
            };
        }
    };

    M.moveLetters = function() {
        var mag = 50;
        var perc = M.shakeTimer / shakeDuration;
        if (perc < .1) mag *= perc / .1;
        else if (perc > .9) mag *= (1 - perc) / .1;

        for (var i = 0; i < 6; i++) {
            var letter = M.squares[i].letter;
            var shake;
            if (M.shakeTimer > 0) {
                shake = (M.shakeTimer * Math.PI * 2.5 + i * Math.PI / 3);
            } else {
                shake = 0;
            }
            letter.x = letter.basex + mag * Math.sin(shake);
        }
    };

    function doHintAnim() {
        M.goalBox.click({artificial: true, silent: true});
    }

    function resetHintTimer() {
        idleTimer = 0;
        showHint = 0;
    }
    
    M.update = function(dt) {
        if (M.timeron) {
            M.timer -= dt;
            if (M.timer <= 0) {
                M.timer = 0;
                Main.changeScreen(Victory);
            }
            updateTimerText();
        }

        if (M.timespentrun) {
            M.timespent += dt;
            idleTimer += dt;
        }

        if ((idleTimer >= 5 && showHint == 0) || (idleTimer >= 10 && showHint == 1) || (idleTimer >= 20 && showHint == 2)) {
            doHintAnim();
            showHint++;
        }

        animspeed = (Debug.fastmode ? .1 : 1);

        // incorrect animation
        if (M.shakeTimer > 0) {
            M.shakeTimer -= dt / animspeed;
            M.moveLetters();
            if (M.shakeTimer <= 0) {
                // rehide the goal letter if it was shown during the shake
                if (M.level.goalvanish)
                    M.goalSprite.layer = 0;

                M.clearMonitorPick();
                M.allowClick = true;

                // XXX?
                /*
                if (M.wrongs == 2 && M.diff.level >= 3) {
                    M.diff.level = 0;
                    setupNextLetter(false);
                }
                */
            }
        }

        if (M.goalCloud) {
            M.goalCloud.timer += dt;
            M.goalCloud.x = M.goalCloud.startx + 100 * M.goalCloud.timer / M.goalCloud.maxtime;
            if (M.goalCloud.timer >= M.goalCloud.maxtime && M.allowClick) {
                analytics('cloudclear');

                var gc = M.goalCloud;
                M.goalCloud.click = null;
                M.goalCloud.tween = {
                    x: Draw.getWidth(),
                    time: 1,
                    done: function() {
                        gc.dead = true;
                    },
                };
                M.goalCloud = null;

                // show the goal sprite
                M.goalSprite.layer = M.goalBox.layer;
                M.level.goalvanish = false;
            }
        }
    };

    M.clearMonitorPick = function() {
        for (var i = 0; i < 6; i++)
            M.squares[i].image = 'monitor_square';
    };

    M.clickSquare = function(i) {
        resetHintTimer();
        
        if (!M.allowClick || M.squares[i].letter.dead || M.squares[i].letter.victorycheck)
            return;

        while (M.character && !M.character.dead) {
            M.character.tween.done();
        }

        M.allowClick = false;

        M.squares[i].image = 'monitor_pick';

        analytics({msg: 'pick', letter: M.squares[i].letter.char, box: i});

        if (M.squares[i].letter.char == M.goalLetter) {
            Resource.playAudioList([M.squares[i].letter.char, 'correct_' + randint(15)], 'voice');

            // mark the letter for counting victory
            M.squares[i].letter.victorycheck = true;

            // if this completes the screen, update the difficulty levels
            if (checkForVictory()) {
                var score = .5 + .1 * M.combo;
                M.combo++;
                /*|| M.timespent > 10*/
                if (M.wrongs > 0 || (M.level.goalcloud && !M.goalCloud)) {
                    score = -1/3;
                    M.combo /= 2;
                }
                //if (score > 1) score = 1;
                Difficulty.update(M.squares[i].number, score);
            }

            // move other letters behind the character
            for (var k = 0; k < 6; k++)
                if (k != i)
                    M.squares[k].letter.layer = 1;

            // change the sprite if necessary
            if (M.squares[i].letter.canvas_lit) {
                M.squares[i].letter.canvas = M.squares[i].letter.canvas_lit;
                M.squares[i].letter.source = M.squares[i].letter.source_lit;
            }

            // stars!

            var count = Math.floor(M.diff.level) + 1;
            if (count > 5)
                count = 5;
            for (var k = 0; k < count; k++) {
                var star = Draw.newsprite('star_' + ['red', 'orange', 'yellow', 'green', 'blue', 'purple'][randint(6)]);
                star.layer = 3;
                star.x = M.squares[i].x + M.squares[i].w / 2 - star.w / 2;
                star.y = M.squares[i].y + M.squares[i].h / 2 - star.h / 2;
                star.tween = {
                    vx: randint(-200, 200),
                    vy: -500 + randint(-100, 100),
                    gravity: 981,
                    done: (function(star) {
                        return function() {
                            star.dead = true;
                        };
                    })(star),
                };
            }

            // start correct-letter animation
            var x, y;
            if (M.character && M.character.dead && M.character.image == 'char_' + M.goalLetter && M.character.x < Draw.getWidth() * .8) {
                x = M.character.x;
                y = M.character.y;
            }
            M.character = Draw.newsprite('char_' + M.goalLetter);
            M.character.x = (x || -M.character.w);
            M.character.y = (typeof(y) != 'undefined' ? y : (i >= 3 ? 300 : 0));
            M.character.layer = 2;

            // enter the screen
            M.character.tween = {
                x: M.squares[i].x,
                y: (i >= 3 ? 300 : 0),
                time: 1 * animspeed,
                ease: 'out',
                done: tweendone1,
            };

            // leave the screen with the letter, if victorious: trigger the letters to fall away
            function tweendone1() {
                const clearpad = 100;
                
                M.squares[i].letter.tween = {
                    x: Draw.getWidth() + clearpad,
                    time: 1 * animspeed,
                    ease: 'in',
                };

                M.clearMonitorPick();

                M.character.tween = {
                    x: Draw.getWidth() + clearpad,
                    time: 1 * animspeed,
                    ease: 'in',
                    done: tweendone2,
                };

                if (checkForVictory()) {
                    function loop(k) {
                        var letter = M.squares[k].letter;
                        if (!letter.dead && !letter.tween) {
                            letter.vel = 150;

                            function fall() {
                                letter.tween = {
                                    y: letter.y + letter.vel,
                                    time: .1,
                                    done: fall,
                                };
                                letter.vel += 100;
                            }

                            setTimeout(fall, (k < 3 ? 200 : 0) + randint(200));
                        }
                    }
                    
                    for (var k = 0; k < 6; k++)
                        loop(k);
                }
            }

            // left the screen, if victorious: go to the next letter
            function tweendone2() {
                // move letters back to the right layer
                for (var k = 0; k < 6; k++)
                    M.squares[k].letter.layer = 3;

                M.character.dead = true;
                M.squares[i].letter.dead = true;

                if (checkForVictory()) {
                    // new letter
                    M.goalBox.dead = true;
                    M.goalSprite.dead = true;

                    Difficulty.advancediff();
                    Profile.save();

                    played++;
                    if (played == Difficulty.windowsize)
                        Main.changeScreen(Story);
                    else
                        setupNextLetter();

                } else {
                    // need more letters
                    M.allowClick = true;
                }
            }

            if (!checkForVictory())
                M.allowClick = true;

        } else {
            M.wrongs++;

            Resource.playAudioList([M.squares[i].letter.char, 'incorrect_' + randint(3)], 'voice');

            M.shakeTimer = shakeDuration;
            M.character = null;
        }
    };

    var checkForVictory = function() {
        var okay = true;
        for (var i = 0; i < 6; i++)
            if (M.squares[i].letter.char == M.goalLetter && !M.squares[i].letter.victorycheck)
                okay = false;

        return okay;
    };

    var badWords = 'anal anus ars ass bitch bum but coc cok coon crap cum cunt damn dic dik erect erotic escort fag fuc fuk gook homo jis jiz nig negro orgasm pee penis pis poo porn pus retard sadist sex shit slut suc suk tit vag viagra'.split(/ /g);

    var letterOffsets = {
        0: [1, 3, 4],
        1: [-1, 1, 2, 3, 4],
        2: [-1, 2, 3],
        3: [-3, -2, 1],
        4: [-4, -3, -2, -1, 1],
        5: [-4, -3, -1],
    };

    function badLetters(chars) {
        for (var i = 0; i < 6; i++) {
            for (var w of badWords) {
                if (findWord(chars, '', w, i, ''))
                    return w;
            }
        }
        return null;
    }

    function findWord(chars, sofar, word, i, visited) {
        if (visited.includes(i))
            return false;

        visited += i;
        var c = chars[i].letter.substring(0, 1);
        if (word[0] != c)
            return false;

        sofar += word[0];
        word = word.substr(1);
        if (word.length == 0)
            return true;

        for (var d of letterOffsets[i]) {
            if (findWord(chars, sofar, word, i + d, visited))
                return true;
        }
        return false;
    }

    return M;
})();
