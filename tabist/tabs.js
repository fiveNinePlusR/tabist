
function clickHandler(){
  chrome.tabs.update(this.tabId, {active: true}); 
  chrome.windows.update(this.windowId, {focused: true});
  return false;
}

function setVersion(){
  var version = document.getElementById("version");
  var manifest = chrome.runtime.getManifest();
  version.innerText = "Tabist (" + manifest.version + ")";
}

function makeLink(tab){
  var link = document.createElement("a");
  link.href = "#"; 
  link.onclick = clickHandler;
  link.tabId = tab.id;
  link.windowId = tab.windowId;

  var text = tab.title || tab.url;
  var audibleText = tab.audible ? "&#x1f508; " : "";
  link.innerHTML = audibleText + text;

  return link;
}

function updateTabList(){
  var body = document.getElementById("body");
  var maindiv = document.getElementById("content");
  maindiv.innerHTML = "";

  var currentWindow = null;
  var ul = null;
  //loop through the tabs and group them by windows for display
  chrome.tabs.query({}, function(tabs){
    //display a nice sequential number on the tab.
    var windowDisplayNum = 1;
    for(var i = 0, len = tabs.length; i < len; i++){
      var li = document.createElement("li");

      var isNewWindow = !(currentWindow === tabs[i].windowId);
      if(isNewWindow){
        //insert a new window header and change the ul
        currentWindow = tabs[i].windowId;

        ul = document.createElement("ul")

        var windowTitle = document.createElement("h2");
        windowTitle.innerText = "Window " + windowDisplayNum++;

        maindiv.appendChild(windowTitle);
        maindiv.appendChild(ul)
      } 


      var link = makeLink(tabs[i]);
      li.appendChild(link);
      ul.appendChild(li);
    }

    var tabCountDiv = document.createElement("div");
    var statisticsText = "<h2>Total Windows: " + --windowDisplayNum + "</h2>";
    statisticsText += "<h2>Total Tabs: " + tabs.length + "</h2>";
    statisticsText += "<h2>Average Tabs Per Window: " + (tabs.length/windowDisplayNum).toFixed(2) + "</h2>";
    tabCountDiv.innerHTML = statisticsText;

    maindiv.appendChild(tabCountDiv)
  }); 
};




updateTabList();
setInterval(updateTabList, 3000);
// where to go to possibly fix the tab title bug when there are tabs that have been unloaded
// http://searchfox.org/mozilla-central/source/browser/components/extensions/ext-utils.js#386
setVersion();