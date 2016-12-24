"use strict";
let Bacon = require("baconjs");
const Utils = require("./lib/utils.js");

const domainSortKey = "domainSort";
var sortByDomainValue = false;
var version = null;
var options = {};

function clickHandler() {
  if (options.closetab) {
    chrome.tabs.getCurrent(tab => {
      chrome.tabs.remove(tab.id);
    });
  }

  chrome.tabs.update(this.tabId, {active: true});
  chrome.windows.update(this.windowId, {focused: true});
  return false;
}

function setVersion() {
  var versionElement = document.getElementById("version");
  if (!version ) {
    var manifest = version || chrome.runtime.getManifest();
    version = version || manifest.version;
  }

  versionElement.innerText = "Tabist (" + version + ")";
}

function setDevStatus() {
  var statusElement = document.getElementById("developmentStatus");

  chrome.management.getSelf(info => {
    if(info.installType == "development"){
      statusElement.innerText = "( " + info.installType + " )";
    }
  });
}

// Returns a link object for a tab with click handlers set
function makeLink(tab) {
  var link = document.createElement("a");
  link.href = "#";
  link.onclick = clickHandler;
  link.tabId = tab.id;
  link.windowId = tab.windowId;

  var text = tab.title || tab.url;
  var audibleText = tab.audible ? "&#x1f508; " : "";
  var favicon = tab.favIconUrl ? "<img src='" + tab.favIconUrl + "' width='24' height='24'/><span>&nbsp;</span>": "";
  link.innerHTML = favicon + audibleText + text;

  return link;
}

// Main update routine
function updateTabList() {
  var start = Date.now();
  var maindiv = document.getElementById("content");
  maindiv.innerHTML = "";

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
  chrome.tabs.query({}, function(alltabs){
    let windowTabs = Utils.sortByDomain(sortByDomainValue, Utils.groupByWindow(alltabs));
    //display a nice sequential number on the tab.
    var windowDisplayNum = 0;
    for(let [ , tabs] of windowTabs) {
      //insert a new window header and change the ul
      ul = document.createElement("ul");
      let windowTitle = document.createElement("h2");
      windowTitle.innerText = "Window " + ++windowDisplayNum;

      maindiv.appendChild(windowTitle);
      maindiv.appendChild(ul);

      for(let tab of tabs) {
        let li = document.createElement("li");
        let link = makeLink(tab);
        li.appendChild(link);
        ul.appendChild(li);
      }
    }

    var tabCountDiv = document.createElement("div");
    var statisticsText = "<h2>Total Windows: " + windowDisplayNum + "</h2>";
    statisticsText += "<h2>Total Tabs: " + alltabs.length + "</h2>";
    statisticsText += "<h2>Average Tabs Per Window: " + (alltabs.length/windowDisplayNum).toFixed(2) + "</h2>";
    tabCountDiv.innerHTML = statisticsText;

    maindiv.appendChild(tabCountDiv);
    let end = Date.now();
    let extime = end - start;
    let execTimeDiv = document.createElement("div");
    execTimeDiv.innerHTML = "<h4>Created In: " + extime + "ms</h4>";

    maindiv.appendChild(execTimeDiv);
    setVersion();
    setDevStatus();
  });
}

// closeTab: Close tab after clicking on a tabist link to navigate to that tab
// pinTab: Pin the tab when opening tabist
// autoRefresh: Refresh the tabist page automatically as events come in
// newtab: Replace your new tab page with tabist (probably not able to do this in firefox)
function getOptions() {
  chrome.storage.local.get(["closeTab", "pinTab", "autoRefresh", "newtab"], res => {
    options.closetab = res.closeTab || (res.closeTab == "undefined"); // default true
    options.pintab = res.pinTab || false;
    options.autorefresh = res.autoRefresh || (res.autoRefresh == "undefined"); // default true
    options.newtab = res.newTab || false;
  });
}

var bus = new Bacon.Bus();

chrome.tabs.onCreated.addListener( () => { bus.push("onCreated"); });
chrome.tabs.onRemoved.addListener( () => {
  window.setTimeout(() => { bus.push("onRemoved Delayed"); }, 2000); // FIXME: needed for firefox until this is resolved https://bugzilla.mozilla.org/show_bug.cgi?id=1291830
  bus.push("onRemoved");
});

//moved inside a window
chrome.tabs.onMoved.addListener( () => { bus.push("onMoved"); });

//moved between windows
chrome.tabs.onAttached.addListener( () => { bus.push("onAttached"); });

chrome.tabs.onUpdated.addListener( (tabId) => {
  chrome.tabs.get(tabId, tab => {
    if(tab.status == "complete" && tab.title != "Tabist"){
      bus.push("onUpdated");
    }
  });
});

var throttledBus = bus.debounce(500);
//subscribe to the debounced bus.
throttledBus.onValue( () => { if (options.autorefresh) { updateTabList(); }});
var groupbyNormalElement = document.getElementById("gb_as_ordered");
var groupbyDomainElement = document.getElementById("gb_domain");

var groupbyNormal = Bacon.fromEvent(groupbyNormalElement, "click");
var groupbyDomain = Bacon.fromEvent(groupbyDomainElement, "click");
var groupbyPressed = Bacon.mergeAll(groupbyNormal, groupbyDomain);

groupbyPressed.onValue( target => {
  let gbdomain = target.currentTarget.id == "gb_domain";
  chrome.storage.local.set({[domainSortKey]: gbdomain});
});

function updateGroupByPreferences() {
  chrome.storage.local.get([domainSortKey], (res) => {
    let value = res[domainSortKey] || false;
    sortByDomainValue = value;
    groupbyNormalElement.checked = !sortByDomainValue;
    groupbyDomainElement.checked = sortByDomainValue;
    updateTabList();
  });
}

var storageChangedBus = new Bacon.Bus();
var storageChangedBusThrottled = storageChangedBus.debounce(1000);
chrome.storage.onChanged.addListener( () => { storageChangedBus.push("Storage Changed"); });

storageChangedBusThrottled.onValue( () => {
  updateGroupByPreferences();
  bus.push("groupByChanged");
});

// basic setup of the page
updateGroupByPreferences();
getOptions();
