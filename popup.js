var topStation = null;

function receiveStations(response) {
  stations = response.stations;
  var ul = $('#station-list');
  for (var i = 0; i < stations.length; i++) {
    if (i == 1) {topStation = stations[i];}
    ul.append($('<li value="' + stations[i]['id'] + '">'+stations[i]['name']+'</li>'));
  }
}

function requestStations() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {msg: "stationList"}, receiveStations);
  });
}

function requestLikes() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {msg: "songList", station: topStation}, receiveLikes);
  })
}

function receiveLikes(request) {
  for (var i = 0; i < request.songs.length; i++) {
    console.log(request.songs[i]);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('station-button').addEventListener('click', requestStations);
  document.getElementById('likes-button').addEventListener('click', requestLikes);
});