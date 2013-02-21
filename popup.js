function requestStations() {
  alert('requestStations() called');
  chrome.extension.sendRequest({ msg: "stationList" });
  alert('requestStations() attempted to sendRequest()');
}

function requestLikes() {
  chrome.extension.sendRequest({ msg: "songList" });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('station-button').addEventListener('click', requestStations);
  document.getElementById('likes-button').addEventListener('click', requestLikes);
});