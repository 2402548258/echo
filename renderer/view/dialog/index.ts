
import 'vfonts/Lato.css';
import '../../styles/index.css'
import { createApp, type Plugin } from 'vue';
import errorHandler from '@renderer/utils/errorHandler';
import i18n from '@renderer/i18n';
import TitleBar from '@renderer/components/TitleBar.vue';
import DragRegion from '@renderer/components/DragRegion.vue';

import Dialog from './index.vue';


const components: Plugin = function (app) {
    app.component(TitleBar.name!, TitleBar);
    app.component(DragRegion.name!, DragRegion);
}


createApp(Dialog)
    .use(i18n)
    .use(errorHandler)
    .use(components)
    .mount('#app')