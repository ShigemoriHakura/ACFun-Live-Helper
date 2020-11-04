<template>
  <div class="account">
    <v-container style="max-width: 100% !important">
      <v-container v-if="$store.state.config.isLogin" style="max-width: 100% !important">
        <v-row>
          <v-col cols="12" md="6">
            欢迎你，{{$store.state.ACFunCommon.userName}}（UID：{{$store.state.ACFunCommon.userId}}）
          </v-col>
          <v-col cols="12" md="6">
            <v-btn class="ma-2" elevation="2" color="error" @click="logoutAccunt">登出账号</v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-container v-if="!$store.state.config.isLogin" style="max-width: 100%!important;">
        登录ACFun账号
        <v-text-field v-model="account" label="手机号或邮箱" required></v-text-field>

        <v-text-field type="password" v-model="password" label="密码" required></v-text-field>

        <v-btn color="success" class="mr-4" @click="loginAccount">
          登录
        </v-btn>
      </v-container>
    </v-container>
  </div>
</template>

<script>

export default {
  data: () => ({
    account: "",
    password: "",
  }),
  methods: {
    //登录主站，只有一个地方需要所以就丢这里了
    async loginAccount() {
      if (this.account !== "" && this.password !== "") {
        const res = await this.$ACFunCommon.postHTTPResult(
          "https://id.app.acfun.cn/rest/web/login/signin",
          "https://www.acfun.cn",
          [],
          {
            username: this.account,
            password: this.password,
          }
        )
        var resJson = JSON.parse(res.body)
        if (resJson.result == 0) {
          this.$store.state.config.isLogin = true
          this.$store.state.ACFunCommon.userName = resJson.username
          this.$store.state.ACFunCommon.userId = resJson.userId
          if (this.$store.state.config.roomId == "") {
            this.$store.state.config.roomId = resJson.userId
          }
          this.$store.state.ACFunCommon.acfunCookies = res.headers["set-cookie"]
          this.$ACFunCommon.saveNewData(this)
        } else {
          this.$store.state.snackbar.text = resJson.error_msg
          this.$store.state.snackbar.show = true
        }
      } else {
        this.$store.state.snackbar.text = "请好好输入A站用户名和密码"
        this.$store.state.snackbar.show = true
      }
    },
    logoutAccunt() {
      this.$store.state.config.isLogin = false
      this.$store.state.ACFunCommon.acfunCookies = {}
      this.$store.state.roomInfo.watchingList = []
      this.$store.state.roomInfo.managerList = []
      this.$ACFunCommon.saveNewData(this)
    }
  }
}
</script>