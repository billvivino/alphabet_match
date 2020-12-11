
var Profile = function() {
    var M = {screenName: 'Profile'};

    var remoteStorage;

    // M.characters = {slot: chr}  // set by Title.queryConfiguration()
    // M.character = chr  // set by selectProfile()
    // use M.setCharacter() if you want to change the current character

    M.init = function() {
        var bg = Draw.newsprite('bg');
        bg.x = -100;
        bg.y = -100;

        var title = Draw.newsprite('title');
        title.scale = .5;
        title.x = 330;
        title.y = 10;

        if (!Config.linked) {
            var linkbtn = Draw.newsprite('link_button');
            linkbtn.x = 950;
            linkbtn.y = 10;
            linkbtn.click = function() {
                Main.changeScreen(Link);
            };
        }

        remoteStorage = false;

        if (Config.profile_mode == 'groups') {
            var groups = [];
            var used = {};
            for (var i = 0; i < Config.slots.length; i++) {
                var slot = Config.slots[i];
                var name = slot.group;
                if (slot.active && !used[name]) {
                    groups.push({name: name, value: name});
                    used[name] = true;
                }
            }
            
            initlist(groups, function(g) {
                var list = [];
                for (var i = 0; i < Config.slots.length; i++) {
                    var slot = Config.slots[i];
                    if (slot.active && slot.group == g)
                        list.push({name: slot.name, value: slot.id});
                }
                initlist(list, function(slotid) {
                    selectProfile(slotid);
                });
            });
            
        } else if (Config.profile_mode == 'list') {
            var list = [];
            for (var i = 0; i < Config.slots.length; i++) {
                var slot = Config.slots[i];
                if (slot.active)
                    list.push({name: slot.name, value: slot.id});
            }
            
            initlist(list, function(slotid) {
                selectProfile(slotid);
            });
        
        } else
            initchars();

        // save session that we just backed out of
        M.save();
    };

    var initchars = function() {
        var glows = [];
        var last = -1;
        function charglow() {
            var i = last;
            while (i == last)
                i = randint(0, glows.length - 1);
            last = i;

            var g = glows[i];
            g.tween = {
                time: .5,
                alpha: 1,
                done: function() { return charglow2(g) },
            };
        }

        function charglow2(g) {
            g.tween = {
                time: .5,
                alpha: 0,
                done: function() {
                    setTimeout(charglow, 500);
                },
            };
        }

        setTimeout(charglow, 0);

        var chars = [
            M.characters['1'],
            M.characters['2'],
            M.characters['3'],
            M.characters['4'],
        ];

        Draw.font = 'bold 56px Century Gothic';
        var x = 50;

        function loop(i) {
            var glow = Draw.newsprite('char_' + chars[i] + '_glow');
            glow.x = x - 25;
            glow.y = 700 - glow.h + 25;
            glow.alpha = 0;
            glows.push(glow);

            var s = Draw.newsprite('char_' + chars[i]);
            s.x = x;
            s.y = 700 - s.h;
            s.eatclick = true;

            var data = Storage.getSmall('profile_' + i);
            var level = 0;
            if (data && data.levels) {
                for (var k = 0; k < data.levels.length; k++)
                    level += Math.min(5, data.levels[k]) / 5; // 0--1
                level = Math.floor(10 * level / data.levels.length);  // 0--10
                if (level > 9)
                    level = 9; // handle level == 10 when maxxed out
            }

            //level = randint(0, 9); // XXX

            Garden.placeLevelPlants('char' + i, x + 125, 800, 100, 0, level);

            x += 250;

            s.click = function() {
                selectProfile(Config.slots[i]);
            };
        }
        
        for (var i = 0; i < chars.length; i++)
            loop(i);
    };

    var listsprites = [];
    
    var initlist = function(options, callback) {
        // options = [{name: str, value: any}]
        // callback(value)
        // names will be shown to the user, the clicked one's value will be passed to the callback.
        remoteStorage = true;

        var page = 0;
        var maxpage = Math.floor((options.length - 1) / 8);
        if (maxpage < 0) maxpage = 0;

        Draw.font = 'bold 56px Century Gothic';

        function boxFunc(i) {
            return function() {
                callback(options[i].value);
            }
        }
        
        function makepage() {
            for (var i = 0; i < listsprites.length; i++)
                listsprites[i].dead = true;
            listsprites = [];
            
            var i = page * 8;
            for (var x = 0; x < 2; x++) {
                for (var y = 0; y < 4; y++) {
                    if (i < options.length) {
                        var box = Draw.newsprite('green_box_extrawide');
                        if (options.length <= 4)
                            box.x = 275;
                        else
                            box.x = x * 550;
                        box.y = 150 + y * (box.h + 10);
                        box.click = boxFunc(i);

                        var text = Draw.newtext(options[i].name);
                        text.x = box.x + box.w / 2 - text.w / 2;
                        text.y = box.y + box.h / 2 - text.h / 2;
                        
                        listsprites.push(box);
                        listsprites.push(text);
                    }
                    
                    i++;
                }
            }

            var arrow;

            if (page > 0) {
                arrow = Draw.newsprite('arrow_left');
                arrow.y = 20;
                arrow.click = function() {
                    page--;
                    makepage();
                };
                listsprites.push(arrow);
            }

            if (page < maxpage) {
                arrow = Draw.newsprite('arrow_right');
                arrow.x = Draw.getWidth() - arrow.w;
                arrow.y = 20;
                arrow.click = function() {
                    page++;
                    makepage();
                };
                listsprites.push(arrow);
            }
        }

        makepage();
    };

    var selectProfile = function(slot) {
        M.slot = slot;
        M.character = getSlotChar(M.slot);

        analytics({msg: 'select', slot: M.slot});

        if (remoteStorage) {
            Server.call('profileLoad', {slot: M.slot}, function(data) {
                M.data = data.data;
                if (M.data && M.data.character)
                    M.character = M.data.character;
                finishLoading();

            }, function(err) {
                alert('There was an error retrieving the profile from the server.');
            });

        } else {
            M.data = Storage.getSmall('profile_' + M.slot);
            finishLoading();
        }
    };

    var finishLoading = function() {
        if (!M.data)
            M.data = {};

        if (M.slot == '4' && Debug.unlockdog) {
            M.data.levels = [];
            for (var k = 0; k < 26 * 2; k++)
                M.data.levels.push(5.5);
        }

        Game.openProfile();

        analytics({msg: 'profile-data', data: M.data});
        
        Main.changeScreen(Domain);
    };

    function getSlotChar(slot) {
        if (!M.characters[slot])
            //M.characters[slot] = ('abcdefghijklmnopqrstuvwxyz')[randint(26)];
            M.characters[slot] = ('cdkq')[randint(4)];
        return M.characters[slot];
    }

    M.setCharacter = function(c) {
        M.characters[M.slot] = c;
        Storage.setSmall('profile_characters', M.characters);
        
        M.character = c;
    };
    
    M.save = function() {
        if (!M.slot)
            return;

        if (Difficulty.domain == 'easy')
            M.data.levels = Difficulty.levels;
        else
            M.data['levels_' + Difficulty.domain] = Difficulty.levels;
        
        M.data.character = M.character;

        if (remoteStorage) {
            var now = Date.now() / 1000;
            Server.call('profileSave', {slot: M.slot, data: M.data, ts: now}, function(data) {
            });

        } else {
            Storage.setSmall('profile_' + M.slot, M.data);
        }
    };

    return M;
}();
