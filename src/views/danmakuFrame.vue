<template style="background-color: rgba(0, 0, 0, 0);">
  <div class="danmakuHime" style="overflow: hidden;background-color: rgba(0, 0, 0, 0);">
    <div class="window-chrome" id="window-chrome">
      <div class="app-label">弹幕助手</div>
      <div class="window-controls">
        <div class="close" @click="closeWindow"><img src="@/assets/ui/close.png" /></div>
      </div>
    </div>
    <v-container style="max-width: 100%!important;background-color: rgba(0, 0, 0, 0);">
      <v-row style="background-color: rgba(0, 0, 0, 0);">
        <v-col cols="12" md="6" style="background-color: rgba(0, 0, 0, 0);">
          <v-text-field v-model="danmakuText" type="text" label="弹幕内容(按回车发出)" @keyup.enter="sendDanmaku(danmakuText)">
          </v-text-field>
          <v-btn class="ma-2" elevation="2" color="error" @click="sendDanmaku(danmakuText)">发送弹幕</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import eConfig from "electron-config"
import { remote } from 'electron'

const econfig = new eConfig()
export default {
  data: () => ({
    danmakuText: "",
  }),
  methods: {
    closeWindow() {
      var window = remote.getCurrentWindow()
      window.close()
    },
    async sendDanmaku(Danmaku) {
      if (this.$store.state.roomInfo.liveId != "") {
        if (Danmaku == "") {
          this.$store.state.snackbar.text = "请输入内容"
          this.$store.state.snackbar.show = true
          return
        }
        var res = await this.$ACFunCommon.postHTTPResult(
          "https://api.kuaishouzt.com/rest/zt/live/web/audience/action/comment?subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=" + this.$store.state.ACFunCommon.userId + "&did=" + this.$store.state.ACFunCommon.acfunDid + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST,
          "https://www.acfun.cn",
          this.$store.state.ACFunCommon.acfunCookies,
          {
            visitorId: this.$store.state.ACFunCommon.userId,
            liveId: this.$store.state.roomInfo.liveId,
            content: Danmaku
          }
        )
        var resJson = JSON.parse(res.body)
        if (resJson.result == 1) {
          this.danmakuText = ""
          this.$store.state.snackbar.text = "发送成功"
          this.$store.state.snackbar.show = true
          return
        } else {
          this.$store.state.snackbar.text = "发送失败（" + resJson.error_msg + "）"
          this.$store.state.snackbar.show = true
          return
        }
      } else {
        var res = await this.$ACFunCommon.postHTTPResult(
          "https://live.acfun.cn/rest/pc-direct/user/userInfo?userId=" + econfig.get("config.roomId"),
          "https://www.acfun.cn",
          this.$store.state.ACFunCommon.acfunCookies,
          {}
        )
        var resJson = JSON.parse(res.body)
        if (resJson.result == 0) {
          if (resJson.profile.liveId !== undefined) {
            this.$store.state.roomInfo.liveId = resJson.profile.liveId
            this.sendDanmaku(Danmaku)
            return
          }
        }
      }
      this.$store.state.snackbar.text = "发送失败，请重试"
      this.$store.state.snackbar.show = true
    },
  }
}
</script>
<style src="@/assets/css/app.css"></style>