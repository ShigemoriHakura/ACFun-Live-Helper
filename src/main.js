import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false
import VImageInput from 'vuetify-image-input/a-la-carte';
import VueClipboard from 'vue-clipboard2'
import axios from 'axios'

axios.defaults.withCredentials = true;//让ajax携带cookie

Vue.prototype.$axios = axios;

Vue.component("v-image-input", VImageInput);
VueClipboard.config.autoSetContainer = true
Vue.use(VueClipboard)

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
