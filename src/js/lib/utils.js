let  Utils = {
  groupTabs(tabs, method) {
    if (method == "window") {
      return this.groupByWindow(tabs);
    } else if ( method == "domain") {
      return this.groupByDomain(tabs);
    }

    console.log("problem getting group by preference");
    return this.groupByWindow(tabs);
  },

  // returns tabs grouped by window
  // input [tabs]
  // Map {window_id => [tab]+}
  groupByWindow(tabs) {
    return tabs.reduce(function(memo, cur) {
      let win = memo.get(cur.windowId) || [];

      win.push(cur);
      memo.set(cur.windowId, win);

      return memo;
    }, new Map());
  },

  // returns tabs grouped by domain name
  // input [tabs]
  // Map {baseDomain => [tab]+}
  groupByDomain(tabs) {
    let returnValue = new Map();
    let tabmap =  tabs.reduce(function(memo, cur) {
      let url = new URL(cur.url);
      let win = memo.get(url.hostname) || [];

      win.push(cur);
      memo.set(url.hostname, win);

      return memo;
    }, new Map());

    for(let [domain, tablist] of tabmap) {
      if (tablist.length == 1){
        // group the misc domains into one group
        let misc = returnValue.get("Misc") || [];

        misc.push(tablist[0]);
        returnValue.set("Misc", misc);
      } else {
        returnValue.set(domain, tablist);
      }
    }

    return returnValue;
  },

  // Creates the audible elements division at the top of the page.
  createAudibleElement(tabs) {
    let returnval = document.createElement("div");

    // section title
    var AudibleTitle = document.createElement("h2");
    AudibleTitle.innerText = "Audible Tabs";
    returnval.appendChild(AudibleTitle);

    // each tab
    tabs.forEach( (audibleTab) => {
      let ul = document.createElement("ul");
      returnval.appendChild(ul);

      for(let tab of audibleTabs) {
        var link = Utils.makeLink(tab);
        var li = document.createElement("li");

        li.appendChild(link);
        ul.appendChild(li);
      }
    });

    return returnval;
  },

  lexSort(l,r) {
    let left = new URL(l.url);
    let right = new URL(r.url);
    left = left.hostname || left.href;
    right = right.hostname || right.href;

    if(left > right) {
      return 1;
    }
    if(left < right) {
      return -1;
    }
    return 0;
  },

  isNumeric(value) {
    return !isNaN(value - parseFloat(value));
  },

/**
 * Sorts a Map of window_ids with an array of tabs as the values by the domain of the url.
 * @param {Boolean} sortByDoemainValue - Parameter description.
 * @param {Map} windows - input Map {window_ids => [tab]+}
 * @returns {Map<String,Array>} returns Map {window_ids => [sorted_tabs]}
 */
  sortByDomain(sortByDomainValue, windows) {
    if(sortByDomainValue){
      let sortedWindows = new Map();

      for(let [windowId, tabs] of windows){
        let sortedTabs = tabs.sort(this.lexSort);
        sortedWindows.set(windowId, sortedTabs);
      }
      return sortedWindows;
    }
    return windows;
  },

  // Returns a link object for a tab with click handlers set
  makeLink(tab, clickHandler) {
    var link = document.createElement("a");
    link.href = "#";
    link.onclick = clickHandler;
    link.tabId = tab.id;
    link.windowId = tab.windowId;

    var linkText = tab.title || tab.url;
    var isActive = tab.active ? " <span style='color:darkred'> &raquo; (Selected)</span> " : "" ;

    var audibleText = tab.audible ? "&#x1f508; " : "";
    var favicon = tab.favIconUrl ? "<img src='" + tab.favIconUrl + "' width='24' height='24'/><span>&nbsp;</span>": "";
    link.innerHTML = favicon + audibleText + linkText + isActive;

    return link;
  },

  // returns an array of tabs for a set of tabs 
  // input [tabs]
  // returns [urls]
  getLinksFromTabs(tabs) {
    return tabs.reduce((memo, cur) => {
      memo = memo || [];
      memo.push(this.handleSpecialURIs(cur.url));
      return memo;
    }, [])
      .filter(val => val);
  },

  handleSpecialURIs(url) {
    //might need to handle about:config, performance etc.
    if (url.search("http") >= 0) {
      return decodeURIComponent(url.replace("about:reader?url=",""));
    }

    return null;
  }


};

module.exports = Utils;
