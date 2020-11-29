import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Utils from '../lib/utils';
import _ from 'underscore';


class WindowCollection extends Component {

  onDragEnd = result => {
    console.log("drag ended", result);
    var dest = result.destination.droppableId;
    dest = parseInt(dest.replace("windownum-", ""), 10);
    var destIndex = parseInt(result.destination.index, 10);

    var {droppableId, index} = result.source;
    var src = droppableId.replace("windownum-", "");

    browser.tabs.query({windowId: parseInt(src, 10)}).then( r => {
      var tab = r.find(item => item.index == index);
      console.log("tab", tab);
      console.log("src", r);
      console.log("moving:", tab.id, `to window: ${dest} index: ${destIndex}`)
      browser.tabs.move(tab.id, {windowId: dest, index: destIndex}).then( result => {
        console.log("finished moving tab");
        this.props.updateList();
      })
    });
    browser.tabs.query({windowId: parseInt(dest, 10)}).then( r => {console.log("dest", r)});
    // browser.tabs.move()
  };

  render() {
    let windows = this.props.windowdata;
    let renderedWindows = Array.from(windows.keys()).map((window, index) => {
      console.log("window", window)
      return (
        <Droppable droppableId={`windownum-${window}`} >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <Window
                key={window}
                title={window}
                index={index + 1}
                id={window}
                tabs={windows.get(window)}
                options={this.props.options}
                // innerRef={provided.innerRef}
                />


                {provided.placeholder}
            </div>
          )}
        </Droppable>
      )
    });


    let audible = <Window title={"Audible Tabs"} id="audible" tabs={this.props.audibleTabs} options={this.props.options} />;
    let footer = <Footer start={this.props.start} end={this.props.end} totalNumberWindows={this.props.windowcount} totalTabs={this.props.tabcount} />;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div key="list">
          {audible}
          {renderedWindows}
          {footer}
        </div>
      </DragDropContext>
    );
  };
}

class Window extends Component {
  render() {
    let links = this.props.tabs.map((tab) => {
      return <Link key={tab.id} tabData={tab} options={this.props.options} />;
    });
    if (links.length <= 0) { return null; }

    let title = this.props.title;
    let displayTitle = Utils.isNumeric(title) ? `Window ${this.props.index}` : title;

    return (

      <div>
        <h2> {displayTitle} <CloseWindowButton windowid={this.props.windowid} /> </h2>
        <ul>
          {links}
        </ul>
      </div>
    );
  }
}

class CloseWindowButton extends Component {
  closeHandler() {
    browser.windows.remove(this.props.windowid);
  }
  render() {
    return null;
    // return <span style={{color:"darkred", verticalAlign: "center", fontSize: "0.7em"}} onClick={this.closeHandler.bind(this)}>(X)</span>;
  }
}

class CloseTabButton extends Component {
  closeHandler() {
    browser.tabs.remove(this.props.tabid);
  }
  render() {
    return <span style={{ color: "darkred", verticalAlign: "center" }} onClick={this.closeHandler.bind(this)}>(X)</span>;
  }
}

class Link extends Component {
  clickHandler(e) {
    e.persist();
    //stops the jarring page reload on click
    e.preventDefault();
    console.log(e);

    if( e.button == 1 ) {
      //middle click
      console.log(this.props.tabData);
      browser.tabs.remove(this.props.tabData.id);
      return;
    } else if( e.button == 2 ) {
      //right click
      return;
    }

    let p1 = browser.tabs.update(this.props.tabData.id, { active: true });
    let p2 = browser.windows.update(this.props.tabData.windowId, { focused: true });


    Promise.all([p1, p2]).then(() => {
      if (this.props.options != "undefined" && this.props.options.closetab) {
        chrome.tabs.getCurrent(tab => {
          chrome.tabs.remove(tab.id);
        });
      }
    });

    return false;
  }

  render() {
    let tab = this.props.tabData;
    // console.log(tab);
    var linkText = tab.title || tab.url;
    this.options = this.props.options;

    return (
      <Draggable draggableId={`draggable-tab-id-${tab.id}`} index={tab.index} >
        {(provided, snapshot) => (
          <li
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            key={tab.id}
          >
            <a href="#"
              className="links"
              onAuxClick={this.clickHandler.bind(this)}
              onClick={this.clickHandler.bind(this)} >
              {favicon(tab.favIconUrl)}
              {audible(tab.audible)}
              {linkText}
              {active(tab.active)}
            </a>
            <span>&nbsp;</span><CloseTabButton tabid={tab.id} />
          </li>
        )}
      </Draggable >
    );
  }
}

class Footer extends Component {

  render() {
    let exeTime = this.props.end - this.props.start;
    let wins = this.props.totalNumberWindows;
    let tabs = this.props.totalTabs;
    let avgTabs = tabs / (wins + 0.0);


    return (
      <div>
        <h2>Total Windows: {wins}</h2>
        <h2>Total Tabs: {tabs}</h2>
        <h2>Average Tabs Per Window: {avgTabs.toFixed(2)}</h2>
        <h4>Created In: {exeTime}ms</h4>
      </div>
    );
  }
}

function active(isActive) {
  if (!isActive) { return null; }

  return <span style={{ color: "darkred" }}> &raquo; (Selected)</span>;
}

function favicon(iconurl) {
  if (!iconurl) { return null; }

  return <span><img src={iconurl} width='24' height='24' /><span>&nbsp;</span></span>;
}

function audible(audible) {
  if (!audible) { return null; }

  return <span>&#x1f508;</span>;
}

export default WindowCollection;
