
var Garden = (function() {
    var M = {screenName: 'Garden'};

    var crops;
    var window;
    var windowpos;
    var pass;

    var updateBail;  // used to stop the updateWindowSprites() async calls
    var readytogo;

    M.init = function() {
        var bg = Draw.newsprite('garden');
        bg.x = -100;
        bg.y = -100;

        const gridw = 140;
        const gridx = 130;
        const gridh = 140;
        const gridy = 270;
        const staggerx = -32;
        const staggery = 13;

        var chr = null;

        function makeCharSprite() {
            if (chr)
                chr.dead = true;
            
            chr = Draw.newsprite('char_' + Profile.character);
            chr.scale = .5;
            chr.x = 850;
            chr.y = 250 - chr.h * chr.scale;

            /*
            chr.click = function() {
                // change to random other char
                var good = false;
                var count = 0;
                var c;
                while (!good && count < 100) {
                    c = ('abcdefghijklmnopqrstuvwxyz')[randint(26)];
                    good = true;
                    count++;
                    
                    if (c == Profile.character)
                        good = false;

                    if (Config.profile_mode == 'chars') {
                        if (c == Profile.characters['1']) good = false;
                        if (c == Profile.characters['2']) good = false;
                        if (c == Profile.characters['3']) good = false;
                        if (c == Profile.characters['4']) good = false;
                    }
                }
                
                Profile.setCharacter(c);
                makeCharSprite();
            };
            */
        }
        
        makeCharSprite();
        
        crops = [];
        for (var i = 0; i < 26; i++) {
            var col = i % 7;
            var row = Math.floor(i / 7);
            
            var level = Math.floor(Difficulty.levels[i]);
            if (level >= 5) {
                level = 5 + Math.floor(Difficulty.levels[i + 26]);
                if (level >= 9)
                    level = 9;
            }

            var crop = {};
            crop.x = gridx + (row * staggerx + col * gridw);
            crop.y = gridy + (row * gridh + col * staggery);
            crop.level = level;

            M.placeLevelPlants('garden' + i, crop.x, crop.y, 60, 30, level);
            
            crops.push(crop);
        }

        var stop = Draw.newsprite('stop_sign');
        stop.x = 20;
        stop.y = 20;
        stop.click = function() {
            analytics('backout');
            clearWindowSprites();
            updateBail = true;
            Main.changeScreen(Profile);
        };

        var go = Draw.newsprite('arrow_right');
        go.x = 950;
        go.y = 675;
        go.click = function() {
            if (!readytogo)
                markReady();
            else
                Main.changeScreen(Game);
        };

        pass = 0;
        window = [];
        windowpos = 0;
        readytogo = false;
        updateBail = false;
        updateWindowSprites();
    };

    M.placePlant = function(spec) {
        var dirt = Draw.newsprite('dirt_' + spec.dirt_type);
        dirt.x = spec.x - dirt.w / 2;
        dirt.y = spec.y - dirt.h;

        var stem = null;
        if (spec.stem_size == 0) {
            stem = Draw.newsprite('tiny_' + spec.stem_number);
            stem.x = dirt.x + dirt.w / 2 - stem.w / 2;
            stem.y = dirt.y + dirt.h * .666 - stem.h * .9;
            
        } else if (spec.stem_size == 1) {
            stem = Draw.newsprite('short_' + spec.stem_number);
            stem.x = dirt.x + dirt.w / 2 - stem.w / 2;
            stem.y = dirt.y + dirt.h * .666 - stem.h * 3/4;

        } else if (spec.stem_size == 2) {
            stem = Draw.newsprite('tall_' + spec.stem_number);
            stem.x = dirt.x + dirt.w / 2 - stem.w / 2;
            stem.y = dirt.y + dirt.h * .666 - stem.h * 5/6;
        }

        var flower = null;
        if (stem && spec.flower_type) {
            flower = Draw.newsprite('flower_' + spec.flower_type);
            flower.x = stem.x + stem.w / 2 - flower.w / 2;
            flower.y = stem.y + stem.h * (spec.flower_type.includes('large') ? 1/3 : 3/8) - flower.h / 2;
        }

        return {
            dirt: dirt,
            stem: stem,
            flower: flower,
        };
    };

    M.placeLevelPlants = function(spot, x, y, dx, dy, level) {
        if (level < 5) {
            var plant = {
                x: x,
                y: y,
            };

            if (level == 0) {
                plant.stem_size = 0;
            } else if (level > 0 && level < 4) {
                plant.stem_size = 1;
            } else if (level >= 4) {
                plant.stem_size = 1;
                plant.flower_type = true;
            }

            getCachedPlantInfo(spot + '_small', plant);
            Garden.placePlant(plant);
            
        } else {
            var plant = {
                x: x - dx / 2,
                y: y - dy / 2,
                stem_size: 1,
                flower_type: true,
            };

            getCachedPlantInfo(spot + '_small', plant);
            Garden.placePlant(plant);

            plant = {
                x: x + dx / 2,
                y: y + dy / 2,
            };
            
            if (level == 5) {
                plant.stem_size = 0;
            } else if (level > 5 && level < 7) {
                plant.stem_size = 1;
            } else if (level >= 7 && level < 9) {
                plant.stem_size = 2;
            } else if (level >= 9) {
                plant.stem_size = 2;
                plant.flower_type = true;
            }

            getCachedPlantInfo(spot + '_large', plant);
            Garden.placePlant(plant);
        }
    };

    var plantCache = {};

    function getCachedPlantInfo(name, plant) {
        if (plantCache[name]) {
            var c = plantCache[name];
            if (plant.stem_size == c.stem_size && !!(plant.flower_type) == !!(c.flower_type)) {
                plant.dirt_type = c.dirt_type;
                plant.stem_number = c.stem_number;
                plant.flower_type = c.flower_type;
                return;
            }
        }
        
        plant.dirt_type = 'ab'[randint(0, 1)];

        if (plant.stem_size == 1)
            plant.stem_number = 'ab'[randint(0, 1)] + randint(1, 4);
        else
            plant.stem_number = randint(1, 4);

        if (plant.flower_type) {
            if (plant.stem_size != 2)
                plant.flower_type = 'small' + randint(1, 9);
            else
                plant.flower_type = 'large' + randint(1, 5);
        }

        plantCache[name] = {
            dirt_type: plant.dirt_type,
            stem_number: plant.stem_number,
            flower_type: plant.flower_type,
        };
    }

    function clearWindowSprites() {
        for (var i = 0; i < window.length; i++)
            window[i].dead = true;
        window = [];
    }
    
    function updateWindowSprites() {
        if (updateBail)
            return;
        
        var goal = Difficulty.getdiff().letter;

        clearWindowSprites();
        
        for (var i = windowpos; i < windowpos + Difficulty.windowsize; i++) {
            var n = i % 26;
            var crop = crops[n];
            
            var box = Draw.newsprite('green_box');
            var letter = Draw.newsprite(Alphabet[n]);
            var lower = null;
            if (crop.level > 5)
                lower = Draw.newsprite(Alphabet[n] + '_lower');
            
            letter.x = crop.x;
            letter.y = crop.y - letter.h / 2;
            letter.scale = .75;
            window.push(letter);

            if (lower) {
                lower.x = letter.x + 60;
                lower.y = letter.y;
                lower.scale = .75;
                window.push(lower);
            }
            
            if (!lower) {
                box.x = letter.x - 15;
                box.y = letter.y - 15;
                box.scale = .75;
            } else {
                box.x = letter.x - 5;
                box.y = letter.y - 30;
                box.scale = 1;
            }
            window.push(box);
        }

        if (windowpos < 26 + goal) {
            windowpos++;
            setTimeout(updateWindowSprites, (windowpos < 26 ? 50 : 100));
        } else
            readytogo = true;
    }

    function markReady() {
        windowpos = 26 + Difficulty.getdiff().letter;
        updateWindowSprites();
    }
    
    return M;
})();
