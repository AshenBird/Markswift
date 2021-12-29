import { createApp } from 'vue'
import { createEditor } from '.';
import { BrowserAdapter } from './adapters';
import "./assets/style/index.scss";
// import { VscodeAdapter } from './adapters/vscode';

const app = createEditor(new BrowserAdapter())
createApp(app).mount('#app')
