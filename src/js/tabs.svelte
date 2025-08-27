<script>
  import Utils from './lib/utils.js';

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

  browser.management.getSelf(info => {
      developmentStatus = info.installType == "normal" ? "" : info.installType;
      developmentMode = info.installType != "normal";
  });

  async function getTabs() {
    var start = Date.now();

    log("get tabs running");

    return await browser.tabs.query({}).then((tabs) => {
      let audibleTabs = tabs.filter(tab => tab.audible);
      // log(tabs);

      // //loop through the tabs and group them by windows for display
      // let sortType = groupbyDomainElement.checked ? "domain": "window";
      // let groups = Utils.groupTabs(tabs, sortType);
      let groups = Utils.groupTabs(tabs, "window");
      let windowTabs = Utils.sortByDomain(sortByDomainValue, groups);
      let tabcount = tabs.length;
      let windowcount = windowTabs.size;

      let end = Date.now();

      return { windowTabs, tabcount, windowcount, start, end, tabs, audibleTabs };
    });
  }

  function updateTabs() {
    getTabs().then((currentState) => {
      log(currentState);
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

  function handleClicked(e) {
    log("link clicked", e);

    let tabid = int(e.target.getAttribute('tabid'));
    let windowid = int(e.target.getAttribute('windowid'));

    e.preventDefault();
    log(e);

    if( e.button == 1 ) {
      //middle click
      browser.tabs.remove(tabid);

      return;
    } else if( e.button == 2 ) {
      //right click
      return;
    }

    let p1 = browser.tabs.update(tabid, { active: true });
    let p2 = browser.windows.update(windowid, { focused: true });


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

  browser.tabs.onActivated.addListener(updateTabs);
  browser.tabs.onAttached.addListener(updateTabs);
  browser.tabs.onCreated.addListener(updateTabs);
  browser.tabs.onDetached.addListener(updateTabs);
  browser.tabs.onMoved.addListener(updateTabs);
  browser.tabs.onRemoved.addListener(updateTabs);
  browser.tabs.onUpdated.addListener(updateTabs);

  updateTabs();

</script>


    <div class="container">
      <h1>Tabist</h1>
      <a class="btn btn-secondary" id="refresh_link" onclick={updateTabs}>Refresh</a>
      <a class="btn btn-secondary" id="display_options_link">Show Options</a>
      <hr />
      <h3 id="refreshcount">Refresh Count: {updatecount}</h3>
      <hr />
      <div id="controls" class="container" hidden="">
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

        <a class="btn btn-secondary" id="options_link" href="moz-extension://04bf83d2-9d68-4107-9c70-3b567e99c224/options.html">Preferences</a>
        <hr />

      </div>

      <div id="content">

      {#snippet renderlink(l)}
            <li>
              <a href={l.url} class="links" onclick={handleClicked} onauxclick={handleClicked} tabid={l.id} windowid={l.windowId}>
                <span>
                  <img src={l.favIconUrl} width="24" height="24" alt="" hidden={l.favIconUrl === undefined}/>
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
        {#each windowTabs as [windowid, window], i (windowid)}
          <div>
            <h2>Window { i + 1 }</h2>
          </div>
          {#each window as link }
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
