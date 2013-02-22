var activeStation = null;
var returnSongs = null;

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
            console.log('length of Pandora_songs for station_id ' + station_id + ' is: ' + Pandora._songs[station_id].length);
        }
    },
    addSong: function(station_id, song, artist, url, liked) {
        if (! station_id in Pandora._songs) {
            return false;
        }
        Pandora._songs[station_id].push({song: song, artist: artist, url: url, liked: liked});
        return true;
    },
    lookupStationID: function(station_div) {
        fireEvent(station_div, 'mouseover');
        var arrow = $(station_div).closest('.stationListItem').find('.inactiveHoverArrow')[0];
        fireEvent(arrow, 'click');
        var dd = $('#station_menu_dd');
        re = /\d+/;
        station_id = re.exec($(dd).html())[0];
        fireEvent($('body').find('.legal')[0], 'click');
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
    songGetter: {
        station_id: null,
        current_idx: 0,
        done: false,
        run: function(station_id) {
            Pandora.songGetter.station_id = station_id;
            Pandora.songGetter.current_idx = 0;
            Pandora.songGetter.done = false;
            Pandora.songGetter.getSongs();
        },
        getUrl: function() {
            url = ['http://www.pandora.com/content/station_track_thumbs?stationId=',
                   '&page=true&posFeedbackStartIndex=', '&posSortAsc=false&posSortBy=date']
            u = url[0] + Pandora.songGetter.station_id + url[1] + Pandora.songGetter.current_idx + url[2];
            return u;
        },
        getSongs: function() {
            while (! Pandora.songGetter.done) {
                url = Pandora.songGetter.getUrl();
                $.ajax({
                    url:    url,
                    success:function(data) {
                                empty_div = $('<div></div>').html(data);
                                lis = empty_div.find('li');
                                console.log('li length: ' + lis.length);
                                for (var i = 0; i < lis.length; i++) {
                                    var li = lis[i];
                                    var date = $(li).find('.col2')[0].innerText;
                                    var artist = $(li).attr('data-artist');
                                    var song = $($(li).find('h3')[0]).find('a')[0].innerText;
                                    var url = '';
                                    Pandora.addSong(Pandora.songGetter.station_id, song, artist, url, date);
                                    re = /([\w-]+)\/([\w-]+)\/([\w-]+)/ // artist, album, song
                                }
                                //Pandora.addSong(Pandora.songGetter.station_id, 'a');
                                Pandora.songGetter.current_idx += lis.length;
                                Pandora.songGetter.done = $(empty_div).find('.show_more').length == 0;
                            },
                    async:  false
                    });
            }
        }
    },
    songs: function(station) {
        Pandora.populateStations();
        if (Pandora._songs[station['id']].length == 0) {
            Pandora.songGetter.run(station['id']);
        }
        return Pandora._songs[station['id']];
    },
    allSongs: function () {
        alltogetherNow = []
        for (key in Pandora._songs) {
            alltogetherNow.concat(Pandora._songs[key]);
        }
        return alltogetherNow;
    }
};

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "stationList") {
            sendResponse({stations: Pandora.stations()});
        } else if(request.msg == "songList") {
            sendResponse({songs: Pandora.songs(request.station)});
        } else if (request.msg == "allSongs") {
            sendResponse({songs: Pandora.allSongs()});
        }
    });

alert('pandora loaded!');