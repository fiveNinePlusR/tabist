
function clickHandler(){
  chrome.tabs.update(this.tabId, {active:true}); 
  chrome.windows.update(this.windowId, {focused: true});
  return false;
}

function updateTabList(){
  var body = document.getElementById("body");
  document.getElementById("content").remove();
  var maindiv = document.createElement("div");
  maindiv.id = "content";
  body.appendChild(maindiv);

  var currentWindow = null;
  var ul = null;
  //loop through the tabs and group them by windows for display
  chrome.tabs.query({}, function(tabs){
    //display a nice sequential number on the tab.
    var windowDisplayNum = 1;
    for(var i = 0, len = tabs.length; i < len; i++){
      var li = document.createElement("li");
      var link = document.createElement("a");

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

      link.href = "#"; 
      link.onclick = clickHandler;
      link.tabId = tabs[i].id;
      link.windowId = tabs[i].windowId;

      var text = tabs[i].title || tabs[i].url;
      var audibleText = tabs[i].audible ? "(Audible) " : "";
      link.innerText = audibleText + text;


      li.appendChild(link)
      ul.appendChild(li);
    }
  }); 
};




updateTabList();
setInterval(updateTabList, 3000);
  // where to go to possibly fix the tab title bug when there are tabs that have been unloaded
  // http://searchfox.org/mozilla-central/source/browser/components/extensions/ext-utils.js#386
