// drag n drop stuff
// other options https://news.ycombinator.com/item?id=15368104
// https://github.com/Shopify/draggable
// http://react-dnd.github.io/react-dnd/
// https://bevacqua.github.io/dragula/ <- might be the best one.

"use strict";
let Bacon = require("baconjs");
const Utils = require("./lib/utils.js");

const KEYS = {
  GROUP: {
    DOMAIN: "domainGroup",
    WINDOW: "windowGroup"
  },
  SORT: {
    NATURAL: "naturalSort",
    REVERSE: "reverseSort",
    MRU: "mruSort"
  }
};

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

// ======================================
// Main update routine
// ======================================
function updateTabList() {
  var start = Date.now();
  var tabList = document.createElement("div");

  var ul = null;

  //loop through the audible tabs
  chrome.tabs.query({}, function(tabs){
    let audibleTabs = tabs.filter(tab => tab.audible);

    if (audibleTabs.length > 0) {
      let audibleElement = Utils.createAudibleElement(audibleTabs);
      tabList.appendChild(audibleElement);
    }

    // //loop through the tabs and group them by windows for display
    let sortType = groupbyDomainElement.checked ? "domain": "window";
    let groups = Utils.groupTabs(tabs, sortType);
    let windowTabs = Utils.sortByDomain(sortByDomainValue, groups);

    //display a nice sequential number on the tab.
    var windowDisplayNum = 0;
    for(let [domain, tabs] of windowTabs) {
      windowDisplayNum++;
      //insert a new window header and change the ul
      ul = document.createElement("ul");
      let windowTitle = document.createElement("h2");
      if (sortType == "domain") {
        let domainName = domain == "Misc" ? "Misc." : new URL(tabs[0].url).hostname;
        windowTitle.innerText = domainName.replace("www.", "");
      } else {
        windowTitle.innerText = "Window " + windowDisplayNum;
      }

      tabList.appendChild(windowTitle);
      tabList.appendChild(ul);

      for(let tab of tabs) {
        let li = document.createElement("li");
        let link = Utils.makeLink(tab, clickHandler);
        li.appendChild(link);
        ul.appendChild(li);
      }
    }

    var tabCountDiv = document.createElement("div");
    var statisticsText = "<h2>Total Windows: " + windowDisplayNum + "</h2>";
    statisticsText += "<h2>Total Tabs: " + tabs.length + "</h2>";
    statisticsText += "<h2>Average Tabs Per Window: " + (tabs.length/windowDisplayNum).toFixed(2) + "</h2>";
    tabCountDiv.innerHTML = statisticsText;

    tabList.appendChild(tabCountDiv);
    let end = Date.now();
    let extime = end - start;
    let execTimeDiv = document.createElement("div");
    execTimeDiv.innerHTML = "<h4>Created In: " + extime + "ms</h4>";

    tabList.appendChild(execTimeDiv);
    setVersion();
    setDevStatus();

    var maindiv = document.getElementById("content");
    maindiv.innerHTML = "";
    maindiv.appendChild(tabList);
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
var groupbyNormalElement = document.getElementById("gb_window");
var groupbyDomainElement = document.getElementById("gb_domain");

var groupbyNormal = Bacon.fromEvent(groupbyNormalElement, "click");
var groupbyDomain = Bacon.fromEvent(groupbyDomainElement, "click");
var groupbyPressed = Bacon.mergeAll(groupbyNormal, groupbyDomain);

groupbyPressed.onValue( target => {
  let gbdomain = target.currentTarget.id == "gb_domain";
  chrome.storage.local.set({[KEYS.GROUP.DOMAIN]: gbdomain});
});

function updateGroupByPreferences() {
  chrome.storage.local.get([KEYS.GROUP.DOMAIN], (res) => {
    let value = res[KEYS.GROUP.DOMAIN] || false;
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

var refreshButton = document.getElementById("refresh_link");
refreshButton.addEventListener('click', () => { updateTabList(); }, false);

var optionsButton = document.getElementById("display_options_link");
optionsButton.addEventListener('click', () => { hideShowOptionsPanel(); }, false);

function hideShowOptionsPanel() {
  var optionsPanel = document.getElementById("controls");
  // console.log(optionsPanel);
  optionsPanel.hidden = !optionsPanel.hidden;
  optionsButton.innerText = optionsPanel.hidden ? "Show Options" : "Hide Options";
};

// basic setup of the page
updateGroupByPreferences();
getOptions();
hideShowOptionsPanel();

