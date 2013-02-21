function checkForValidUrl(tabId, changeInfo, tab) {
  // If the letter 'g' is found in the tab's URL...
  //alert('tab.url' + tab.url)
  if (tab.url.indexOf('pandora.com') > -1) {
    // ... show the page action.
    chrome.pageAction.show(tabId);
  }
};
chrome.tabs.onUpdated.addListener(checkForValidUrl);