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


Vue.prototype.$version = "0.2.9"
Vue.prototype.$ACFunCommon = ACFunCommon

const store = new Vuex.Store({
  state: {
    config: {
      isLogin: false,
    },
    ACFunCommon: {
      userName: "",
      userId: "",
      acfunCookies: [],
      acfunDid: [],
      acfunST: "",
    },
    roomInfo: {
      isLive: false,
      onlineCount: 0,
      watchingList: [],
      managerList: [],
      blockList: [],
      danmakuList: [],
      liveId: "",
    },
    TTSInfo: {
      isTTS: false,
      TTSList: [],
      TTSspeed: 6,
      TTSpitch: 6,
      TTSvolume: 6,
      TTSperson: 0,
      TTSgift: true
    },
    liveInfo: {
      isLive: false,
      useGif: false,
      liveCover: null,
      liveCoverGif: null,
      liveCoverGifFile: null,
      liveTitle: "",
      liveCategoryId: 0,
      liveConcreteId: 0,
      liveStreamName: "",
      liveStreamPhotoKey: "",
      liveStreamUrl: "",
      liveStreamKey: "",
      liveId: "",
    },
    summaryInfo: {
      liveId: "",
      diamond: 0,
      gift: 0,
      glodBanana: 0,
      watchCount: 0,
      likeCount: 0,
      liveDurationMs: "00:00:00",
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
