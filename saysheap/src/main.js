import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Colada, { PiniaColadaPlugin } from 'colada-plugin';
import { useSettingsStore } from "./store/settings";
import { useDbStore } from "./store/db";



const pinia = createPinia()


const app = createApp(App)

pinia.use(PiniaColadaPlugin);

app.use(Colada);
app.use(pinia)
const settingsStore = useSettingsStore();
const dbStore = useDbStore();
app.use(router)


app.mount('#app')
