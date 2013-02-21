alert('pandora.js loaded!');


var stationList = function() {
    stationList = [];
    divs = document.getElementsByClassName("stationNameText");
    for (var i = 0; i < divs.length; i++) {
        stationList.push(divs[i].innerText);
    }
    return stationList;
}
var songList = function() {
    return ['song1', 'song2'];
}

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "stationList") { stations = stationList(); sendResponse({stations: stations}); }
        if(request.msg == "songList") { songs = songList(); sendResponse({songs: songs}); }
    }
);