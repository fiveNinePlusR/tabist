import React, { useState, useEffect } from 'react';
import Utils from '../lib/utils';
import Link from './Link'

const Window = (props) => {

  let links = props.tabs.map((tab) => {
    return <Link key={tab.id} tabData={tab} options={props.options} />;
  });
  if (links.length <= 0) { return null; }

  let title = props.title;
  let displayTitle = Utils.isNumeric(title) ? `Window ${props.index}` : title;

  return (
    <div>
      <h2> {displayTitle} <CloseWindowButton windowid={props.windowid} /> </h2>
      <ul>
        {links}
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