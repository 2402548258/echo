/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './styles/index.css';
import 'vfonts/Lato.css';

import { createApp, type Plugin } from 'vue';
import App from './App.vue';
import i18n from './i18n';
import errorHandler from './utils/errorHandler';
import { createMemoryHistory, createRouter } from 'vue-router';
import TitleBar from './components/TitleBar.vue';
import DragRegion from './components/DragRegion.vue';

const router = createRouter({
    history: createMemoryHistory(),
    routes: [{
        path: '/',
        component: () => import('./view/index.vue'),
        children: [
            {
                path: '/',
                redirect: 'conversation'
            },
            {
                name: 'conversation',
                path: 'conversation/:id?',
                component: () => import('./view/conversation.vue')
            }
        ]
    }],
})

const components: Plugin = function (app) {
    app.component(TitleBar.name!, TitleBar);
    app.component(DragRegion.name!, DragRegion);
}

const pinia = createPinia()



createApp(App)
    .use(pinia)
    .use(components)
    .use(router)
    .use(i18n)
    .use(errorHandler)
    .mount('#app');
