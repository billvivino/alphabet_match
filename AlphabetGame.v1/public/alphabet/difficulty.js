
var Difficulty = function() {
    var M = {};

    M.domain = null;
    M.windowsize = 3;

    M.init = function(domain) {
        M.domain = domain;

        var levelkey = 'levels';
        if (M.domain != 'easy')
            levelkey = 'levels_' + M.domain;
        
        if (Profile.data[levelkey]) {
            M.levels = Profile.data[levelkey];
        } else {
            M.levels = [];
            for (var i = 0; i < 26 * 2; i++)
                M.levels.push(0);
        }
        
        M.window = null;

        M.advancediff();

        Story.resetScene();
    };

    M.atborder = function() {
        return (M.current == 0);
    };

    M.advancediff = function() {
        if (M.window != null) {
            M.current++;
            if (M.current == M.window.length /* || true /**/) {
                M.window = null;
                //return null;
            }
        }

        if (M.window == null) {
            var list = [];
            for (var i = 0; i < 26 - M.windowsize + 1; i++) {
                var total = 0;
                for (var k = 0; k < M.windowsize; k++)
                    total += M.levels[i + k] + M.levels[i + k + 26];
                list.push({score: Math.floor(total / M.windowsize), start: i});
            }
            // sort lowest level first
            list.sort(function(a, b) { return (a.score - b.score) || (a.start - b.start) });

            var m = 1;
            while (m < list.length && list[m].score == list[m-1].score)
                m++;
            m = randint(m);

            var start = list[m].start;
            
            M.window = [];
            // three loops through the window
            for (var k = 0; k < 3; k++)
                for (var i = 0; i < M.windowsize; i++) {
                    var case_ = getcase(start + i);
                    M.window.push(start + i + case_ * 26);
                }

            M.current = 0;
        }
    };
    
    M.getdiff = function() {
        var n = M.window[M.current];
        var level = Math.floor(M.levels[n]);

        return {
            letter: n,
            level: level,
            rawlevel: M.levels[n],
        };
    };

    M.update = function(letter, amount) {
        var old = M.levels[letter];
        M.levels[letter] += amount;
        if (M.levels[letter] < 0)
            M.levels[letter] = 0;
        if (M.levels[letter] > 5.5)
            M.levels[letter] = 5.5;
        analytics({msg: 'diff_update', domain: M.domain, letter: letter, delta: M.levels[letter] - old, newvalue: M.levels[letter]});
    };

    function getcase(letter) {
        // return 0 or 1 based on difficulty level progression
        var lowprob = 0;
        
        if (M.levels[letter] >= 4) {
            if (M.levels[letter + 26] >= 4)
                lowprob = .5;
            else
                lowprob = .75;
        }

        return (Math.random() < lowprob ? 1 : 0);
    };
    
    return M;
}();
