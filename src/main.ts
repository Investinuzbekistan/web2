import { createApp } from 'vue';

import App from './App.vue';
import { i18n } from './lib/i18n';
import './styles/index.css';

const root = document.getElementById('app');
if (!root) throw new Error('#app is missing from index.html');

createApp(App).use(i18n).mount(root);
