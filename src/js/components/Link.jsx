import React, { useState, useEffect, Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Link = (props) => {
  const clickHandler = (e) => {
    e.persist();
    //stops the jarring page reload on click
    e.preventDefault();
    console.log(e);

    if( e.button == 1 ) {
      //middle click
      console.log(props.tabData);
      browser.tabs.remove(props.tabData.id);
      return;
    } else if( e.button == 2 ) {
      //right click
      return;
    }

    let p1 = browser.tabs.update(props.tabData.id, { active: true });
    let p2 = browser.windows.update(props.tabData.windowId, { focused: true });


    Promise.all([p1, p2]).then(() => {
      if (props.options != "undefined" && props.options.closetab) {
        chrome.tabs.getCurrent(tab => {
          chrome.tabs.remove(tab.id);
        });
      }
    });

    return false;
  };

  let tab = props.tabData;
  // console.log(tab);
  var linkText = tab.title || tab.url;
  var options = props.options;

  return (
    // <Draggable draggableId={`draggable-tab-id-${tab.id}`} index={tab.index} >
    //   {(provided, snapshot) => (
        <li
          // ref={provided.innerRef}
          // {...provided.draggableProps}
          // {...provided.dragHandleProps}
          key={tab.id}
        >
          <a href="#"
            className="links"
            onAuxClick={clickHandler.bind(this)}
            onClick={clickHandler.bind(this)} >
            {favicon(tab.favIconUrl)}
            {audible(tab.audible)}
            {linkText}
            {active(tab.active)}
          </a>
          <span>&nbsp;</span><CloseTabButton tabId={tab.id} />
        </li>
      // )}
    // </Draggable >
  );

}

class CloseTabButton extends Component {
  closeHandler() {
    browser.tabs.remove(this.props.tabId);
  }
  render() {
    return <span style={{ color: "darkred", verticalAlign: "center" }} onClick={this.closeHandler.bind(this)}>(X)</span>;
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

export default Link;

// class Link extends Component {

//   render() {
//     let tab = this.props.tabData;
//     // console.log(tab);
//     var linkText = tab.title || tab.url;
//     this.options = this.props.options;

//     return (
//       <Draggable draggableId={`draggable-tab-id-${tab.id}`} index={tab.index} >
//         {(provided, snapshot) => (
//           <li
//             ref={provided.innerRef}
//             {...provided.draggableProps}
//             {...provided.dragHandleProps}
//             key={tab.id}
//           >
//             <a href="#"
//               className="links"
//               onAuxClick={this.clickHandler.bind(this)}
//               onClick={this.clickHandler.bind(this)} >
//               {favicon(tab.favIconUrl)}
//               {audible(tab.audible)}
//               {linkText}
//               {active(tab.active)}
//             </a>
//             <span>&nbsp;</span><CloseTabButton tabId={tab.id} />
//           </li>
//         )}
//       </Draggable >
//     );
//   }
// }


