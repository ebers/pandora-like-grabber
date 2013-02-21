//alert('pandora.js loaded!');
var stationList = function() {
    alert("Station list called");
}
var songList = function() {
    alert("Song list called!");
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "stationList") { stationList(); }
        if(request.msg == "songList") { songList(); }
    }
);