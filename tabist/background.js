function openMyPage() {
   chrome.tabs.create({
     "url": chrome.extension.getURL("tabs.html")
   });
}

chrome.browserAction.onClicked.addListener(openMyPage);
 
