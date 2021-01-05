import React, { useState, useEffect } from 'react';
import Utils from '../lib/utils';
import Link from './Link'
import ErrorBoundary from './ErrorBoundary'


const Window = (props) => {

  // let links = props.tabs.map((tab) => {
  //   return <Link key={tab.id} tabData={tab} options={props.options} />;
  // });
  // if (links.length <= 0) { return null; }

  // let title = props.title;
  // let displayTitle = Utils.isNumeric(title) ? `Window ${props.index}` : title;

  let [windowList, setWindowList] = useState([]);
  let [tabids, settabids] = useState([]);
  let [loaded, setLoaded] = useState(false);

  const updateList = () => {
    browser.tabs.query({ windowId: props.windowid }).then(tabs => {
      // console.log("windowid", props.windowid, "tabs", tabs);

      let t = tabs.map(item => item.id);
      // console.log(t);
      settabids(t);

      console.log("updating windowlist", props.windowid);
      setWindowList(tabs);
    });
  }

  // Fires when the active tab in a window changes.
  // Note that the tab's URL may not be set at the time this event fired,
  // but you can listen to tabs.onUpdated events to be notified when a URL is set.
  function _activated(info) {
      console.log("activated", info);
    if(tabids.includes(info.tabId)){
      console.log("activated", info);
      updateList();
    }
  }

  // Fired when a tab is attached to a window, for example because it was moved between windows.
  function _attached(tab, info) {
    console.log("attached", tab, info);
    if(info.windowId == props.windowid || tabids.includes(info.tabId)) {
      // console.log("attached", tab, info);
      updateList();
    }
  }

  // Fired when a tab is created. url might not be set yet.
  function _created(tab) {
    // could just use updated probably
    if(props.windowid == tab.windowId) {
      console.log("created", tab);
    }
  }

  // Fired when a tab is detached from a window, for example because it is being moved between windows.
  function _detached(tabid, detachInfo) {
    console.log("detached", tabid, detachInfo);
  }

  // // Fired when the set of highlighted tabs in a window changes.
  // function _highlighted(info) {
  //   console.log("highlighted", info);
  // }

  // only for local moves within a window
  function _moved(tabid, moveinfo) {
    if(tabids.includes(tabid)) {
      console.log("moved", tabid, moveinfo);
      updateList();
    }
  }

  // Fired when a tab is closed.
  function _removed(tabid, removeInfo) {
    console.log("pre-removed", tabid, tabids);
    if(tabids.includes(tabid)) {
      console.log("removed", tabid);
      updateList();
    }
  }

  // Fired when a tab is replaced with another tab due to prerendering or instant.
  // This event may not be relevant for or supported by browsers other than Chrome.
  function _replaced(addedTabId, removedTabId) {
    console.log("replaced", removedTabId, addedTabId);
  }

  function _updated(tabid, changeinfo, tab) {
    if(this.tabids.includes(tabid)){
    // console.log("updated", );
      updateList();
    }
  }

  function addEventHandlers() {
    let ns = chrome.tabs;

    ns.onActivated.addListener(_activated.bind(this));
    ns.onAttached.addListener(_attached.bind(this));
    ns.onCreated.addListener(_created.bind(this));
    ns.onDetached.addListener(_detached.bind(this));
    // ns.onHighlighted.addListener(_highlighted);
    ns.onMoved.addListener(_moved.bind(this));
    ns.onRemoved.addListener(_removed.bind(this));
    ns.onReplaced.addListener(_replaced.bind(this));
    ns.onUpdated.addListener(_updated.bind(this), {windowId: props.windowid});
    // ns.onZoomChanged.addListener(_zoom);

    // if (Utils.isNumeric(changes) && tabids.includes(changes)) {
    //   console.log("tab removed", changes, "for window", props.windowid);
    //   updateList();
    // } else if (changes.windowId == props.windowid) {
    //   console.log("updated", changes);
    //   updateList();
    // }
  }


  function removeEventHandlers() {
    let ns = chrome.tabs;
    ns.onActivated.removeListener(_activated);
    ns.onAttached.removeListener(_attached);
    ns.onCreated.removeListener(_created);
    ns.onDetached.removeListener(_detached);
    // ns.onHighlighted.removeListener(_highlighted);
    ns.onMoved.removeListener(_moved);
    ns.onRemoved.removeListener(_removed);
    ns.onReplaced.removeListener(_replaced);
    ns.onUpdated.removeListener(_updated)
    console.log("eventHandlersRemoved");
  }

  useEffect(function () {

    if (Utils.isNumeric(props.windowid) && !loaded) {
      setLoaded(true);
      updateList();
      console.log("created events for window", props.windowid)
      addEventHandlers();
      return removeEventHandlers;
    }
  }, [tabids, loaded]);

  let title = props.windowid;
  let displayTitle = Utils.isNumeric(title) ? `Window ${props.index + 1}: ${props.windowid}` : title;
  let links = windowList.map(tab => {
    return (<Link key={tab.id} tabData={tab} options={props.options} />);
  })

  return (
    <div>
      <h2> {displayTitle} <CloseWindowButton windowid={props.windowid} /> </h2>
      <ul>
        <ErrorBoundary>
          {links}
        </ErrorBoundary>
      </ul>
    </div>
  );
};


const CloseWindowButton = (props) => {
  const closeHandler = () => {
    browser.windows.remove(props.windowid);
  }
  return null;
  // return <span style={{color:"darkred", verticalAlign: "center", fontSize: "0.7em"}} onClick={this.closeHandler.bind(this)}>(X)</span>;
}

export default Window;