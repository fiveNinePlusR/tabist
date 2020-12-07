// import React, { Component } from 'react';
import React, { useState, useEffect } from 'react';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import _ from 'underscore';

// import Utils from '../lib/utils';
import Window from './Window';
import Footer from './Footer';


const WindowCollection = (props) => {
  // let onDragEnd = result => {
  //   console.log("drag ended", result);
  //   var dest = result.destination.droppableId;
  //   dest = parseInt(dest.replace("windownum-", ""), 10);
  //   var destIndex = parseInt(result.destination.index, 10);

  //   var {droppableId, index} = result.source;
  //   var src = droppableId.replace("windownum-", "");

  //   browser.tabs.query({windowId: parseInt(src, 10)}).then( r => {
  //     var tab = r.find(item => item.index == index);
  //     console.log("tab", tab);
  //     console.log("src", r);
  //     console.log("moving:", tab.id, `to window: ${dest} index: ${destIndex}`)
  //     browser.tabs.move(tab.id, {windowId: dest, index: destIndex}).then( result => {
  //       console.log("finished moving tab");
  //       props.updateList();
  //     })
  //   });
  //   browser.tabs.query({windowId: parseInt(dest, 10)}).then( r => {console.log("dest", r)});
  // };

  let [windowlist, setWindowlist] = useState([]);

  // let audible = <Window title={"Audible Tabs"} id="audible" tabs={props.audibleTabs} options={props.options} />;
  const updateWindows = () => {
    browser.windows.getAll({windowTypes: ["normal"]}).then( windows => {
      // console.log("windowCollection: windows", windows);
      setWindowlist(windows);
    });
  }

  useEffect(() => {
    // console.log("from windowCollection");
    updateWindows();

    chrome.windows.onRemoved.addListener( windowid => {
      updateWindows();
    })
    chrome.windows.onCreated.addListener( window => {
      updateWindows();
    })

  }, []);


  // console.log("windowid", props.windowid, windowlist);
  let thewindows = windowlist.map((window, index) => {
      return <Window
        windowid={window.id} index={index} />
  });
  console.log(thewindows, "thewindows");

  return (
    thewindows
  );
  // useEffect(() => {
  //   let audibleTabs = props.tabs.filter(tab => tab.audible);
  // });


  // let windows = windowList//props.windowdata;
  // let renderedWindows = Array.from(windows.keys()).map((window, index) => {
  //   return (
  //     <Droppable droppableId={`windownum-${window}`} >
  //       {(provided, snapshot) => (
  //         <div
  //           ref={provided.innerRef}
  //           {...provided.droppableProps}
  //         >
  //           <Window
  //             key={window}
  //             title={window}
  //             index={index + 1}
  //             id={window}
  //             tabs={windows.get(window)}
  //             options={props.options}
  //             // innerRef={provided.innerRef}
  //             />

  //             {provided.placeholder}
  //         </div>
  //       )}
  //     </Droppable>
  //   )
  // });


  // let footer = <Footer start={props.start} end={props.end} totalNumberWindows={props.windowcount} totalTabs={props.tabcount} />;

  // return (
  //   <DragDropContext onDragEnd={onDragEnd}>
  //     <div key="list">
  //       {/* {audible} */}
  //       {renderedWindows}
  //       {/* {footer} */}
  //     </div>
  //   </DragDropContext>
  // );
};

export default WindowCollection;

// class WindowCollection extends Component {


//   render() {
//     let windows = this.props.windowdata;
//     let renderedWindows = Array.from(windows.keys()).map((window, index) => {
//       console.log("window", window)
//       return (
//         <Droppable droppableId={`windownum-${window}`} >
//           {(provided, snapshot) => (
//             <div
//               ref={provided.innerRef}
//               {...provided.droppableProps}
//             >
//               <Window
//                 key={window}
//                 title={window}
//                 index={index + 1}
//                 id={window}
//                 tabs={windows.get(window)}
//                 options={this.props.options}
//                 // innerRef={provided.innerRef}
//                 />


//                 {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       )
//     });


//     let audible = <Window title={"Audible Tabs"} id="audible" tabs={this.props.audibleTabs} options={this.props.options} />;
//     let footer = <Footer start={this.props.start} end={this.props.end} totalNumberWindows={this.props.windowcount} totalTabs={this.props.tabcount} />;

//     return (
//       <DragDropContext onDragEnd={this.onDragEnd}>
//         <div key="list">
//           {audible}
//           {renderedWindows}
//           {footer}
//         </div>
//       </DragDropContext>
//     );
//   };
// }

// export default WindowCollection;
