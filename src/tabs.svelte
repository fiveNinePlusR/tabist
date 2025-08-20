<script>
  import { onMount } from 'svelte';

  onMount(() => {
    document.getElementById('refresh_link').addEventListener('click', () => {
      location.reload();
    });

    document.getElementById('display_options_link').addEventListener('click', () => {
      document.getElementById('controls').hidden = !document.getElementById('controls').hidden;
    });
  });
</script>

  {#snippet link(link)}
      <li
        tabindex="0"
        role="button"
      >
        <a href="#" class="links"
          ><span
            ><img
              src={link.imgsrc}
              width="24"
              height="24"
            /><span>&nbsp;</span></span
          >{link.title}</a
        ><span>&nbsp;</span><span style="color: darkred">(X)</span>
      </li>
  {/snippet}

  {#snippet window(links, title)}
    <div>
      <h2>{title}</h2>
      <ul>
        {#each links as link}
          {@link link}
        {/each}
      </ul>
    </div>
  {/snippet}

<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <link
      rel="stylesheet"
      type="text/css"
      href="bootstrap.min.css"
    />
    <link
      rel="stylesheet"
      type="text/css"
      href="tabs.css"
    />
    <title>Tabist</title>
  </head>


  <body id="body">
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
            <input type="checkbox" name="group_by_radiobutton" class="form-check-input" id="gb_window" value="Window" text="Window" checked="checked"/>By Window
            <br />
            <input
              type="checkbox"
              name="group_by_radiobutton"
              class="form-check-input"
              id="gb_domain"
              value="By Domain"
            />By Domain<br />
          </div>
          <div style="display: none" class="col-sm-5">
            <h3>Order By</h3>
            <input
              type="radio"
              name="order_by_radiobutton"
              class="form-check-input"
              id="orderby_natural"
              value="As Opened"
              text="As Opened"
            />As Opened
            <br />
            <input
              type="radio"
              name="order_by_radiobutton"
              class="form-check-input"
              id="orderby_reverse"
              value="Reverse Order"
              text="Reverse Order"
            />Reverse Order
            <br />
            <input
              type="radio"
              name="order_by_radiobutton"
              class="form-check-input"
              id="orderby_mru"
              value="Most Recently Used"
              text="Most Recently Used"
            />Most Recently Used
            <br />
          </div>
        </div>
        <a
          class="btn btn-secondary"
          id="options_link"
          href="moz-extension://04bf83d2-9d68-4107-9c70-3b567e99c224/options.html"
          >Preferences</a
        >
        <hr />
      </div>

      <div id="content">
        <div>
        {@render window(links, 'Window 1')}
        </div>
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
      <h4 id="developmentStatus"></h4>
      <a href="https://github.com/fiveNinePlusR/tabist/issues"
        >Problems? Suggestions? Report feedback or issues here</a
      >

      <!-- required by bootstrap -->
      <script src="jquery.min.js"></script>
      <script src="tether.min.js"></script>
      <script src="bootstrap.min.js"></script>
    </div>

    <script src="tabs.js"></script>
  </body>
</html>