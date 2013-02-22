var PORT = null;

function fireEvent(element, event) {
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent(event, true, true);
    return !element.dispatchEvent(evt);
};

var Pandora = {
    _stations: [],
    _songs: {},
    addStation: function(station_name, station_id) {
        Pandora._stations.push({name: station_name, id: station_id});
        if (!(station_id in Pandora._songs)) {
            Pandora._songs[station_id] = [];
        }
    },
    addSong: function(station_id, song_name, artist, url, liked) {
        if (! station_id in Pandora._songs) {
            return false;
        }
        var song = {name: song_name, artist: artist, url: url, liked: liked};
        Pandora._songs[station_id].push(song);
        return song;
    },
    lookupStationID: function(station_div) {
        fireEvent(station_div, 'mouseover');
        var arrow = $(station_div).closest('.stationListItem').find('.inactiveHoverArrow')[0];
        fireEvent(arrow, 'click');
        var dd = $('#station_menu_dd');
        station_id = /\d+/.exec($(dd).html())[0];
        fireEvent($('body').find('.legal')[0], 'click'); // click away from the popups
        return station_id;
    },  
    stations: function() {
        if (Pandora._stations.length == 0) {
            Pandora.populateStations();
        }
        return Pandora._stations;
    },
    populateStations: function() {
        if (Pandora._stations.length == 0) {
            divs = document.getElementsByClassName("stationNameText");
            for (var i = 0; i < divs.length; i++) {
                var name = divs[i].innerText;
                var id = Pandora.lookupStationID(divs[i]);
                Pandora.addStation(name, id);
            }
        }
    },
    songGetter: function(station_id, async, updates) {
        var current_idx = 0;
        var done = false;
        var parseMessage = function(data) {
            console.log('Parse Message!');
            var div = $('<div></div>').html(data);
            lis = div.find('li');
            console.log('lis length: ' + lis.length);
            for (var i = 0; i < lis.length; i++) {
                var li = lis[i];
                var date = $(li).find('.col2')[0].innerText;
                var artist = $(li).attr('data-artist');
                var song_name = $($(li).find('h3')[0]).find('a')[0].innerText;
                var url = '';
                var song = Pandora.addSong(station_id, song_name, artist, url, date);
                if (updates) {
                    console.log('sending a message!');
                    PORT.postMessage({song: song});
                } else {
                    console.log('not sending a message');
                }
                //re = /([\w-]+)\/([\w-]+)\/([\w-]+)/ // artist, album, song
            }
            current_idx += lis.length;
            done = $(div).find('.show_more').length == 0;
        };
        var getUrl = function() {
            var url = ['http://www.pandora.com/content/station_track_thumbs?stationId=',
                   '&page=true&posFeedbackStartIndex=', '&posSortAsc=false&posSortBy=date']
            var u = url[0] + station_id + url[1] + current_idx + url[2];
            return u;
        };
        var asyncContinue = function() {
            console.log('asyncContinue');
            while (! done) {
                $.ajax({url: getUrl(), success: parseMessage, async: false});
            }
        };
        if (async) {
            console.log('async!');
            $.ajax({url: getUrl(), success: function(data) {parseMessage(data); asyncContinue();}});
        } else {
            console.log('non async!');
            asyncContinue();
        }
    },
    songs: function(station_id, async, updates) {
        Pandora.populateStations();
        if (Pandora._songs[station_id].length == 0) {
            Pandora.songGetter.run(station_id, async, updates);
        }
        return Pandora._songs[station_id];
    },
    allSongs: function () {
        alltogetherNow = []
        for (key in Pandora._songs) {
            alltogetherNow.concat(Pandora._songs[key]);
        }
        return alltogetherNow;
    }
};

chrome.extension.onConnect.addListener(
    function(prt) {
        PORT = prt;
        PORT.onMessage.addListener(function(msg) {
            console.log('received song request for ' + msg.station);
            //Pandora.songs(msg.station, true, true);
            Pandora.songGetter(msg.station, true, true);
        });
    }
);

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "stationList") {
            console.log('sending stationList');
            sendResponse({stations: Pandora.stations()});
        } else if(request.msg == "songList") {
            //var port = chrome.extension.connect({name: "streamSongs"});
            //sendResponse({songs: Pandora.songs(request.station, port.postMessage)});
        } else if (request.msg == "allSongs") {
            sendResponse({songs: Pandora.allSongs()});
        }
    });

console.log("pandora.js loaded");