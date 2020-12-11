
var Resource = (function() {
    var M = {};

    var loadwarning = {};
    var doneload = {};
    var images = {};
    
    var totalCount = 0;
    var loadedCount = 0;

    M.specImage = function(name, path) {
        images[name] = {
            path: path,
            image: null,
        };
    };

    M.specImages = function(obj) {
        for (var name in obj)
            M.specImage(name, obj[name]);
    };

    M.getImage = function(name) {
        var obj = images[name];
        if (!obj) {
            if (!loadwarning['image:' + name]) {
                console.error('No image spec for: ' + name);
                loadwarning['image:' + name] = true;
            }
            return null;
        }
        if (obj.image == null) {
            obj.image = new Image();
            obj.image.addEventListener('load', function() {
                loadedCount++;
                doneload[obj.image] = true;
            }, false);
            obj.image.src = obj.path;
            totalCount++;
        }
        if (!doneload[obj.image])
            return null;
        return obj.image;
    };

    M.loadAllImages = function() {
        var count = 0;
        for (var name in images) {
            if (!images[name].image) {
                M.getImage(name);
                count++;
            }
        }
        return count;
    };

    M.loadAllAudio = function() {
        var count = 0;
        for (var name in audios) {
            if (!audios[name].audio) {
                M.getAudio(name);
                count++;
            }
        }
        return count;
    };

    M.setVolume = function(level) {
        for (var name in audios) {
            if (audios[name].audio)
                audios[name].audio.volume = level;
        }
    };
    
    M.loadProgress = function() {
        if (totalCount == 0)
            return 1;
        return loadedCount / totalCount;
    };

    var audios = {};
    
    M.specAudio = function(name, path) {
        audios[name] = {
            path: path,
            audio: null,
        };
    };

    M.specAudios = function(obj) {
        for (var name in obj)
            M.specAudio(name, obj[name]);
    };

    M.getAudio = function(name) {
        var obj = audios[name];
        if (!obj) {
            if (!loadwarning['audio:' + name]) {
                console.error('No audio spec for: ' + name);
                loadwarning['audio:' + name] = true;
            }
            return null;
        }
        if (obj.audio == null) {
            obj.audio = new Audio(obj.path);
            obj.audio.addEventListener('canplaythrough', function() {
                loadedCount++;
                doneload[obj.audio] = true;
            }, false);
            totalCount++;
        }
        return obj.audio;
    };

    var channels = {};

    // TODO M.stopAudio()
    
    M.playAudio = function(name, channel) {
        if (Debug.disablesound)
            return;
        
        var audio = M.getAudio(name);
        if (audio) {
            if (channel) {
                var old = channels[channel];
                if (old && !old.ended) {
                    old.pause();
                    old.currentTime = 0;
                    if (old.removePlaynext)
                        old.removePlaynext();
                }
                channels[channel] = audio;
            }

            audio.play(); /*.catch(function(err) {
                console.error(err);
            });*/
        }
    };

    M.playAudioList = function(list, channel) {
        if (Debug.disablesound)
            return;
        
        var i;
        var audios = [];
        
        for (i = 0; i < list.length; i++)
            audios.push(M.getAudio(list[i]));
        
        i = 0;
        
        function playnext() {
            if (i > 0) {
                audios[i - 1].removeEventListener('ended', playnext, false);
            }
            if (i < list.length) {
                audios[i].addEventListener('ended', playnext, false);
                audios[i].removePlaynext = function(a) {
                    return function() {
                        a.removeEventListener('ended', playnext, false);
                    };
                }(audios[i]);
                M.playAudio(list[i], channel);
            }
            i++;
        }

        playnext();
    };

    M.loadFonts = function() {
        // FIXME add a spec call for the fonts instead of baking them here

        if (document.fonts) {
            totalCount++;
            document.fonts.load('10pt "Century Gothic"').then(function() { loadedCount++; });
            return;
        }

        var f = new FontFace('Century Gothic', "url('fonts/GOTHIC.TTF')");
        totalCount++;
        f.load().then(function() {
            loadedCount++;
        });
    };

    return M;
})();
