function receiveStations(response) {
  stations = response.stations;
  var ul = $('#station-list');
  for (var i = 0; i < stations.length; i++) {
    ul.append($('<li>'+stations[i]+'</li>'));
  }
}

function requestStations() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {msg: "stationList"}, receiveStations);
  });
}

function requestLikes() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {msg: "songList"}, receiveLikes);
  })
}

function receiveLikes(likes) {
  
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('station-button').addEventListener('click', requestStations);
  document.getElementById('likes-button').addEventListener('click', requestLikes);
});