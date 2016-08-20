
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
  var start = Date.now();
  var body = document.getElementById("body");
  var maindiv = document.getElementById("content");
  maindiv.innerHTML = "";

  var currentWindow = null;
  var ul = null;

  //loop through the audible tabs
  chrome.tabs.query({audible: true}, function(tabs){
    if (tabs.length > 0){
      var AudibleTitle = document.createElement("h2");
      AudibleTitle.innerText = "Audible Tabs";
      maindiv.appendChild(AudibleTitle);
      ul = document.createElement("ul");
      maindiv.appendChild(ul);

      for(let tab of tabs){
        var link = makeLink(tab);
        var li = document.createElement("li");

        li.appendChild(link);
        ul.appendChild(li); 
      }
    }
  });

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

    maindiv.appendChild(tabCountDiv);
    let end = Date.now();
    let extime = end - start;
    let execTimeDiv = document.createElement("div");
    execTimeDiv.innerHTML = "<h4>Created In: " + extime + "ms</h4>";

    maindiv.appendChild(execTimeDiv);
  }); 
};

chrome.tabs.onCreated.addListener(() => { updateTabList(); });
chrome.tabs.onRemoved.addListener(() => { 
  window.setTimeout(updateTabList, 2000); // FIXME: needed for firefox until this is resolved https://bugzilla.mozilla.org/show_bug.cgi?id=1291830 
  updateTabList(); 
});

//moved inside a window
chrome.tabs.onMoved.addListener( () => { updateTabList(); });

//moved between windows
chrome.tabs.onAttached.addListener( () => { updateTabList(); });

chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
  chrome.tabs.get(tabId, tab => {
    if(tab.status == "complete"){
      updateTabList();
    } 
  });
});

setVersion();
updateTabList();