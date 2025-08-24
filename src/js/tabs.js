
import { mount } from 'svelte';
import Tabs from './Tabs.svelte';
// import './app.css';

const app = mount(Tabs,{
  target: document.getElementById('app'),
});

export default app;
