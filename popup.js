var sel = $('select[name=station]');
var ta = $('textarea[name=songs]');
var PORT = null;
var tab_id = null;

function receiveStations(response) {
  stations = response.stations;
  $(sel).find('option').remove();
  $(sel).append($('<option>Choose a station!</option>'));
  for (var i = 0; i < stations.length; i++) {
    if (i == 1) {topStation = stations[i];}
    sel.append($('<option value="' + stations[i]['id'] + '">'+stations[i]['name']+'</option>'));
  }
}

function requestStations() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {msg: "stationList"}, receiveStations);
  });
}

function requestLikes() {
  console.log('request station: ' + $(sel).val());
  PORT.postMessage({station: $(sel).val()});
}

function clearSongs() {
  $(ta).text('');
}

var likeReceiver = {
  receive: function(response) {
    if ('song' in response) {
      likeReceiver.song(response);
    } else if ('songs' in response) {
      likeReceiver.songs(response);
    }
  },
  frmt_song: function(song) {
    return song['name'] + ', ' + song['artist'];
  },
  song: function (response) {
    $(ta).text($(ta).text() + likeReceiver.frmt_song(response.song) + '\n');
  },
  songs: function (response) {
    var val = ""
    for (var i = 0; i < response.songs.length; i++) {
      console.log(response.songs[i]);
      val += response.songs[i]['name'] + ", " + response.songs[i]['artist'] + '\n';
    }
    //$('textarea[name=songs]').text(val);
  }
}

var setupTab = function(tab) {
  tab_id = tab.id;
  PORT = chrome.tabs.connect(tab_id, {name: 'streamSongs'});
  PORT.onMessage.addListener(function (msg) {
    likeReceiver.receive(msg);
  });
};

$(document).ready(function() {
  $('#likes-button').click(requestLikes);
  $('#clear-button').click(clearSongs);
  requestStations();
  chrome.tabs.getSelected(null, setupTab);
});