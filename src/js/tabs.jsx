"use strict";
import React from 'react';
import ReactDOM from 'react-dom';
import Bacon from "baconjs";
import Utils from "./lib/utils.js";

// import Menu from "./components/Menu.jsx";
import WindowCollection from "./components/WindowCollection.jsx";


// drag n drop stuff
// other options https://news.ycombinator.com/item?id=15368104
// https://github.com/Shopify/draggable
// http://react-dnd.github.io/react-dnd/
// https://bevacqua.github.io/dragula/ <- might be the best one.
// positioning http://tether.io/


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

// ======================================
// Main update routine
// ======================================
function updateTabList() {
  let tabs = getTabs();
  let opts = getOptions();
  Promise.all([tabs, opts]).then(([{windowTabs, audibleTabs, windowcount, tabcount, start, end}, options]) => {
    let window = (<WindowCollection
                  windowdata={windowTabs}
                  audibleTabs={audibleTabs}
                  windowcount={windowcount}
                  tabcount={tabcount}
                  options={options} start={start} end={end} />);

    ReactDOM.render(window,
                    document.getElementById("reacttest"));
  });
}

function getTabs() {
  var start = Date.now();

  return browser.tabs.query({}).then((tabs) => {
    let audibleTabs = tabs.filter(tab => tab.audible);

    // //loop through the tabs and group them by windows for display
    let sortType = groupbyDomainElement.checked ? "domain": "window";
    let groups = Utils.groupTabs(tabs, sortType);
    let windowTabs = Utils.sortByDomain(sortByDomainValue, groups);
    let tabcount = tabs.length;
    let windowcount = windowTabs.length;

    let end = Date.now();

    return {windowTabs, audibleTabs, tabcount, windowcount, start, end};
  });
}

// closeTab: Close tab after clicking on a tabist link to navigate to that tab
// pinTab: Pin the tab when opening tabist
// autoRefresh: Refresh the tabist page automatically as events come in
// newtab: Replace your new tab page with tabist (probably not able to do this in firefox)
function getOptions() {
  return browser.storage.local.get(["closeTab", "pinTab", "autoRefresh", "newtab"]).then( res => {
    options.closetab = res.closeTab || (res.closeTab == "undefined"); // default true
    options.pintab = res.pinTab || false;
    options.autorefresh = res.autoRefresh || (res.autoRefresh == "undefined"); // default true
    options.newtab = res.newTab || false;
    return options;
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
  updateTabList();
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

function setVersion() {
  var versionElement = document.getElementById("version");
  if (!version ) {
    var manifest = version || chrome.runtime.getManifest();
    version = version || manifest.version;
  }

  versionElement.innerText = "Tabist (" + version + ")";
}
setVersion();

function setDevStatus() {
  var statusElement = document.getElementById("developmentStatus");

  chrome.management.getSelf(info => {
    if(info.installType == "development"){
      statusElement.innerText = "( " + info.installType + "-" + document.URL + " )";
    }
  });
}
setDevStatus();
