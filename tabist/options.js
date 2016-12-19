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
