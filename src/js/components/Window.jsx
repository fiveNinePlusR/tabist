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
  const updateList = () => {
    browser.tabs.query({ windowId: props.windowid }).then(tabs => {
      console.log("windowid", props.windowid, "tabs", tabs);
      if (windowList.length == 0) {
        setWindowList(tabs);
      }
    });
  }

  useEffect(() => {
    // console.log("windowlist", windowList);

    updateList();

    // console.log("props.windowid", props.windowid);
    if (Utils.isNumeric(props.windowid)) {

      // onAttached, onDetached, onMoved
      chrome.tabs.onActivated.addListener(changes => {
        updateList();
      }, { windowId: props.windowid });
      chrome.tabs.onReplaced.addListener(changes => {
        updateList();
      }, { windowId: props.windowid });
      chrome.tabs.onUpdated.addListener(changes => {
        updateList();
      }, { windowId: props.windowid });
      chrome.tabs.onRemoved.addListener(changes => {
        updateList();
      }, { windowId: props.windowid });

    }
  }, []);

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