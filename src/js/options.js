let utils = require("./lib/utils.js");

function saveOptions() {
  chrome.storage.local.set({
    closeTab: document.querySelector("#close_tab").checked,
    pinTab: document.querySelector("#pin_tab").checked,
    autoRefresh: document.querySelector("#autorefresh_tab").checked,
    newTab: document.querySelector("#newtab_tab").checked,
    showDomain: document.querySelector("#show_domain_tab").checked,
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

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

// tab backup and restore
document.getElementById("backup_tabs").onclick = function() {
  chrome.tabs.query({}, function(tabs) {
    download(JSON.stringify(tabs, null, " "));
  });
};

document.getElementById("restore_tabs").onclick = function() {
  let fileinput = document.getElementById("restore_tabs_file");
  fileinput.addEventListener("change", function () {
    let filelist = this.files;
    var reader = new FileReader();

    reader.onload = (function() { return function(e) {
      let restoredata = e.target.result.replace(/^[^,]*,/g, "");
      try{
        let data = window.atob(restoredata);
        let json = JSON.parse(data);
        if (json) {
          let wins = groupByWindow(json);
          for (let [win, tabs] of wins) {
            let links = getLinksFromTabs(tabs);
            console.log(links);
            chrome.windows.create({ url: links });
          }
        }
      } catch(e){
        console.log(e);
      }
    }; })();

    reader.readAsDataURL(filelist[0]);
  }, false);
  fileinput.click();
};

// returns an array of tabs for a set of tabs 
// input [tabs]
// returns [urls]
function getLinksFromTabs(tabs) {
  return tabs.reduce((memo, cur) => { memo = memo || []; memo.push(cur.url); return memo; }, []);
}

function download(data) {
  var blob = new Blob([data], {type: "text/json"});
  var url = window.URL.createObjectURL(blob);
  chrome.downloads.download({url:url, filename:"tabsbackup.json", conflictAction:"uniquify"}, function(downloadId) {
    // console.log(downloadId);
  });
}
