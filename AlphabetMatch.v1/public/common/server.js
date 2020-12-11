
var Server = function() {
    var M = {};

    var setvalues = {};

    M.setvalue = function(key, value) {
        setvalues[key] = value;
    };

    M.clearvalue = function(key) {
        delete setvalues[key];
    };
    
    M.call = function(cmd, data, callback, failback) {
        var keys = Object.keys(setvalues);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            data[k] = setvalues[k];
        }
        
        //console.log('sending', data);
        $.ajax({
            type: 'POST',
            url: serverAddress + '/' + cmd,
            data: JSON.stringify(data),
            dataType: 'json',
            
            success: function(data) {
                if (data.error) {
                    if (failback)
                        failback(data);
                    else
                        console.error(data.msg, data);
                } else
                    callback(data);
            },

            error: function(xhr, status, err) {
                if (failback)
                    failback({
                        error: 'ajax',
                        msg: 'Server communication failed.',
                        xhr: xhr,
                        status: status,
                        errobj: err,
                    });
                else
                    console.error('Server.call() failed without error handler');
            },
        });
    };

    return M;
}();
