
checkLoginToken();

/*
Server.call('getanalyticstest', {}, (data) => {
    var $list = $('#session_list');

    var html = [];
    html.push('<p>' + data.sessions.length + ' sessions (from newest to oldest)');
    
    for (var i = data.sessions.length - 1; i >= 0; i--) {
        var s = data.sessions[i];

        var slot = s[0][1].slot;
        var start = s[0][0];
        var dur = s[s.length - 1][0] - s[0][0];

        var maxgap = 0;
        for (var m = 0; m < s.length - 1; m++) {
            var gap = s[m+1][0] - s[m][0];
            if (gap > maxgap)
                maxgap = gap;
        }

        var date = new Date(start * 1000);
        date = date.toLocaleDateString('en-US', {dateStyle: 'short', timeStyle: 'short'});
        
        html.push('<p>&bullet; slot: ' + slot);
        html.push('<br>&bullet; started ' + date);
        html.push('<br>&bullet; duration: ' + (dur / 60).toFixed(1) + ' minutes');
        html.push('<br>&bullet; max gap: ' + (maxgap / 60).toFixed(1) + ' minutes');
        html.push('<br>&bullet; messages: ' + s.length);
    }

    $list.html(html.join(''));
});
*/

Server.call('getsegments', {}, (data) => {
    var $slots = $('#slots');
    $slots.empty();
    $slots.append($('<option/>', {value: ''}).text('(all)'));
    for (var i = 0; i < data.slots.length; i++) {
        var slot = data.slots[i];
        $slots.append($('<option/>', {value: slot.id}).text(slot.name));
    }

    $('#slots').change(() => {
        getgraphs();
    });
});

function getgraphs() {
    var $list = $('#graphs');
    $list.empty();

    var segment = {};
    var slot = $('#slots').val();
    if (slot) segment.slot = parseInt(slot);
    
    Server.call('graphs', {segment: segment}, (data) => {
        for (var i = 0; i < data.graphs.length; i++) {
            var graph = data.graphs[i];
            var $graph = $('<div/>');

            if (graph.html) {
                $graph.html(graph.html);
            } else if (graph.table) {
                var $table = $('<table/>', {'class': 'data'});
                for (var j = 0; j < graph.table.length; j++) {
                    var $row = $('<tr/>');
                    var row = graph.table[j];
                    for (var k = 0; k < row.length; k++) {
                        var $cell;
                        if (j == 0 && graph.header)
                            $cell = $('<th/>');
                        else
                            $cell = $('<td/>');
                        $cell.html(row[k]);
                        $row.append($cell);
                    }
                    $table.append($row);
                }
                $graph.append($table);
            } else {
                $graph.append($('<h2/>').text(graph.title));
                if (graph.desc)
                    $graph.append($('<p/>').text(graph.desc));
                $graph.append($('<img/>', {src: graph.url}));
            }
            
            $list.append($graph);
        }
    });
}

getgraphs();
