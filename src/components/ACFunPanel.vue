<template>
  <v-container style="max-width: 100%!important;">
    <div class="text-center">
      <v-dialog v-model="dialogShow" width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2">
            {{dialogText}}： {{dialogUserName}} ({{dialogUserId}}) 么？
          </v-card-title>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="danger" text @click="dialogRun">
              确定
            </v-btn>
            <v-btn color="primary" text @click="dialogClose">
              取消
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <v-container v-if="!$store.state.config.isLogin" style="max-width: 100%!important;">
      请先登录
    </v-container>
    <v-container v-if="$store.state.config.isLogin" style="max-width: 100%!important;">
      AC直播助手版本：{{$version}}，房间号：{{$store.state.ACFunCommon.userId}}
      <v-tabs>
        <v-tab>
          首页
        </v-tab>
        <v-tab>
          观众列表
        </v-tab>
        <v-tab>
          房管列表
        </v-tab>
        <v-tab>
          拉黑列表
        </v-tab>
        <v-tab-item>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="danmakuText" type="text" label="弹幕内容(按回车发出)"
                @keyup.enter="sendDanmaku(danmakuText)"></v-text-field>
              <v-btn class="ma-2" elevation="2" color="error" @click="sendDanmaku(danmakuText)">发送弹幕</v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn class="ma-2" elevation="2" color="success" @click="switchDanmakuHime">开启/关闭弹幕显示</v-btn>
              <v-btn class="ma-2" elevation="2" color="success" @click="switchDanmakuFrame">开启/关闭弹幕悬浮窗</v-btn>
              <v-btn class="ma-2" elevation="2" color="warning" @click="clearDanmakuList">清除历史弹幕</v-btn>
            </v-col>
            <v-col cols="12" md="12">
              弹幕情况 (liveID：{{$store.state.roomInfo.liveId}})
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        发送时间
                      </th>
                      <th class="text-left">
                        用户名
                      </th>
                      <th class="text-left">
                        UID
                      </th>
                      <th class="text-left">
                        弹幕内容
                      </th>
                      <th class="text-left">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in $store.state.roomInfo.danmakuList" :key="item.uniqueId">
                      <td>{{ item.time * 1000 | formatDate }}</td>
                      <td>{{ item.nickname }}</td>
                      <td>{{ item.userId }}</td>
                      <td>{{ item.content }}</td>
                      <v-btn class="ma-2" elevation="2" color="warning"
                        @click="dialogSet('addManager', item.nickname, item.userId)">房管</v-btn>
                      <v-btn class="ma-2" elevation="2" color="error"
                        @click="dialogSet('kick', item.nickname, item.userId)">踢出</v-btn>
                      <v-btn class="ma-2" elevation="2" @click="dialogSet('block', item.nickname, item.userId)">拉黑
                      </v-btn>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item>
          <v-row>
            <v-col cols="12" md="12">
              可读取的在线观众 ({{$store.state.roomInfo.watchingList.length}})
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        用户名
                      </th>
                      <th class="text-left">
                        UID
                      </th>
                      <th class="text-left">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in $store.state.roomInfo.watchingList" :key="item.userId">
                      <td>{{ item.nickname }}</td>
                      <td>{{ item.userId }}</td>
                      <v-btn class="ma-2" elevation="2" color="warning"
                        @click="dialogSet('addManager', item.nickname, item.userId)">房管</v-btn>
                      <v-btn class="ma-2" elevation="2" color="error"
                        @click="dialogSet('kick', item.nickname, item.userId)">踢出</v-btn>
                      <v-btn class="ma-2" elevation="2" @click="dialogSet('block', item.nickname, item.userId)">拉黑
                      </v-btn>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item>
          <v-row>
            <v-col cols="12" md="12">
              房管列表 ({{$store.state.roomInfo.managerList.length}})
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        用户名
                      </th>
                      <th class="text-left">
                        UID
                      </th>
                      <th class="text-left">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in $store.state.roomInfo.managerList" :key="item.userId">
                      <td>{{ item.nickname }}</td>
                      <td>{{ item.userId }}</td>
                      <v-btn class="ma-2" elevation="2" color="error"
                        @click="dialogSet('deleteManager', item.nickname, item.userId)">取消</v-btn>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item>
          <v-row>
            <v-col cols="12" md="12">
              拉黑列表 ({{$store.state.roomInfo.blockList.length}})
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        用户名
                      </th>
                      <th class="text-left">
                        UID
                      </th>
                      <th class="text-left">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in $store.state.roomInfo.blockList" :key="item.userId">
                      <td>{{ item.nickname }}</td>
                      <td>{{ item.userId }}</td>
                      <v-btn class="ma-2" elevation="2" @click="dialogSet('unblock', item.nickname, item.userId)">解除拉黑
                      </v-btn>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs>
    </v-container>
  </v-container>
</template>

<script>
import eConfig from "electron-config"
import cookie from "cookie"
import got from "got"
import { remote } from 'electron'
import { formatDate } from '@/utils/timeFormat'

export default {
  name: 'ACFunPanel',
  data: () => ({
    //弹窗
    dialogShow: false,
    dialogText: "",
    dialogUserName: "",
    dialogUserId: "",
    dialogAction: "",

    fetchWatchingListTimer: 0,
    fetchManagerListTimer: 0,
    danmakuWindow: null,
    danmakuFrame: null,
    danmakuText: "",
  }),
  watch: {
    categoryId: {
      handler(val) {
        this.more = this.categoryMore[val]
      }
    }
  },
  filters: {
    formatDate(time) {
      let date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  },
  async created() {
    this.$store.watch((state) => state.roomInfo.liveId, async (newValue, oldValue) => {
      console.log('助手组件：liveId变更：' + oldValue + ' -> ' + newValue)
      if (newValue != "") {
        this.$store.state.snackbar.text = "检测到开播"
        this.$store.state.snackbar.show = true
      }
    }).bind(this)

    this.$store.watch((state) => state.roomInfo.isLive, async (newValue, oldValue) => {
      console.log('助手组件：直播状态变更：' + oldValue + ' -> ' + newValue)
      if (!newValue) {
        this.$store.state.roomInfo.watchingList = []
      }
    }).bind(this)

    window.setInterval(this.loadRoom, 2 * 1000)
    window.setInterval(this.fetchManagerList, 2 * 1000)
  },
  methods: {
    dialogSet(action, username, userid) {
      switch (action) {
        case "addManager":
          this.dialogText = "是否添加为房管"
          break
        case "deleteManager":
          this.dialogText = "是否移除房管"
          break
        case "block":
          this.dialogText = "是否拉黑观众"
          break
        case "unblock":
          this.dialogText = "是否取消拉黑观众"
          break
        case "kick":
          this.dialogText = "是否踢出观众"
          break
      }
      this.dialogUserName = username
      this.dialogUserId = userid
      this.dialogAction = action
      this.dialogShow = true
    },
    dialogRun() {
      switch (this.dialogAction) {
        case "addManager":
          this.addManager(this.dialogUserName, this.dialogUserId)
          break
        case "deleteManager":
          this.deleteManager(this.dialogUserName, this.dialogUserId)
          break
        case "block":
          this.blockUser(this.dialogUserName, this.dialogUserId)
          break
        case "unblock":
          this.unblockUser(this.dialogUserName, this.dialogUserId)
          break
        case "kick":
          this.kickUser(this.dialogUserName, this.dialogUserId)
          break
      }
      this.dialogClose()
    },
    dialogClose() {
      this.dialogShow = false
      this.dialogText = ""
      this.dialogUserName = ""
      this.dialogUserId = ""
      this.dialogAction = ""
    },
    async loadRoom() {
      if (this.$store.state.config.isLogin) {
        var liveId = await this.getLiveId(this.$store.state.ACFunCommon.userId)
        if (liveId) {
          this.$store.state.roomInfo.isLive = true
          this.$store.state.roomInfo.liveId = liveId
          this.fetchWatchingList()
        } else {
          this.$store.state.roomInfo.isLive = false
        }
      }
    },
    async getLiveId(roomId) {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://live.acfun.cn/rest/pc-direct/user/userInfo?userId=" + roomId,
        "https://www.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {}
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 0) {
        if (resJson.profile.liveId !== undefined) {
          return resJson.profile.liveId
        } else {
          return false
        }
      } else {
        return false
      }
    },
    async sendDanmaku(Danmaku) {
      if (this.$store.state.roomInfo.isLive) {
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
          this.$store.state.snackbar.text = "弹幕 " + Danmaku + " 发送成功"
          this.$store.state.snackbar.show = true
          this.$store.commit('addLog', "弹幕 " + Danmaku + " 发送成功")
        } else {
          this.$store.commit('addLog', "弹幕 " + Danmaku + " 发送失败（" + resJson.error_msg + "）")
          this.$store.state.snackbar.text = resJson.error_msg
          this.$store.state.snackbar.show = true
        }
      } else {
        this.$store.state.snackbar.text = "请先开播"
        this.$store.state.snackbar.show = true
      }
    },
    async fetchWatchingList() {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/watchingList?subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=" + this.$store.state.ACFunCommon.userId + "&did=" + this.$store.state.ACFunCommon.acfunDid + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST,
        "https://www.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {
          visitorId: this.$store.state.ACFunCommon.userId,
          liveId: this.$store.state.roomInfo.liveId,
        }
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        for (let i = 0; i < resJson.data.list.length; i++) {
          const element = resJson.data.list[i];
          let result = this.$store.state.roomInfo.watchingList.find(c => Number(c.userId) === element.userId)
          let blockResult = this.$store.state.roomInfo.blockList.find(c => Number(c.userId) === element.userId)
          if (blockResult) {
            this.$store.commit('addLog', "检测到黑名单观众 " + element.nickname + "(" + element.userId + ")")
            await this.kickUser(element.nickname, element.userId)
          }
          if (!result && element.userId !== this.userId && element.anonymousUser == false) {
            this.$store.state.roomInfo.watchingList.push(element)
          }
        }
        for (let i = 0; i < this.$store.state.roomInfo.watchingList.length; i++) {
          const element = this.$store.state.roomInfo.watchingList[i];
          let result = resJson.data.list.find(c => Number(c.userId) === element.userId)
          if (!result) {
            this.$store.state.roomInfo.watchingList.splice(i, 1)
          }
        }
      }
    },
    async fetchManagerList() {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/author/action/manager/list?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" + this.$store.state.ACFunCommon.userId + "&did=" + this.$store.state.ACFunCommon.acfunDid + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST + "&visitorId=" + this.$store.state.ACFunCommon.userId + "&liveId=",
        "https://member.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {
          visitorId: this.$store.state.ACFunCommon.userId,
          liveId: "",
        }
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        for (let i = 0; i < resJson.data.list.length; i++) {
          const element = resJson.data.list[i];
          let result = this.$store.state.roomInfo.managerList.find(c => Number(c.userId) === element.userId);
          if (!result && element.userId !== this.userId) {
            this.$store.state.roomInfo.managerList.push(element)
          }
        }
        for (let i = 0; i < this.$store.state.roomInfo.managerList.length; i++) {
          const element = this.$store.state.roomInfo.managerList[i];
          let result = resJson.data.list.find(c => Number(c.userId) === element.userId);
          if (!result) {
            this.$store.state.roomInfo.managerList.splice(i, 1)
          }
        }
      }
    },
    async kickUser(userName, userId) {
      if (this.$store.state.roomInfo.isLive) {
        //房管："https://api.kuaishouzt.com/rest/zt/live/web/manager/kick?subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=" + this.$store.state.ACFunCommon.userId + "&did=" + this.$store.state.ACFunCommon.acfunDid + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST,        
        var res = await this.$ACFunCommon.postHTTPResult(
          "https://api.kuaishouzt.com/rest/zt/live/web/author/action/kick?subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=" + this.$store.state.ACFunCommon.userId + "&did=" + this.$store.state.ACFunCommon.acfunDid + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST,
          "https://live.acfun.cn",
          this.$store.state.ACFunCommon.acfunCookies,
          {
            visitorId: this.$store.state.ACFunCommon.userId,
            liveId: this.$store.state.roomInfo.liveId,
            kickedUserId: userId,
          }
        )
        var resJson = JSON.parse(res.body)
        if (resJson.result == 1) {
          this.$store.commit('addLog', "主播账号踢人 " + userName + "(" + userId + ") 成功")
        } else {
          this.$store.commit('addLog', "主播账号踢人 " + userName + "(" + userId + ") 失败（" + resJson.error_msg + "）")
          this.$store.state.snackbar.text = resJson.error_msg
          this.$store.state.snackbar.show = true
        }
      } else {
        this.$store.state.snackbar.text = "请先开播"
        this.$store.state.snackbar.show = true
      }
    },
    async addManager(userName, ManagerId) {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/author/action/manager/add?kpn=ACFUN_APP&subBiz=mainApp&kpf=PC_WEB&userId=" + this.$store.state.ACFunCommon.userId + "&did=" + this.$store.state.ACFunCommon.acfunDid + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST + "&visitorId=" + this.$store.state.ACFunCommon.userId + "&managerUserId=" + ManagerId,
        "https://member.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {}
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        this.$store.commit('addLog', "添加房管 " + userName + "(" + ManagerId + ") 成功")
        this.$store.state.snackbar.text = "操作成功"
        this.$store.state.snackbar.show = true
      } else {
        this.$store.commit('addLog', "添加房管 " + userName + "(" + ManagerId + ") 失败（" + resJson.error_msg + "）")
        this.$store.state.snackbar.text = resJson.error_msg
        this.$store.state.snackbar.show = true
      }
    },
    async deleteManager(userName, ManagerId) {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/author/action/manager/delete?kpn=ACFUN_APP&subBiz=mainApp&kpf=PC_WEB&userId=" + this.$store.state.ACFunCommon.userId + "&did=" + this.$store.state.ACFunCommon.acfunDid + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST + "&visitorId=" + this.$store.state.ACFunCommon.userId + "&managerUserId=" + ManagerId,
        "https://member.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {}
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        this.$store.commit('addLog', "移除房管 " + userName + "(" + ManagerId + ") 成功")
        this.$store.state.snackbar.text = "操作成功"
        this.$store.state.snackbar.show = true
      } else {
        this.$store.commit('addLog', "移除房管 " + userName + "(" + ManagerId + ") 失败（" + resJson.error_msg + "）")
        this.$store.state.snackbar.text = resJson.error_msg
        this.$store.state.snackbar.show = true
      }
    },
    blockUser(userName, userId) {
      this.$store.state.roomInfo.blockList.unshift({
        nickname: userName,
        userId: userId,
      })
      this.$store.commit('addLog', "拉黑观众 " + userName + "(" + userId + ") 成功")
      this.$ACFunCommon.saveNewData(this)
      this.$store.state.snackbar.text = "操作成功"
      this.$store.state.snackbar.show = true
    },
    unblockUser(userName, userId) {
      let result = this.$store.state.roomInfo.blockList.find(c => Number(c.userId) === userId)
      if (result) {
        this.$store.state.roomInfo.blockList.splice(result, 1)
        this.$store.commit('addLog', "取消拉黑观众 " + userName + "(" + userId + ") 成功")
        this.$ACFunCommon.saveNewData(this)
        this.$store.state.snackbar.text = "操作成功"
        this.$store.state.snackbar.show = true
      }
    },
    switchDanmakuHime() {
      if (this.danmakuWindow == null) {
        this.$ACFunCommon.saveNewData(this)
        const winUrl = process.env.NODE_ENV === 'development' ? `http://localhost:8080/#/danmakuHime` : `file://${__dirname}/index.html#danmakuHime`;
        this.danmakuWindow = new remote.BrowserWindow({
          titleBarStyle: 'hidden',
          frame: false,
          width: 400,
          height: 600,
          transparent: true,
          webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            webviewTag: true
          }
        })
        //this.danmakuWindow.webContents.openDevTools()
        this.danmakuWindow.on('closed', () => { this.danmakuWindow = null })
        this.danmakuWindow.loadURL(winUrl)
        this.danmakuWindow.setAlwaysOnTop(true);
      } else {
        this.danmakuWindow.close()
        this.danmakuWindow = null
      }
    },
    switchDanmakuFrame() {
      if (this.danmakuFrame == null) {
        const winUrl = process.env.NODE_ENV === 'development' ? `http://localhost:8080/#/danmakuFrame` : `file://${__dirname}/index.html#danmakuFrame`;
        this.danmakuFrame = new remote.BrowserWindow({
          titleBarStyle: 'hidden',
          frame: false,
          width: 400,
          height: 220,
          transparent: true,
          webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            webviewTag: true
          }
        })
        //this.danmakuFrame.webContents.openDevTools()
        this.danmakuFrame.on('closed', () => { this.danmakuFrame = null })
        this.danmakuFrame.loadURL(winUrl)
        this.danmakuFrame.setAlwaysOnTop(true);
      } else {
        this.danmakuFrame.close()
        this.danmakuFrame = null
      }
    },
    clearDanmakuList() {
      this.$store.state.roomInfo.danmakuList = []
    }
  }
}
</script>
