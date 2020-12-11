
// see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

var Draw = (function() {
    var M = {};

    var scrw, scrh;
    var canvas, ctx;
    var camera;

    var allscale = 2;

    var bars;

    M.init = function() {
        bars = {};
        bars.left = {image: 'bars_left'};
        bars.right = {image: 'bars_right'};
        bars.top = {image: 'bars_top'};
        bars.bottom = {image: 'bars_bottom'};
        applysub(bars.left);
        applysub(bars.right);
        applysub(bars.top);
        applysub(bars.bottom);

        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        M.cameraClear();

        window.addEventListener('resize', M.resize);
        M.resize();

        canvas.addEventListener('click', M.click, false);

        window.requestAnimationFrame(M.update);
    };

    M.font = '20px sans serif';

    M.resize = function() {
        scrw = window.innerWidth;
        scrh = window.innerHeight;
        canvas.width = scrw * allscale;
        canvas.height = scrh * allscale;
        console.log('resize', scrw, scrh, canvas.width, canvas.height);

        var root = $(':root')[0];
        root.style.setProperty('--width', scrw);
        root.style.setProperty('--height', scrh);

        M.calculateCamera();
    };

    M.getWidth = function() {
        if (camera.type == 'viewport')
            return camera.width;
        return scrw;
    };

    M.getHeight = function() {
        if (camera.type == 'viewport')
            return camera.height;
        return scrh;
    };

    var lastupdate;

    M.update = function(ts) {
        var dt = (ts - (lastupdate || 0)) / 1000;
        lastupdate = ts;

        // update sprites...
        for (var i = 0; i < M.sprites.length; i++) {
            var sprite = M.sprites[i];

            // set .w and .h if image has been loaded
            if (!sprite.w)
                applysize(sprite);

            if (sprite.tween && !sprite.dead) {
                if (sprite.tween.gravity)
                    tween_gravity(sprite, dt);
                else
                    tween(sprite, dt);
            }

            if (sprite.update && !sprite.dead)
                sprite.update(dt);
        }

        if (M.userUpdate)
            M.userUpdate(dt);

        // remove dead sprites
        for (var i = M.sprites.length - 1; i >= 0; i--) {
            if (M.sprites[i].dead)
                M.sprites.splice(i, 1);
        }

        M.draw();
        window.requestAnimationFrame(M.update);
    };

    var tween = function(sprite, dt) {
        var t = sprite.tween;
        if (!t.time) {
            console.error('no time set for tween on: ' + sprite.image);
            delete sprite.tween;
            return;
        }

        var start = false;
        if (!t.time_elapsed) {
            if (!dt) dt = .001;
            t.time_elapsed = dt;
            start = true;
        } else
            t.time_elapsed += dt;

        var tm = t.time_elapsed / t.time;
        switch (t.ease) {
        case 'in':
            tm = Math.pow(tm, 2);
            break;
        case 'out':
            tm = Math.pow(tm, 1/2);
            break;
        }

        var props = ['x', 'y', 'scale', 'alpha'];

        for (var i = 0; i < props.length; i++) {
            var p = props[i];
            if (typeof(t[p]) !== 'undefined') {
                if (start)
                    t['start_' + p] = sprite[p];
                var startvalue = t['start_' + p];

                if (tm >= 1)
                    sprite[p] = t[p];
                else
                    sprite[p] = startvalue * (1 - tm) + t[p] * tm;
            }
        }

        if (tm >= 1) {
            t.time_elapsed = 0;
            finish_tween(sprite);
        }
    };

    var finish_tween = function(sprite) {
        var t = sprite.tween;
        delete sprite.tween;  // need to delete first, so done() can set a new tween if desired
        if (t.done)
            t.done();
    };

    var tween_gravity = function(sprite, dt) {
        var t = sprite.tween;
        if (typeof(t.vx) === 'undefined')
            t.vx = 0;
        if (typeof(t.vy) === 'undefined')
            t.vy = 0;

        sprite.x += t.vx * dt;

        t.vy += t.gravity * dt;
        sprite.y += t.vy * dt;

        if (sprite.y > M.getHeight())
            finish_tween(sprite);
    };

    M.setUpdate = function(func) {
        M.userUpdate = func;
    };

    M.click = function(event) {
        var x = event.pageX - canvas.offsetLeft;
        var y = event.pageY - canvas.offsetTop;

        x = (x - camera.xoff) / camera.scale;
        y = (y - camera.yoff) / camera.scale;

        // dispatch to sprites
        var hits = [];
        //for (var i = 0; i < M.sprites.length; i++) {
        for (var i = M.sprites.length - 1; i >= 0; i--) {
            var sprite = M.sprites[i];
            var scale = (sprite.scale == null ? 1 : sprite.scale);
            if (sprite.click && sprite.w && x >= sprite.x && x < sprite.x + sprite.w * scale && y >= sprite.y && y < sprite.y + sprite.h * scale) {
                hits.push({sprite: sprite, x: x - sprite.x, y: y - sprite.y});
                if (sprite.eatclick)
                    break;
            }
        }

        // delayed dispatch, so that things like changing screen during click won't create problems
        for (var i = 0; i < hits.length; i++) {
            var hit = hits[i];
            if (!hit.sprite.dead && hit.sprite.click)
                hit.sprite.click(hit.x, hit.y);
        }
    }

    M.cameraClear = function() {
        camera = {
            type: 'none',
        };

        M.calculateCamera();
    };

    M.cameraViewport = function(w, h) {
        camera = {
            type: 'viewport',
            width: w,
            height: h,
        };

        M.calculateCamera();
    };

    // called when the camera is set or the window is resized
    M.calculateCamera = function() {
        var xoff = 0, yoff = 0, scale = 1;

        if (camera.type == 'viewport') {
            var boundby = (camera.width / camera.height > scrw / scrh ? 'width': 'height');
            var vw, vh;
            if (boundby == 'width') {
                vw = scrw;
                vh = scrw * camera.height / camera.width;
                scale = scrw / camera.width;
            } else {
                vw = scrh * camera.width / camera.height;
                vh = scrh;
                scale = scrh / camera.height;
            }

            xoff = (scrw - vw) / 2;
            yoff = (scrh - vh) / 2;
        }

        camera.xoff = xoff;
        camera.yoff = yoff;
        camera.scale = scale;

        var $html = $('#html');
        $html.css('margin-left', xoff);
        $html.css('margin-top', yoff);
        $html.css('width', vw);
        $html.css('height', vh);
    };

    M.draw = function() {
        M.sprites.sort(M.sortSprites);

        //ctx.resetTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(allscale, allscale);
        ctx.clearRect(0, 0, scrw, scrh);

        for (var i = 0; i < M.sprites.length; i++) {
            var sprite = M.sprites[i];
            var image;
            if (sprite.canvas)
                image = sprite.canvas;
            else
                image = Resource.getImage(sprite.image);
            if (!image)
                continue;

            var alpha = (sprite.alpha == null ? 1 : sprite.alpha);
            var scale = (sprite.scale == null ? 1 : sprite.scale);
            var sx = sprite.source.x, sy = sprite.source.y;
            var sw = sprite.source.w;
            var sh = sprite.source.h;
            var x = sprite.x, y = sprite.y, w = sw * scale, h = sh * scale;
            x = x * camera.scale + camera.xoff;
            y = y * camera.scale + camera.yoff;
            w *= camera.scale;
            h *= camera.scale;
            ctx.globalAlpha = alpha;
            ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
        }
        ctx.globalAlpha = 1;

        // black bars (under the fancy borders)
        const pad = 100 * camera.scale;
        ctx.clearRect(0, 0, camera.xoff - pad, scrh); // left
        ctx.clearRect(scrw - camera.xoff + pad, 0, camera.xoff - pad, scrh); // right
        ctx.clearRect(0, 0, scrw, camera.yoff - pad); // top
        ctx.clearRect(0, scrh - camera.yoff + pad, scrw, camera.yoff - pad); // bottom

        // fancy screen borders
        var lr = Resource.getImage('bars_lr');
        if (lr) {
            const over = 100;
            var r = bars.left.source;
            ctx.drawImage(lr, r.x, r.y, r.w, r.h, camera.xoff - (r.w - over) * camera.scale, 0, r.w * camera.scale, r.h * camera.scale);
            r = bars.right.source;
            ctx.drawImage(lr, r.w, r.y, r.w, r.h, camera.xoff + (camera.width - over) * camera.scale, 0, r.w * camera.scale, r.h * camera.scale);
        }

        var tb = Resource.getImage('bars_tb');
        if (tb) {
            const over = 100;
            var r = bars.top.source;
            ctx.drawImage(tb, r.x, r.y, r.w, r.h, 0, camera.yoff - (r.h - over) * camera.scale, r.w * camera.scale, r.h * camera.scale);
            r = bars.bottom.source;
            ctx.drawImage(tb, r.x, r.y, r.w, r.h, 0, scrh - camera.yoff - over * camera.scale, r.w * camera.scale, r.h * camera.scale);
        }

    };

    M.sortSprites = function(a, b) {
        if (a.layer != b.layer)
            return (a.layer < b.layer ? -1 : 1);
        if (a.index != b.index)
            return (a.index < b.index ? -1 : 1);
        return 0;
    };

    M.subs = {};

    M.specsubs = function(image, obj) {
        /*
          image = the image to subsprite from
          obj = {subspritename: [x, y, w, h], ...}

          subsprites share the same namespace as full sheet sprites
         */
        for (var name in obj) {
            var list = obj[name].slice();  // copy
            list.unshift(image);  // add to beginning
            M.subs[name] = list;
        }
    };

    // set sprite.source (and if it's a sheeted sprite, set image to the actual sheet)
    var applysub = function(sprite) {
        var sub = M.subs[sprite.image];
        if (sub) {
            sprite.image = sub[0];
            sprite.source = {x: sub[1], y: sub[2], w: sub[3], h: sub[4]};
        } else {
            sprite.source = {x: 0, y: 0, w: 0, h: 0};
        }
    }

    // set sprite.w and sprite.h (if the image is loaded)
    var applysize = function(sprite) {
        var image = Resource.getImage(sprite.image);
        if (image && image.complete) {
            if (sprite.source) {
                if (sprite.source.w == 0)
                    sprite.source.w = image.width;
                if (sprite.source.h == 0)
                    sprite.source.h = image.height;
                sprite.w = sprite.source.w;
                sprite.h = sprite.source.h;
            } else {
                sprite.w = image.width;
                sprite.h = image.height;
            }
        }
    };

    M.sprites = [];
    M.nextSpriteIndex = 0;

    // for use with newdynamic()
    M.newfreesprite = function(image) {
        var sprite = {
            image: image,
            x: 0,
            y: 0,
        };

        applysub(sprite);
        applysize(sprite);

        sprite.draw = function(sctx, x, y) {
            var sx = sprite.source.x;
            var sy = sprite.source.y;
            var sw = sprite.source.w;
            var sh = sprite.source.h;
            var w = sprite.w;
            var h = sprite.h;
            sctx.drawImage(Resource.getImage(sprite.image), sx, sy, sw, sh, x, y, w, h);
        };

        return sprite;
    };
    
    M.newsprite = function(image) {
        var sprite = {
            image: image,
            x: 0,
            y: 0,
            layer: 0,
            index: M.nextSpriteIndex++,
        };

        applysub(sprite);
        applysize(sprite);

        M.sprites.push(sprite);
        return sprite;
    };

    M.newdynamic = function(create) {
        var sprite = {
            canvas: document.createElement('canvas'),
            x: 0,
            y: 0,
            source: {x: 0, y: 0},
            layer: 0,
            index: M.nextSpriteIndex++,
        };
        
        M.sprites.push(sprite);

        function setsize(w, h) {
            sprite.w = w;
            sprite.h = h;
            sprite.source.w = w;
            sprite.source.h = h;
            sprite.canvas.width = w;
            sprite.canvas.height = h;
        }
        
        var sctx = sprite.canvas.getContext('2d');
        create(sctx, setsize);

        return sprite;
    };

    M.clear = function() {
        for (var i = 0; i < M.sprites.length; i++)
            M.sprites[i].dead = true;

        M.sprites = [];
        M.nextSpriteIndex = 0;

        M.disableHTML();
    };

    M.newtext = function(text, maxwidth, fontsize) {
        var font = M.font;
        if (fontsize)
            font = fontsize + 'px sans serif';  // FIXME this discards the font face

        var sprite = M.newdynamic(function(sctx, setsize) {
            sctx.font = font;

            var textsize = sctx.measureText(text);
            var w = Math.floor(textsize.width + 2);
            var h;
            
            var regex = /(\d+)\s*px/i;
            var px = regex.exec(font);
            if (px)
                h = parseInt(px[1]) + 2;
            else {
                console.error('unable to guess font height from style, using 50: ' + font);
                h = 50;
            }
            setsize(w, h);

            // need to set font again, since the canvas was just resized
            sctx.font = font;
            sctx.textBaseline = 'bottom';
            sctx.fillText(text, 0, h, maxwidth);
        });
        
        return sprite;
    };

    var htmlscreenclass = null;

    M.enableHTML = function() {
        var $html = $('#html');
        if (htmlscreenclass)
            $html.removeClass(htmlscreenclass);
        $html.addClass(CurScreen.name);
        htmlscreenclass = CurScreen.name;
        $html.css('display', 'block');
        return $html;
    };

    M.disableHTML = function() {
        var $html = $('#html');
        $html.css('display', 'none');
        $html.empty();
    };

    return M;
})();
