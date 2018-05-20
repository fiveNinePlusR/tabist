var extURL = chrome.extension.getURL("tabs.html");

function toggleTabist() {
  chrome.windows.getCurrent({}, function(window) {
    chrome.tabs.query({windowId: window.id}, function(tabs) {
    //check for a tabist tab first
      for(let tab of tabs) {
        if(tab.title == "Tabist"){
					//open that tab
          chrome.tabs.update(tab.id, {active: true});
          return;
        }
      }

			//loop through again to see if there is an active new tab to replace
      for(let tab of tabs) {
        if(tab.title == "New Tab" && tab.active){
          chrome.tabs.update(tab.id, {"url": extURL + "?main=true"});
          return;
        }
      }

      //fallback to making a new tabist tab
      chrome.tabs.create({
        "url": extURL + "?main=true"
        //,"pinned": true // TODO: add pinned option
      });
      return;
    });
  });
}

chrome.browserAction.onClicked.addListener(toggleTabist);

// listen for the keyboard shortcut command
chrome.commands.onCommand.addListener(toggleTabist);
