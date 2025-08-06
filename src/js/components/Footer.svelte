<script>
  let exeTime = props.end - props.start;
  let wins = props.totalNumberWindows;
  let tabs = props.totalTabs;
  let avgTabs = tabs / (wins + 0.0);
</script>


<div>
  <h2>Total Windows: {wins}</h2>
  <h2>Total Tabs: {tabs}</h2>
  <h2>Average Tabs Per Window: {avgTabs.toFixed(2)}</h2>
  <h4>Created In: {exeTime}ms</h4>
</div>
