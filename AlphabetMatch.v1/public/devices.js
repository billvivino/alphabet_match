
checkLoginToken();

$('#link_button').click(() => {
    var code = $('#link_code').val();
    Server.call('linkdevice', {code: code}, (data) => {
        alert('Device linked!');
        $('#link_code').val('');
        window.location.reload();
    }, (err) => {
        alert(err.msg);
    });
});

Server.call('listdevices', {}, (data) => {
    var $div = $('#device_list');
    $div.empty();

    for (var i = 0; i < data.devices.length; i++) {
        let info = data.devices[i];
        
        var $el = $('<p/>');
        
        $el.html(
            '<b>Device ID:</b> ' + info.id
                + '<br><b>Model:</b> ' + htmlsafe(info.model || 'unknown')
                + '<br><b>Platform:</b> ' + htmlsafe(info.platform || 'unknown')
                + '<br><b>UUID:</b> ' + htmlsafe(info.uuid || 'none')
                + '<br>[<a href="#">unlink device</a>]'
        );
        $el.find('a').click(() => {
            Server.call('unlinkdevice', {device: info.id}, () => {
                window.location.reload();
            });
            return false;
        });
        $div.append($el);
    }

    if (data.devices.length == 0)
        $div.append('<p>None.</p>');
});
