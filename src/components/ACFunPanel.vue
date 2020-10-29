<template>
  <v-container>
    <v-container v-if="!isLogin">
      登录A站账号
      <v-text-field
        v-model="account"
        label="手机号或邮箱"
        required
      ></v-text-field>
  
      <v-text-field type="password"
        v-model="password"
        label="密码"
        required
      ></v-text-field>
  
      <v-btn
        color="success"
        class="mr-4"
        @click="loginToACFun"
      >
        登录
      </v-btn>
    </v-container>
    <v-container v-if="isLogin">
      欢迎你，{{userName}}
      <v-row>
        <v-col cols="12" md="12">
          <v-text-field v-model="RoomID" type="number" label="直播间ID"></v-text-field>
          <v-btn class="ma-2" elevation="2" color="primary" @click="loadRoom">进入房间</v-btn>
          <v-btn class="ma-2" elevation="2" color="warning" @click="leaveRoom">退出房间</v-btn>
          <v-btn class="ma-2" elevation="2" color="error" @click="quitAccount">登出账号</v-btn>
        </v-col>
        <v-col cols="12" md="12">
          <v-btn class="ma-2" elevation="2" color="success" @click="startDanmakuHime">启动弹幕姬</v-btn>
          <v-btn class="ma-2" elevation="2" color="error" @click="stopDanmakuHime">停止弹幕姬</v-btn>
        </v-col>
        <v-col cols="12" md="12">
          <v-text-field v-model="danmakuText" type="text" label="弹幕内容"></v-text-field>
          <v-btn class="ma-2" elevation="2" color="error" @click="sendDanmaku(danmakuText)">发送弹幕</v-btn>
        </v-col>
        <v-col cols="12" md="6">
          在线观众
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
                <tr v-for="item in WatchingList" :key="item.userId">
                  <td>{{ item.nickname }}</td>
                  <td>{{ item.userId }}</td>
                  <v-btn class="ma-2" elevation="2" color="error" @click="kickUser(item.nickname, item.userId)">踢出</v-btn>
                </tr>
                </tbody>
            </template>
          </v-simple-table>
        </v-col>
        <v-col cols="12" md="6">
          系统日志
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    日志时间
                  </th>
                  <th class="text-left">
                    日志内容
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in LogList" :key="item.name">
                  <td>{{ item.logTime }}</td>
                  <td>{{ item.logContent }}</td>
                </tr>
                </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar v-model="snackbar">
        {{ text }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
  import * as urlConfig from '@/api/urlConfig'
  import eConfig from "electron-config"
  import cookie from "cookie"
  import got from "got"
  import { remote, ipcRenderer  } from 'electron'
  const econfig = new eConfig();

  export default {
    name: 'ACFunPanel',
    data: () => ({
      ipcRenderer: null,
      snackbar: false,
      text: `(/=-=)/`,
      account: "",
      password: "",
      isLogin: false,
      userName: "",
      userId: "",
      did: "",
      midground: "",
      loginCookies: {},

      RoomID: 0,
      LiveId: 0,
      DanmakuList: [],
      WatchingList: [],
      LogList: [],
      fetchWatchingListTimer: 0,
      danmakuWindow: null,

      danmakuText: ""
    }),
    async created() {
      await this.getDid()
      this.getCookiesFromLogin()
      this.syncSavedData()
    },
    methods:{
      async loginToACFun(){
        if(this.account !== "" && this.password !== ""){
          const res = await got(urlConfig.DEFAULT_CONFIG.acfun_signin, {
            method: "POST",
            headers: {
              Referer: "https://www.acfun.cn",
            },
            form: {
              username: this.account,
              password: this.password,
            },
          })
          var resJson = JSON.parse(res.body)
          if (resJson.result == 0) {
            this.isLogin = true
            this.userName = resJson.username
            this.userId = resJson.userId
            this.loginCookies = res.headers["set-cookie"]
            econfig.set("loginCookies", this.loginCookies)
          }else{
            this.text = resJson.error_msg
            this.snackbar = true
          }
        }else{
          this.text = "请好好输入A站用户名和密码"
          this.snackbar = true
        }
      },
      async getCookiesFromLogin(){
        this.loginCookies = econfig.get("loginCookies")
        const res = await got(urlConfig.DEFAULT_CONFIG.acfun_personalInfo, {
          method: "GET",
          headers: {
            cookie: this.loginCookies,
          },
        })
        var resJson = JSON.parse(res.body)
        if(resJson.result == 0){
          this.isLogin = true
          this.userName = resJson.info.userName
          this.userId = resJson.info.userId
          var did = "_did=" + this.did
          this.loginCookies.push(did)
        }
      },
      async getDid(){
        var res = await got(urlConfig.DEFAULT_CONFIG.acfun_login);
        var did_cookie = cookie.parse(res.headers["set-cookie"][1]);
        this.did = did_cookie._did
      },
      syncSavedData(){
        this.RoomID = econfig.get("roomID")
        this.LogList.unshift({
          logTime: Date.now(),
          logContent: "读取缓存内容完成"
        })
      },
      async loadRoom(){
        econfig.set("roomID", this.RoomID)
        const res = await got(urlConfig.DEFAULT_CONFIG.acfun_tokenGet, {
          method: "POST",
          headers: {
            Referer: "https://www.acfun.cn",
            cookie: this.loginCookies,
          },
          form: {
            sid: "acfun.midground.api",
          },
        })
        var resJson = JSON.parse(res.body)
        if(resJson.result == 0){
          this.midground = resJson["acfun.midground.api_st"]
          const res = await got(urlConfig.DEFAULT_CONFIG.acfun_userInfo + this.RoomID, {
            method: "POST",
            headers: {
              Referer: "https://www.acfun.cn",
              cookie: this.loginCookies,
            },
          })
          var resJson = JSON.parse(res.body)
          if(resJson.result == 0){
            if(resJson.profile.liveId !== null){
              this.LiveId = resJson.profile.liveId
              this.LogList.unshift({
                logTime: Date.now(),
                logContent: "获取LiveID完成"
              })
              this.sendDanmaku("进入成功")
              this.fetchWatchingListTimer = window.setInterval(this.fetchWatchingList, 1 * 1000)
            }else{
              this.text = "房间暂未直播"
              this.snackbar = true
            }
          }else{
            this.text = resJson.error_msg
            this.snackbar = true
          }
        }else{
          this.text = resJson.error_msg
          this.snackbar = true
        }
      },
      async sendDanmaku(Danmaku){
        if(this.LiveId != ""){
          const res = await got("https://api.kuaishouzt.com/rest/zt/live/web/audience/action/comment?subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=" + this.userId + "&did=" + this.did + "&acfun.midground.api_st=" + this.midground, {
            method: "POST",
            headers: {
              Referer: "https://www.acfun.cn",
              cookie: this.loginCookies,
            },
            form: {
              visitorId: this.userId,
              liveId: this.LiveId,
              content: Danmaku
            },
          })
          var resJson = JSON.parse(res.body)
          if(resJson.result == 1){
            this.danmakuText = ""
            this.LogList.unshift({
              logTime: Date.now(),
              logContent: "弹幕 " + Danmaku + " 发送成功"
            })
          }
        }else{
          this.text = "请先进入直播间"
          this.snackbar = true
        }
      },
      async kickUser(userName, userId){
        if(this.userId == this.RoomID){
          const res = await got("https://api.kuaishouzt.com/rest/zt/live/web/author/action/kick?subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=" + this.userId + "&did=" + this.did + "&acfun.midground.api_st=" + this.midground, {
            method: "POST",
            headers: {
              Referer: "https://live.acfun.cn",
              cookie: this.loginCookies,
            },
            form: {
              visitorId: this.userId,
              liveId: this.LiveId,
              kickedUserId: userId,
            },
          })
          var resJson = JSON.parse(res.body)
          if(resJson.result == 1){
            this.LogList.unshift({
              logTime: Date.now(),
              logContent: "主播账号踢人 " + userName + "(" + userId + ") 成功"
            })
          }
        }else{
          const res = await got("https://api.kuaishouzt.com/rest/zt/live/web/manager/kick?subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=" + this.userId + "&did=" + this.did + "&acfun.midground.api_st=" + this.midground, {
            method: "POST",
            headers: {
              Referer: "https://live.acfun.cn",
              cookie: this.loginCookies,
            },
            form: {
              visitorId: this.userId,
              liveId: this.LiveId,
              kickedUserId: userId,
            },
          })
          var resJson = JSON.parse(res.body)
          if(resJson.result == 1){
            this.LogList.unshift({
              logTime: Date.now(),
              logContent: "房管账号踢人 " + userName + "(" + userId + ") 成功"
            })
          }
        }
      },
      leaveRoom(){
        window.clearInterval(this.fetchWatchingListTimer)
        this.WatchingList = []
        this.LogList.unshift({
          logTime: Date.now(),
          logContent: "退出房间"
        })
      },
      async fetchWatchingList(){
        const res = await got("https://api.kuaishouzt.com/rest/zt/live/web/watchingList?subBiz=mainApp&kpn=ACFUN_APP&kpf=PC_WEB&userId=" + this.userId + "&did=" + this.did + "&acfun.midground.api_st=" + this.midground, {
          method: "POST",
          headers: {
            Referer: "https://www.acfun.cn",
            cookie: this.loginCookies,
          },
          form: {
            visitorId: this.userId,
            liveId: this.LiveId,
          },
        })
        var resJson = JSON.parse(res.body)
        if(resJson.result == 1){
          for (let i = 0; i < resJson.data.list.length; i++) {
            const element = resJson.data.list[i];
            let result = this.WatchingList.find(c => Number(c.userId) === element.userId);
            if(!result && element.userId !== this.userId){
              this.WatchingList.push(element)
            }
          }
          for (let i = 0; i < this.WatchingList.length; i++) {
            const element = this.WatchingList[i];
            let result = resJson.data.list.find(c => Number(c.userId) === element.userId);
            if(!result){
              this.WatchingList.splice(i, 1)
            }
          }
        }
      },
      quitAccount(){
        this.isLogin = false
        this.loginCookies = {}
        this.WatchingList = []
        this.LogList = []
        econfig.set("loginCookies", [])
      },
      startDanmakuHime(){
        if(this.danmakuWindow == null && this.RoomID != null){
          econfig.set("roomID", this.RoomID)
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
        }
      },
      stopDanmakuHime(){
        if(this.danmakuWindow != null){
          this.danmakuWindow.close()
          this.danmakuWindow = null
        }
      }
    } 
  }
</script>
