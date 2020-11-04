<template>
  <v-app id="inspire">
    <v-navigation-drawer v-if="$route.meta.navShow" permanent expand-on-hover app>
      <v-list nav>
        <v-list-item v-for="item in items" :key="item.title" :to="item.link" link v-show="getIsShow(item.needIsLogin)">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
      <v-snackbar v-model="$store.state.snackbar.show">
        {{ $store.state.snackbar.text }}
        <template v-slot:action="{ attrs }">
          <v-btn v-bind="attrs" color="pink" text @click="$store.state.snackbar.show = false">
            关闭
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
  },

  data() {
    return {
      items: [
        { title: '账号信息', icon: 'mdi-account-box', link: '/account', needIsLogin: false },
        { title: '弹幕助手', icon: 'mdi-view-dashboard', link: '/', needIsLogin: true },
        { title: '直播开播', icon: 'mdi-remote', link: '/live', needIsLogin: true },
        { title: '日志', icon: 'mdi-history', link: '/log', needIsLogin: false },
        { title: '关于', icon: 'mdi-help-box', link: '/about', needIsLogin: false },
      ],
      right: null,
    }
  },
  created() {
    //监听isLogin，判断登录状态
    this.$store.watch((state) => state.config.isLogin, (newValue, oldValue) => {
      if (newValue == true) {
        this.$ACFunCommon.getLoginDataFromCookies(this)
      }
      console.log('登录状态变更：' + oldValue + ' -> ' + newValue)
    }).bind(this)

    //监听isLive，判断直播状态变更，如果开播自动拉LiveId
    this.$store.watch((state) => state.liveInfo.isLive, (newValue, oldValue) => {
      console.log('直播状态变更：' + oldValue + ' -> ' + newValue)
    }).bind(this)

    //拉缓存信息
    this.$ACFunCommon.getSavedData(this)
    this.$ACFunCommon.getDid(this)
    if (this.$store.state.ACFunCommon.acfunCookies !== []) {
      this.$store.state.config.isLogin = true
    }
  },
  methods: {
    getIsShow(status) {
      if (status && this.$store.state.config.isLogin) {
        return true
      } else if (!status) {
        return true
      }
      return false
    }
  }
}


</script>
