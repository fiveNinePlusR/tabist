
let  Utils = {
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

  // Sorts a Map of window_ids with an array of tabs as the values by the domain of the url.
  // input Map {window_ids => [tab]+}
  // returns Map {window_ids => [sorted_tabs]}
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

  // returns an array of tabs for a set of tabs 
  // input [tabs]
  // returns [urls]
  getLinksFromTabs(tabs) {
    return tabs.reduce((memo, cur) => {
      memo = memo || [];
      memo.push(cur.url);
      return memo;
    }, []);
  }

};

module.exports = Utils;
