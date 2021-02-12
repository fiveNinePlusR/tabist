import React, { useState, useEffect } from 'react';
import Utils from '../lib/utils';
import Link from './Link'
import ErrorBoundary from './ErrorBoundary'

class Window extends React.Component {

  constructor(props) {
    super(props);

    this.state = { windowId: props.windowId, windowList: [], tabIds: []}

    this.updateList()
  }

  componentDidMount() {
    this.addEventHandlers();
  }

  componentWillUnmount() {
    this.removeEventHandlers();
  }



  render() {
    if (!this.state) { return null; }
    let title = this.state.windowId;
    let displayTitle = Utils.isNumeric(title) ? `Window ${this.props.index + 1}: ${this.props.windowId}` : title;
    // console.log("props", this.props)
    let links = this.state.windowList.map(tab => {
      return (<Link key={tab.id} tabData={tab} options={this.props.options} />);
    })

    return (
      <div>
        <h2> {displayTitle} <CloseWindowButton windowId={this.props.windowId} /> </h2>
        <ul>
          <ErrorBoundary>
            {links}
          </ErrorBoundary>
        </ul>
      </div>
    );
  }

  updateList() {
    browser.tabs.query({ windowId: this.props.windowId }).then(tabs => {
      let t = tabs.map(item => item.id);

      this.setState({ tabIds: t, windowList: tabs })
    });
  }

  // Fires when the active tab in a window changes.
  // Note that the tab's URL may not be set at the time this event fired,
  // but you can listen to tabs.onUpdated events to be notified when a URL is set.
  _activated(info) {
    if (this.state.windowId == info.windowId) {
      console.log("activated inside", info);
      this.updateList();
    }
  }

  // Fired when a tab is attached to a window, for example because it was moved between windows.
  _attached(tab, info) {
    if (info.windowId == this.state.windowId || this.state.tabIds.includes(info.tabId)) {
      console.log("attached", tab, info);
      this.updateList();
    }
  }

  // Fired when a tab is created. url might not be set yet.
  _created(tab) {
    // could just use updated probably
    if (this.state.windowId == tab.windowId) {
      console.log("created", tab);
      this.updateList()
    }
  }

  // Fired when a tab is detached from a window, for example because it is being moved between windows.
  _detached(tabId, detachInfo) {
    if(detachInfo.oldWindowId == this.state.windowId || this.state.tabIds.includes(tabId)) {
      console.log("detached", tabId, detachInfo);
      this.updateList()
    }
  }

  // // Fired when the set of highlighted tabs in a window changes.
  // function _highlighted(info) {
  //   console.log("highlighted", info);
  // }

  // only for local moves within a window
  _moved(tabId, moveInfo) {
    if (this.state.tabIds.includes(tabId)) {
      console.log("moved", tabId, moveInfo);
      this.updateList();
    }
  }

  // Fired when a tab is closed.
  _removed(tabId, removeInfo) {
    if (this.state.tabIds.includes(tabId) || this.state.windowId == removeInfo.windowId) {
      console.log("removed", tabId);
      this.updateList();
    }
  }

  // Fired when a tab is replaced with another tab due to pre-rendering or instant.
  // This event may not be relevant for or supported by browsers other than Chrome.
  _replaced(addedTabId, removedTabId) {
    console.log("replaced", removedTabId, addedTabId);
  }

  _updated(tabId, changeInfo, tab) {
    if (this.state.tabIds.includes(tabId)) {
      this.updateList();
    } else if (this.state.windowId == changeInfo.windowId) {
      this.updateList();
    }
  }

  addEventHandlers() {
    let ns = chrome.tabs;

    ns.onActivated.addListener(this._activated.bind(this));
    ns.onAttached.addListener(this._attached.bind(this));
    ns.onCreated.addListener(this._created.bind(this));
    ns.onDetached.addListener(this._detached.bind(this));
    // ns.onHighlighted.addListener(_highlighted);
    ns.onMoved.addListener(this._moved.bind(this));
    ns.onRemoved.addListener(this._removed.bind(this));
    ns.onReplaced.addListener(this._replaced.bind(this));
    ns.onUpdated.addListener(this._updated.bind(this), { windowId: this.props.windowId });
    // ns.onZoomChanged.addListener(_zoom);
  }


  removeEventHandlers() {
    let ns = chrome.tabs;
    ns.onActivated.removeListener(this._activated);
    ns.onAttached.removeListener(this._attached);
    ns.onCreated.removeListener(this._created);
    ns.onDetached.removeListener(this._detached);
    // ns.onHighlighted.removeListener(_highlighted);
    ns.onMoved.removeListener(this._moved);
    ns.onRemoved.removeListener(this._removed);
    ns.onReplaced.removeListener(this._replaced);
    ns.onUpdated.removeListener(this._updated)
    console.log("eventHandlersRemoved");
  }
};


const CloseWindowButton = (props) => {
  const closeHandler = () => {
    browser.windows.remove(props.windowId);
  }
  return null;
  // return <span style={{color:"darkred", verticalAlign: "center", fontSize: "0.7em"}} onClick={this.closeHandler.bind(this)}>(X)</span>;
};

export default Window;