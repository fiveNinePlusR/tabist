<script>
  import Utils from './lib/utils.js';
  import { draggable, droppable } from '@thisux/sveltednd';
  // import dnd  from 'dnd-master'
  import * as dnd from 'dnd-master';

  function log(...s) { if(developmentMode) { console.log(...s); } }
  function int(value) { return parseInt(value, 10) }

  let sortByDomainValue = false;
  let windowTabs = $state({});
  let tabs = $state({});
  let audibleTabs = $state({});
  let tabcount = $state(0);
  let windowcount = $state(0);
  let start = $state(0);
  let end = $state(0);
  let updatecount = $state(0);
  let developmentStatus = $state("");
  let developmentMode = $state(false);
  let dropInfo = $state({});
  let dragging = $state(false);
  let showOptions = $state(false);


  chrome.management.getSelf(info => {
      developmentStatus = info.installType == "normal" ? "" : info.installType;
      developmentMode = info.installType != "normal";
  });

  async function getTabs() {
    var start = Date.now();

    log("get tabs running");

    return await chrome.tabs.query({}).then((tabs) => {
      let audibleTabs = tabs.filter(tab => tab.audible);
      // log(tabs);

      // //loop through the tabs and group them by windows for display
      // let sortType = groupbyDomainElement.checked ? "domain": "window";
      // let groups = Utils.groupTabs(tabs, sortType);
      let groups = Utils.groupTabs(tabs, "window");
      let windowTabs = Utils.sortByDomain(sortByDomainValue, groups);
      let tabcount = tabs.length;
      let windowcount = windowTabs.length;

      let end = Date.now();

      return { windowTabs, tabcount, windowcount, start, end, tabs, audibleTabs };
    });
  }

  function getOptionsURL() {
    return chrome.runtime.getURL("options.html")
  }

  function updateTabs() {
    getTabs().then((currentState) => {
      log("updating tabs", currentState);
      windowTabs = currentState.windowTabs;
      tabcount = currentState.tabcount;
      windowcount = currentState.windowcount;
      start = currentState.start;
      end = currentState.end;
      tabs = currentState.tabs;
      audibleTabs = currentState.audibleTabs;
      updatecount += 1
    });
  }

  function toggleOptions(event) {
    if (event) event.preventDefault();
    showOptions = !showOptions;
  }


  function handleClicked(e) {
    log("link clicked", e);

    let tabid = int(e.target.getAttribute('tabid'));
    let windowid = int(e.target.getAttribute('windowid'));

    e.preventDefault();
    log(e);

    if( e.button == 1 ) {
      //middle click
      chrome.tabs.remove(tabid);

      return;
    } else if( e.button == 2 ) {
      //right click
      return;
    }

    let p1 = chrome.tabs.update(tabid, { active: true });
    let p2 = chrome.windows.update(windowid, { focused: true });


    // TODO: close the tabist tab after clicking a link
    // if the option is set to do so and we have options ready
    // Promise.all([p1, p2]).then(() => {
    //   if (props.options != "undefined" && props.options.closetab) {
    //     chrome.tabs.getCurrent(tab => {
    //       chrome.tabs.remove(tab.id);
    //     });
    //   }
    // });

    return false;
  }

  chrome.tabs.onActivated.addListener(updateTabs);
  chrome.tabs.onAttached.addListener(updateTabs);
  chrome.tabs.onCreated.addListener(updateTabs);
  chrome.tabs.onDetached.addListener(updateTabs);
  chrome.tabs.onMoved.addListener(updateTabs);
  chrome.tabs.onRemoved.addListener(updateTabs);
  chrome.tabs.onUpdated.addListener(updateTabs);


  // Handle drops between containers
  function myhandleDrop(data) {
    dropInfo = {
      droppedTab: data
    };
  }

  updateTabs();

  // DnD functions
  function createDropzone(node) {
    return dnd.dropzone(myhandleDrop, {
      drop: (_event, droptargetElement) => {
        let targetWindowid = int(droptargetElement.getAttribute("windowid"));
        let targetIndex = int(droptargetElement.getAttribute("index"));

        if(dropInfo.droppedTab != undefined) {
          let tabData = dropInfo.droppedTab;
          log("moving tab", tabData.tabid, "to window", targetWindowid, "at index", targetIndex);
          chrome.tabs.move(tabData.tabid, { windowId: targetWindowid, index: targetIndex });
        }
    },
    dragover: (event, element) => {
      log("dragover on dropzone", event, element);
      event.preventDefault();
    }
     });
  }

  function createDragable(node) {
    return dnd.draggable({"draggable": "true", "windowid" : node.windowId, "tabid" : node.id },
      {
        //   dragstart:(_event, draggableElement) => {
        //   // $inspect.trace("dragstart")
        //     _event.preventDefault();
        //   console.log("drag start");
        //   dragging = true;

        //   }
        // ,
        // dragend:(_event, draggableElement) => {
        //     // _event.preventDefault();
        //   // $inspect.trace("dragend")
        //   console.log("drag end");
        //   dragging = false;
        // }
      });
  }

$inspect("dragging", dragging)
</script>


    <div class="container">
      <h1>Tabist</h1>
      <button type="button" class="btn btn-secondary" id="refresh_link" onclick={updateTabs}>Refresh</button>
      <button type="button" class="btn btn-secondary" id="display_options_link" onclick={toggleOptions} aria-expanded={showOptions}>{showOptions ? 'Hide Options' : 'Show Options'}</button>

      <hr />
      <h3 id="refreshcount">Refresh Count: {updatecount}</h3>
      <hr />
      {#if showOptions}
      <div id="controls" class="container">
        <div class="row">

          <div class="col-sm-5">
            <h3>Group By</h3>
            <input type="checkbox" name="group_by_radiobutton" class="form-check-input" id="gb_window" value="Window" text="Window" checked="checked"/>By Window<br />
            <input type="checkbox" name="group_by_radiobutton" class="form-check-input" id="gb_domain" value="By Domain" />By Domain<br />
          </div>

          <div style="display: none" class="col-sm-5">
            <h3>Order By</h3>
            <input type="radio" name="order_by_radiobutton" class="form-check-input" id="orderby_natural" value="As Opened" text="As Opened" />As Opened<br />
            <input type="radio" name="order_by_radiobutton" class="form-check-input" id="orderby_reverse" value="Reverse Order" text="Reverse Order" />Reverse Order<br />
            <input type="radio" name="order_by_radiobutton" class="form-check-input" id="orderby_mru" value="Most Recently Used" text="Most Recently Used" />Most Recently Used<br />
          </div>
        </div>

        <a class="btn btn-secondary" id="options_link" href={getOptionsURL()}>Preferences</a>
        <hr />

      </div>
      {/if}

      <div id="content">

      {#snippet renderlink(l)}
            <li>
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div {@attach createDropzone(l)}
                tabid={l.id} windowid={l.windowId}
                index={l.index} class=dropzone
              >
                <!-- class:active-dropzone={dragging} -->
                  tab: {l.id}, index: {l.index} class="dropzone"
                </div>
                 <a href={l.url} class="links"
                   {@attach createDragable(l)} onclick={handleClicked}
                   onauxclick={handleClicked}
                   tabid={l.id} windowid={l.windowId}
                   ondragstart={() => { dragging = true; }}
                   ondragend={() => { dragging = false; }}
                 >
                  <span>
                    <img src={l.favIconUrl} width="24" height="24" alt="" hidden={l.favIconUrl === undefined || l.favIconUrl == ""}/>
                    <span>&nbsp;</span>
                  </span>
                  {#if l.audible }<span>&#x1f508;</span>{/if}
                  {l.title} ({l.id})
                </a>
                {#if l.active }
                  <span style="color: darkred"> &raquo; (Selected)</span>
                {/if}
                <span style="color: darkred">(X)</span>
            </li>
      {/snippet}

      <!-- audible tabs -->
        <div>
          <h2>Audible Tabs: {audibleTabs.length}</h2>
          <ul>
            {#each audibleTabs as link }
              {@render renderlink(link) }
            {/each}
          </ul>
        </div>


        <!-- normal tabs -->
        {#each windowTabs as window, i}
            <h2>Window { i + 1 }</h2>
             {#each window as link (link.id) }
                 {@render renderlink(link) }
             {/each}
        {/each}
      </div>

            <div>
            <h2>Total Windows: {windowcount}</h2>
            <h2>Total Tabs: {tabcount}</h2>
            <h2>Average Tabs Per Window: {(tabcount / windowcount).toFixed(2)}</h2>
            <h4>Created In: {end - start}ms</h4>
          </div>
        </div>

      <hr />

      <h3 id="version">Tabist (0.1.20)</h3>
      <h4 id="developmentStatus">{developmentStatus}</h4>
      <a href="https://github.com/fiveNinePlusR/tabist/issues">Problems? Suggestions? Report feedback or issues here</a>
