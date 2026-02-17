// Centralized favicon pool to avoid storing duplicate long data: URLs per tab

const urlPool = new Map(); // url -> refcount
const tabToUrl = new Map(); // tabId -> url

export function setFavForTab(tabId, url) {
  if (!url) return;
  const existing = tabToUrl.get(tabId);
  if (existing === url) return;

  // decrement previous mapping
  if (existing) {
    const prevCount = urlPool.get(existing) || 0;
    if (prevCount <= 1) urlPool.delete(existing); else urlPool.set(existing, prevCount - 1);
  }

  tabToUrl.set(tabId, url);
  const count = urlPool.get(url) || 0;
  urlPool.set(url, count + 1);
}

export function getFavForTab(tabId) {
  return tabToUrl.get(tabId);
}

export function reconcileTabs(currentTabIds /* Array of numeric ids */) {
  const keep = new Set(currentTabIds.map(id => Number(id)));

  for (const [tabId, url] of Array.from(tabToUrl.entries())) {
    if (!keep.has(Number(tabId))) {
      // remove mapping
      tabToUrl.delete(tabId);
      const prevCount = urlPool.get(url) || 0;
      if (prevCount <= 1) urlPool.delete(url); else urlPool.set(url, prevCount - 1);
    }
  }
}

export function debugStats() {
  return { urls: urlPool.size, tabs: tabToUrl.size };
}
