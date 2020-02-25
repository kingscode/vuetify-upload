import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import App from './App.vue';
import VuetifyUpload from '../src/index.js';
import '@mdi/font/css/materialdesignicons.css'
Vue.use(Vuetify);
Vue.use(VuetifyUpload);
const vuetify = new Vuetify({});
new Vue({
    vuetify,
    render: h => h(App),
}).$mount('#app');
