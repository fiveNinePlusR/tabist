let Utils = require("./lib/utils.js");
let Bacon = require("baconjs");

function saveOptions() {
  chrome.storage.local.set({
    closeTab: document.querySelector("#close_tab").checked,
    pinTab: document.querySelector("#pin_tab").checked,
    autoRefresh: document.querySelector("#autorefresh_tab").checked,
    newTab: document.querySelector("#newtab_tab").checked,
    showDomain: document.querySelector("#show_domain_tab").checked
  });
}

function restoreOptions() {
  chrome.storage.local.get(["closeTab", "pinTab", "autoRefresh", "newtab", "showDomain"], res => {
    let closetab = res.closeTab;
    let pintab = res.pinTab;
    let autorefresh = res.autoRefresh;
    let newtab = res.newTab;
    let showdomain = res.showDomain;
    document.querySelector("#close_tab").checked = closetab || false;
    document.querySelector("#pin_tab").checked = pintab || false;
    document.querySelector("#autorefresh_tab").checked = autorefresh || false;
    document.querySelector("#newtab_tab").checked = newtab || false;
    document.querySelector("#show_domain_tab").checked = showdomain || false;
  });
}

// Bacon.fromEvent();

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

// tab backup and restore
document.getElementById("backup_tabs").onclick = function() {
  chrome.tabs.query({}, function(tabs) {
    download(JSON.stringify(tabs, null, " "));
  });
};

let restoreTab = Bacon.fromEvent(document.getElementById("restore_tabs_file"), "change");
let fileinput = document.getElementById("restore_tabs_file");

document.getElementById("restore_tabs").onclick = function() {
  fileinput.click();
};

restoreTab.onValue(() => {
  let filelist = fileinput.files;
  var reader = new FileReader();

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reader.onload = (function() { return function(e) {
    let restoredata = e.target.result.replace(/^[^,]*,/g, "");
    try{
      let data = window.atob(restoredata);
      let json = JSON.parse(data);
      if (json) {
        let wins = Utils.groupByWindow(json);
        for (let [_, tabs] of wins) {
          let links = Utils.getLinksFromTabs(tabs);
          chrome.windows.create({ url: links });
          // await sleep(1000);
        }
      }
    } catch(e){
      console.error(e);
    }
  }; })();

  reader.readAsDataURL(filelist[0]);
});

function download(data) {
  var blob = new Blob([data], {type: "text/json"});
  var url = window.URL.createObjectURL(blob);
  chrome.downloads.download({url:url, filename:"tabsbackup.json", conflictAction:"uniquify"}, function() {
    // console.log(downloadId);
  });
}
