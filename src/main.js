import Vue from 'vue'
import App from './App.vue'
import ACFunCommon from './ACFunCommon.vue'
import './registerServiceWorker'
import router from './router'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import Vuex from 'vuex'

Vue.config.productionTip = false
import VImageInput from 'vuetify-image-input/a-la-carte';
import VueClipboard from 'vue-clipboard2'

Vue.component("v-image-input", VImageInput);
VueClipboard.config.autoSetContainer = true
Vue.use(VueClipboard)
Vue.use(Vuex)


Vue.prototype.$version = "0.2.1"
Vue.prototype.$ACFunCommon = ACFunCommon

const store = new Vuex.Store({
  state: {
    config: {
      isLogin: false,
      roomId: "",
    },
    ACFunCommon: {
      userName: "",
      userId: "",
      acfunCookies: [],
      acfunDid: [],
      acfunST: "",
    },
    roomInfo: {
      watchingList: [],
      managerList: [],
      blockList: [],
      liveId: "",
    },
    liveInfo: {
      isLive: false,
      liveCover: null,
      liveTitle: "",
      liveCategoryId: 0,
      liveConcreteId: 0,
      liveStreamName: "",
      liveStreamPhotoKey: "",
      liveStreamUrl: "",
      liveStreamKey: "",
      liveId: "",
    },
    logList: [],
    snackbar: {
      text: "(/=-=)/",
      show: false,
    },
  },
  mutations: {
    addLog(state, content) {
      state.logList.unshift({
        logTime: Date.now(),
        logContent: content,
      })
    }
  }
})

new Vue({
  store: store,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
