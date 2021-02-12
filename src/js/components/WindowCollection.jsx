import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import _ from 'underscore';

import Window from './Window';


class WindowCollection extends Component {
  constructor(props) {
    super(props)
    this.state = { windowId: props.windowId }
    chrome.windows.onRemoved.addListener(this.updateWindows.bind(this))
    chrome.windows.onCreated.addListener(this.updateWindows.bind(this))
    this.updateWindows()
  }

  componentWillUnmount() {
    chrome.windows.onRemoved.removeListener(this.updateWindows.bind(this))
    chrome.windows.onCreated.removeListener(this.updateWindows.bind(this))
  }

  onDragEnd(result) {
    console.log("drag ended", result);
    if (!result.destination || !result.destination.droppableId) { return; }
    var dest = result.destination.droppableId;
    dest = parseInt(dest.replace("windownum-", ""), 10);
    var destIndex = parseInt(result.destination.index, 10);

    var { droppableId, index } = result.source;
    var src = droppableId.replace("windownum-", "");

    browser.tabs.query({ windowId: parseInt(src, 10) }).then(r => {
      var tab = r.find(item => item.index == index);
      console.log("tab", tab);
      console.log("src", r);
      console.log("moving:", tab.id, `to window: ${dest} index: ${destIndex}`)
      browser.tabs.move(tab.id, { windowId: dest, index: destIndex }).then(result => {
        console.log("finished moving tab");
        this.updateWindows();
      })
    });
    browser.tabs.query({ windowId: parseInt(dest, 10) }).then(r => { console.log("dest", r) });
  };


  componentDidMount() {
    // this.updateWindows();
  }

  componentDidUpdate() {

  }

  // let audible = <Window title={"Audible Tabs"} id="audible" tabs={props.audibleTabs} options={props.options} />;
  updateWindows() {
    browser.windows.getAll({ windowTypes: ["normal"] }).then(windows => {
      //problem is that the window number don't change...
      this.setState({ windowList: windows })
      this.forceUpdate((result) => {
        console.log("window update forced")
      })
    });
  }

  render() {
    if (!this.state || !this.state.windowList) { return null; }
    var theWindows = this.state.windowList.map((window, index) => {
      return (
        <Droppable droppableId={`windownum-${window.id}`} >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <Window
                windowId={window.id}
                index={index}
                key={window.id}
                options={this.props.options}
              />

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    });

    return (
      <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
        <div key="list">
          {/* {audible} */}
          {theWindows}
          {/* {footer} */}
        </div>
      </DragDropContext>
    );
  }
};

export default WindowCollection;

