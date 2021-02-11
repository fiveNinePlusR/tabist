import React, { useState, useEffect } from 'react';
import Utils from '../lib/utils';
import Link from './Link'
import ErrorBoundary from './ErrorBoundary'

class Window extends React.Component {

  constructor(props) {
    super(props);

    this.setState({windowId: props.windowId})

    // this.state = {date: new Date()};
  }

  componentDidMount() {
    this.addEventHandlers();
  }

  componentWillUnmount() {
    this.removeEventHandlers();
  }

  render(props) {
    let title = props.windowId;
    let displayTitle = Utils.isNumeric(title) ? `Window ${props.index + 1}: ${props.windowId}` : title;
    let links = windowList.map(tab => {
      return (<Link key={tab.id} tabData={tab} options={props.options} />);
    })

    return (
      <div>
        <h2> {displayTitle} <CloseWindowButton windowId={props.windowId} /> </h2>
        <ul>
          <ErrorBoundary>
            {links}
          </ErrorBoundary>
        </ul>
      </div>
    );
  }

  // let links = props.tabs.map((tab) => {
  //   return <Link key={tab.id} tabData={tab} options={props.options} />;
  // });
  // if (links.length <= 0) { return null; }

  // let title = props.title;
  // let displayTitle = Utils.isNumeric(title) ? `Window ${props.index}` : title;

  updateList = () => {
    browser.tabs.query({ windowId: this.state.windowId }).then(tabs => {

      let t = tabs.map(item => item.id);

      this.setState({tabIds: t, windowList: tabs})

      console.log("updating windowList", props.windowId);
    });
  }

  // Fires when the active tab in a window changes.
  // Note that the tab's URL may not be set at the time this event fired,
  // but you can listen to tabs.onUpdated events to be notified when a URL is set.
  _activated(info) {
      console.log("activated", info);
    if(this.state.tabIds.includes(info.tabId)){
      console.log("activated", info);
      updateList();
    }
  }

  // Fired when a tab is attached to a window, for example because it was moved between windows.
  _attached(tab, info) {
    console.log("attached", tab, info);
    if(info.windowId == this.state.windowId || this.state.tabIds.includes(info.tabId)) {
      // console.log("attached", tab, info);
      updateList();
    }
  }

  // Fired when a tab is created. url might not be set yet.
  _created(tab) {
    // could just use updated probably
    if(this.state.windowId == tab.windowId) {
      console.log("created", tab);
    }
  }

  // Fired when a tab is detached from a window, for example because it is being moved between windows.
  _detached(tabId, detachInfo) {
    console.log("detached", tabId, detachInfo);
  }

  // // Fired when the set of highlighted tabs in a window changes.
  // function _highlighted(info) {
  //   console.log("highlighted", info);
  // }

  // only for local moves within a window
  _moved(tabId, moveInfo) {
    if(this.state.tabIds.includes(tabId)) {
      console.log("moved", tabId, moveInfo);
      updateList();
    }
  }

  // Fired when a tab is closed.
  _removed(tabId, removeInfo) {
    console.log("pre-removed", tabId, tabIds);
    if(this.state.tabIds.includes(tabId)) {
      console.log("removed", tabId);
      updateList();
    }
  }

  // Fired when a tab is replaced with another tab due to pre-rendering or instant.
  // This event may not be relevant for or supported by browsers other than Chrome.
  _replaced(addedTabId, removedTabId) {
    console.log("replaced", removedTabId, addedTabId);
  }

  _updated(tabId, changeInfo, tab) {
    if(this.state.tabIds.includes(tabId)){
    // console.log("updated", );
      updateList();
    }
  }

  addEventHandlers() {
    let ns = chrome.tabs;

    ns.onActivated.addListener(_activated.bind(this));
    ns.onAttached.addListener(_attached.bind(this));
    ns.onCreated.addListener(_created.bind(this));
    ns.onDetached.addListener(_detached.bind(this));
    // ns.onHighlighted.addListener(_highlighted);
    ns.onMoved.addListener(_moved.bind(this));
    ns.onRemoved.addListener(_removed.bind(this));
    ns.onReplaced.addListener(_replaced.bind(this));
    ns.onUpdated.addListener(_updated.bind(this), {windowId: props.windowId});
    // ns.onZoomChanged.addListener(_zoom);

    // if (Utils.isNumeric(changes) && tabIds.includes(changes)) {
    //   console.log("tab removed", changes, "for window", props.windowId);
    //   updateList();
    // } else if (changes.windowId == props.windowId) {
    //   console.log("updated", changes);
    //   updateList();
    // }
  }


  removeEventHandlers() {
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

  // useEffect(function () {

  //   if (Utils.isNumeric(props.windowId) && !loaded) {
  //     setLoaded(true);
  //     updateList();
  //     console.log("created events for window", props.windowId)
  //     addEventHandlers();
  //     return removeEventHandlers;
  //   }
  // }, [tabIds, loaded]);


};


const CloseWindowButton = (props) => {
  const closeHandler = () => {
    browser.windows.remove(props.windowId);
  }
  return null;
  // return <span style={{color:"darkred", verticalAlign: "center", fontSize: "0.7em"}} onClick={this.closeHandler.bind(this)}>(X)</span>;
};

export default Window;