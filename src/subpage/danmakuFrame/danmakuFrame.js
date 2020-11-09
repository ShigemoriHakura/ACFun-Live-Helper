import Vue from 'vue'
import vuetify from '@/plugins/vuetify';
import danmakuFrame from './danmakuFrame.vue'
import ACFunCommon from '@/ACFunCommon.vue'
import Vuex from 'vuex'
Vue.use(Vuex)

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
      liveId: "",
    },
    snackbar: {
      text: "(/=-=)/",
      show: false,
    },
  }
})

new Vue({
  store: store,
  vuetify,
  render: h => h(danmakuFrame)
}).$mount('#app')