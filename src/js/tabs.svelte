<script>

    // onMount(() => {
  //   document.getElementById('refresh_link').addEventListener('click', () => {
  //     location.reload();
  //   });

  //   document.getElementById('display_options_link').addEventListener('click', () => {
  //     document.getElementById('controls').hidden = !document.getElementById('controls').hidden;
  //   });
  // });
  let links = [
    { url: 'https://example.com', title: 'Example', imgsrc: 'https://picsum.dev//24' },
    { url: 'https://example.org', title: 'Example Org', imgsrc: 'https://picsum.dev//24' },
    // Add more links as needed
  ];

</script>


    <div class="container">
      <h1>Tabist</h1>
      <a class="btn btn-secondary" id="refresh_link">Refresh</a>
      <a class="btn btn-secondary" id="display_options_link">Show Options</a>
      <hr />
      <h3 id="refreshcount">Refresh Count: 1</h3>
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
        <div>
        <!-- { @render window(links, 'Window 1') } -->
        window
        </div>
        <!-- Example: Render links with each loop -->
        {#each links as link}
          <li>
            <a href={link.url} class="links">
              <span>
                <img
                  src={link.imgsrc}
                  width="24"
                  height="24"
                  alt={link.title}
                /><span>&nbsp;</span>
              </span>
              {link.title}
            </a>
            <span>&nbsp;</span><span style="color: darkred">(X)</span>
          </li>
        {/each}
      </div>

            <div>
            <h2>Total Windows: 2</h2>
            <h2>Total Tabs: 35</h2>
            <h2>Average Tabs Per Window: 17.50</h2>
            <h4>Created In: 5ms</h4>
          </div>
        </div>

      <hr />

      <h3 id="version">Tabist (0.1.10)</h3>
      <h4 id="developmentStatus">development</h4>
      <a href="https://github.com/fiveNinePlusR/tabist/issues"
        >Problems? Suggestions? Report feedback or issues here</a
      >
