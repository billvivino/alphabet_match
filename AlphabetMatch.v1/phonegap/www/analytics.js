
window.Analytics = function() {
    var M = {};

    M.load = function() {
        var saved = Storage.getSmall('analytics');
        if (saved) {
            M.outgoing = saved.outgoing;
            M.nextid = saved.nextid;
        } else {
            M.outgoing = [];
            M.nextid = 1;
        }
    };
    
    M.record = function(data, _) {
        if (_ != null)
            throw new Error('Analytics.record() takes only one argument');
        if (typeof(data) !== 'object')
            data = {msg: data};
        else if (!data.hasOwnProperty('msg'))
            console.warn('analytics message missing msg:', data);

        if (data.hasOwnProperty('msgid') || data.hasOwnProperty('ts') || data.hasOwnProperty('screen'))
            console.warn('analytics message already has msgid, ts, or screen:', data);
        
        data.msgid = M.nextid;
        M.nextid++;
        
        data.ts = Date.now() / 1000;
        
        if (CurScreen)
            data.screen = CurScreen.screenName;
        else
            data.screen = null;
        
        M.outgoing.push(data);
        console.log('analytics', data); // XXX

        savePending();
    };

    M.send = function() {
        if (M.outgoing.length == 0)
            return;
        
        var data = {
            events: M.outgoing,
        };
        
        Server.call('analytics', data, function(r) {
            eatData(r.upto_id);
        });
    };

    var eatData = function(upto_id) {
        for (var i = M.outgoing.length - 1; i >= 0; i--) {
            var data = M.outgoing[i];
            if (data.msgid <= upto_id) {
                // remove everything up to and including this item
                M.outgoing.splice(0, i + 1);
                break;
            }
        }

        savePending();
    };

    var savePending = function() {
        Storage.setSmall('analytics', {
            outgoing: M.outgoing,
            nextid: M.nextid,
        });
    };
    
    return M;
}();

// global alias
analytics = Analytics.record;
