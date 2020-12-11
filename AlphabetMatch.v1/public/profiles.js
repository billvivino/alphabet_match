
checkLoginToken();

Server.call('getconfig', {}, (data) => {
    console.log(data);

    var config = data.config;
    var characters = data.characters;

    $('#profile_mode').val(config.profile_mode);
    $('#profile_mode').change(function() {
        Server.call('setprofilemode', {mode: $('#profile_mode').val()}, (data) => {
            window.location.reload();
        });
    });

    var $div = $('<div/>');

    var groups = [''];
    for (var i = 0; i < config.slots.length; i++) {
        var slot = config.slots[i];
        if (groups.indexOf(slot.group) == -1)
            groups.push(slot.group);
    }
    
    for (var i = 0; i < config.slots.length; i++) {
        let slot = config.slots[i];

        var $slot = makeSlotWidget(config, groups, slot);
        
        $div.append($slot);
    }

    var $newbox = $('<div/>', {'class': 'box'});
    var $newstudent = $('<button/>').text('New Student');
    $newstudent.click(() => {
        Server.call('newslot', {}, (data) => {
            var $slot = makeSlotWidget(config, groups, data.newslot);
            $newbox.before($slot);
        });
    });

    $newbox.append($newstudent)
    $div.append($newbox);

    var $container = $('#accounts');
    $container.empty();
    $container.append($div);
});

function makeSlotWidget(config, groups, slot) {
    let $slot = $('<div/>', {'class': 'box'});
    $slot.append('Slot #' + slot.id);

    let $name = $('<input/>').val(slot.name);
    $name.change(() => {
        setSlotName(slot.id, $name.val());
    });

    let $group = null;
    if (config.profile_mode == 'groups') {
        $group = $('<select/>', {'class': 'group_select'});
        for (var g = 0; g < groups.length; g++) {
            var opts = {};
            if (groups[g] == slot.group)
                opts.selected = true;
            $group.append($('<option/>', opts).text(groups[g]));
        }
        $group.append($('<option/>').text('(new group)'));

        let lastgroup = slot.group;
        $group.change(() => {
            let group = $group.val();
            if (group == '(new group)') {
                group = prompt('Group name?');
                if (group == null) {
                    $group.val(lastgroup);
                    return;
                } else {
                    $('.group_select').each((i, el) => {
                        var $el = $(el);
                        $('<option/>').text(group).insertBefore($el.children().last());
                    });
                    $group.val(group);
                    lastgroup = group;
                }
            }
            lastgroup = group;
            setSlotGroup(slot.id, group);
        });
    }
    
    let $active = $('<input/>', {type: 'checkbox', checked: slot.active});
    $active.change(() => {
        var active = $active.prop('checked');
        setSlotActive(slot.id, active);
        if (active)
            $slot.removeClass('inactive');
        else
            $slot.addClass('inactive');
    });
    if (!slot.active)
        $slot.addClass('inactive');
    
    $slot.append('<br>Student: ', $name);
    if ($group)
        $slot.append('<br>Group: ', $group);
    $slot.append('<br>', $('<label/>').append($active).append('active'));

    return $slot;
}

function setSlotName(id, name) {
    Server.call('changeslot', {id: id, name: name}, (data) => {
    });
}

function setSlotGroup(id, group) {
    Server.call('changeslot', {id: id, group: group}, (data) => {
    });
}

function setSlotActive(id, active) {
    Server.call('changeslot', {id: id, active: active}, (data) => {
    });
}

function newSlot($div) {
}
