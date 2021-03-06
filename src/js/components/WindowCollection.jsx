import React, {Component} from 'react';
import Utils from '../lib/utils';
import _ from 'underscore';

class WindowCollection extends Component{

  render(){
    let windows = this.props.windowdata;
    let renderedWindows = Array.from(windows.keys()).map((window, index) => {
      return <Window key={window} title={window} index={index + 1} id={window} tabs={windows.get(window)} options={this.props.options} />;
    });

    let audible = <Window title={"Audible Tabs"} id="audible" tabs={this.props.audibleTabs} options={this.props.options}/>;
    let footer = <Footer start={this.props.start} end={this.props.end} totalNumberWindows={this.props.windowcount} totalTabs={this.props.tabcount}/>;
    return (<div>
            {audible}
            {renderedWindows}
            {footer}
            </div>
           );
  }
}

class Window extends Component {
  render(){
    let links = this.props.tabs.map((tab) => {
      return <Link key={tab.id} tabData={tab} options={this.props.options} />;
    });
    if (links.length <= 0) { return null; }

    let title = this.props.title;
    let displayTitle = Utils.isNumeric(title) ? `Window ${this.props.index}`: title;

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
    return <span style={{color:"darkred", verticalAlign: "center"}} onClick={this.closeHandler.bind(this)}>(X)</span>;
  }
}

class Link extends Component {
  clickHandler(){
    let p1 = browser.tabs.update(this.props.tabData.id, {active: true});
    let p2 = browser.windows.update(this.props.tabData.windowId, {focused: true});

    Promise.all([p1, p2]).then(() => {
      if (this.props.options != "undefined" && this.props.options.closetab) {
        chrome.tabs.getCurrent(tab => {
          chrome.tabs.remove(tab.id);
        });
      }
    });

    return false;
  }

  render(){
    let tab = this.props.tabData;
    var linkText = tab.title || tab.url;
    this.options = this.props.options;

    return (
      <li>
        <a href="#"
           className="links"
           onClick={this.clickHandler.bind(this)}>
          {favicon(tab.favIconUrl)}
          {audible(tab.audible)}
          {linkText}
          {active(tab.active)}
        </a>
        <span>&nbsp;</span><CloseTabButton tabid={tab.id}/>
      </li>
    );
  }
}

class Footer extends Component {

  render(){
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

function active(isActive){
  if (!isActive) { return null; }

  return <span style={{color: "darkred"}}> &raquo; (Selected)</span>;
}

function favicon(iconurl){
  if (!iconurl) { return null; }

  return <span><img src={iconurl} width='24' height='24'/><span>&nbsp;</span></span>;
}

function audible(audible){
  if (!audible) { return null; }

  return <span>&#x1f508;</span>;
}

export default WindowCollection;
