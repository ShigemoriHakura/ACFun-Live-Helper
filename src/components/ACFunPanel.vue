<template>
  <v-container style="max-width: 100%!important;">
    <div class="text-center">
      <v-dialog v-model="dialogShow" width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2">
            {{dialogText}}： {{dialogUserName}} ({{dialogUserId}}) ？
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
      请先登录账号再使用本功能！
    </v-container>
    <v-container v-if="$store.state.config.isLogin" style="max-width: 100%!important;">
      房间号：{{$store.state.ACFunCommon.userId}}<br>
      请注意：观众列表，投喂列表在关播后会自动清空。
      <v-tabs>
        <v-tab>
          首页
        </v-tab>
        <v-tab>
          观众列表 ({{$store.state.roomInfo.onlineCount}})
        </v-tab>
        <v-tab>
          房管列表 ({{$store.state.roomInfo.managerList.length}})
        </v-tab>
        <v-tab>
          拉黑列表 ({{$store.state.roomInfo.blockList.length}})
        </v-tab>
        <v-tab>
          投喂列表 ({{$store.state.roomInfo.billList.length}})
        </v-tab>
        <v-tab>
          弹幕播报
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
              弹幕情况 (liveID：{{getFormatLiveId()}})
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
              房管列表
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
              拉黑列表
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
        <v-tab-item>
          <v-row>
            <v-col cols="12" md="12">
              投喂列表
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
                        AC币
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in $store.state.roomInfo.billList" :key="item.userId">
                      <td>{{ item.nickname }}</td>
                      <td>{{ item.userId }}</td>
                      <td>{{ item.displaySendAmount }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item>
          <DanmakuTTS />
        </v-tab-item>
      </v-tabs>
    </v-container>
  </v-container>
</template>

<script>
import eConfig from "electron-config"
import cookie from "cookie"
import got from "got"
import { remote, shell } from 'electron'
import { formatDate } from '@/utils/timeFormat'
import yaml from "js-yaml"
import { version } from 'js-base64'
import DanmakuTTS from '@/components/Mate/DanmakuTTS.vue'

const COMMAND_JOIN_ROOM = 1
const COMMAND_ADD_TEXT = 2
const COMMAND_ADD_GIFT = 3
const COMMAND_ADD_FOLLOW = 10
const COMMAND_ADD_JOIN_GROUP = 11

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

    TTSTimer: 0,
  }),
  components: {
    DanmakuTTS,
  },
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
    this.processTTSQueue()
    this.$store.commit('addLog', "我很确信的添加了一个TTS启动的Log")

    var result = await this.$ACFunCommon.getHTTPResult(
      "https://acfun-helper.oss-cn-shanghai.aliyuncs.com/ACLiveHelper/latest.yml",
      "",
      []
    )
    const doc = yaml.safeLoad(result.body)
    if (doc.version > this.$version) {
      this.dialogSet("update", this.$version, doc.version)
    }

    this.$store.watch((state) => state.roomInfo.liveId, async (newValue, oldValue) => {
      console.log('房间助手：liveId变更：' + oldValue + ' -> ' + newValue)
      if (newValue != "") {
        this.showSnackbar("检测到开播")
      }
    }).bind(this)

    this.$store.watch((state) => state.roomInfo.isLive, async (newValue, oldValue) => {
      console.log('房间助手：直播状态变更：' + oldValue + ' -> ' + newValue)
      if (!newValue) {
        this.$store.state.roomInfo.onlineCount = 0
        this.$store.state.roomInfo.watchingList = []
        this.$store.state.roomInfo.billList = []
      }
    }).bind(this)

    this.$store.watch((state) => state.roomInfo.danmakuList, async (newValue, oldValue) => {
      var danmaku = newValue[0]
      console.log('房间助手：弹幕状态变更')
      if (this.$store.state.TTSInfo.isTTS) {
        let result = this.$store.state.TTSInfo.TTSList.find(c => Number(c.userId) === danmaku.userId)
        var push = true
        if (result) {
          if (result.content == danmaku.content) {
            push = false
            result.num += danmaku.num
          }
        }
        if (push) {
          if (danmaku.isGift && this.$store.state.TTSInfo.TTSgift) {
            this.$store.state.TTSInfo.TTSList.push(danmaku)
          } else if (!danmaku.isGift) {
            this.$store.state.TTSInfo.TTSList.push(danmaku)
          }
        }
      }
    }).bind(this)

    window.setInterval(this.loadRoom, 2 * 1000)
    window.setInterval(this.fetchManagerList, 2 * 1000)
  },
  methods: {
    showSnackbar(content) {
      this.$store.state.snackbar.text = content
      this.$store.state.snackbar.show = true
    },
    processTTSQueue() {
      try {
        //Todo: 改成处理时候再拼装
        if (this.TTSTimer != null) {
          window.clearInterval(this.TTSTimer);
        }
        if (this.$store.state.TTSInfo.TTSList.length > 0) {
          console.log("处理TTS队列")
          var danmaku = this.$store.state.TTSInfo.TTSList.splice(0, 1)
          danmaku = danmaku[0]

          var url = ""

          if (danmaku.isGift) {
            var text = this.getFormatedText(danmaku, this.$store.state.TTSInfo.TTSLang.onGift)
            url = `https://tts.baidu.com/text2audio?lan=ZH&cuid=baike&pdt=301&ctp=1&spd=` + this.$store.state.TTSInfo.TTSspeed + `&per=` + this.$store.state.TTSInfo.TTSperson + `&vol=` + this.$store.state.TTSInfo.TTSvolume + `&pit=` + this.$store.state.TTSInfo.TTSpitch + `&tex=` + encodeURI(text)
          } else {
            switch (danmaku.type) {
              case COMMAND_JOIN_ROOM:
                if (this.$store.state.TTSInfo.TTSLang.onJoin != "") {
                  var text = this.getFormatedText(danmaku, this.$store.state.TTSInfo.TTSLang.onJoin)
                  url = `https://tts.baidu.com/text2audio?lan=ZH&cuid=baike&pdt=301&ctp=1&spd=` + this.$store.state.TTSInfo.TTSspeed + `&per=` + this.$store.state.TTSInfo.TTSperson + `&vol=` + this.$store.state.TTSInfo.TTSvolume + `&pit=` + this.$store.state.TTSInfo.TTSpitch + `&tex=` + encodeURI(text)
                }
                break
              case COMMAND_ADD_TEXT:
                if (this.$store.state.TTSInfo.TTSLang.onComment != "") {
                  var text = this.getFormatedText(danmaku, this.$store.state.TTSInfo.TTSLang.onComment)
                  url = `https://tts.baidu.com/text2audio?lan=ZH&cuid=baike&pdt=301&ctp=1&spd=` + this.$store.state.TTSInfo.TTSspeed + `&per=` + this.$store.state.TTSInfo.TTSperson + `&vol=` + this.$store.state.TTSInfo.TTSvolume + `&pit=` + this.$store.state.TTSInfo.TTSpitch + `&tex=` + encodeURI(text)
                }
                break
              case COMMAND_ADD_FOLLOW:
                if (this.$store.state.TTSInfo.TTSLang.onFollow != "") {
                  var text = this.getFormatedText(danmaku, this.$store.state.TTSInfo.TTSLang.onFollow)
                  url = `https://tts.baidu.com/text2audio?lan=ZH&cuid=baike&pdt=301&ctp=1&spd=` + this.$store.state.TTSInfo.TTSspeed + `&per=` + this.$store.state.TTSInfo.TTSperson + `&vol=` + this.$store.state.TTSInfo.TTSvolume + `&pit=` + this.$store.state.TTSInfo.TTSpitch + `&tex=` + encodeURI(text)
                }
                break
              case COMMAND_ADD_JOIN_GROUP:
                if (this.$store.state.TTSInfo.TTSLang.onJoinClub != "") {
                  var text = this.getFormatedText(danmaku, this.$store.state.TTSInfo.TTSLang.onJoinClub)
                  url = `https://tts.baidu.com/text2audio?lan=ZH&cuid=baike&pdt=301&ctp=1&spd=` + this.$store.state.TTSInfo.TTSspeed + `&per=` + this.$store.state.TTSInfo.TTSperson + `&vol=` + this.$store.state.TTSInfo.TTSvolume + `&pit=` + this.$store.state.TTSInfo.TTSpitch + `&tex=` + encodeURI(text)
                }
                break
            }
          }

          if (url != "") {
            var u = new Audio(url)
            u.src = url
            u.addEventListener('play', () => {
              setTimeout(() => {
                this.TTSTimer = window.setInterval(this.processTTSQueue, u.duration * 1000)
              }, 800)
            });
            u.play().catch((e) => {
              this.$store.commit('addLog', "【TTS】出现错误：" + e.message + "，请上报开发者")
              window.clearInterval(this.TTSTimer);
              this.TTSTimer = window.setInterval(this.processTTSQueue, 0.5 * 1000)
              //console.error(e);
            });
          } else {
            this.TTSTimer = window.setInterval(this.processTTSQueue, 0.5 * 1000)
          }

        } else {
          this.TTSTimer = window.setInterval(this.processTTSQueue, 0.5 * 1000)
        }
      } catch (error) {
        this.$store.commit('addLog', "【TTS】出现错误：" + error.message + "，请上报开发者")
        window.clearInterval(this.TTSTimer);
        this.TTSTimer = window.setInterval(this.processTTSQueue, 0.5 * 1000)
      }
    },
    getFormatedText(danmaku, text) {
      if (text != null) {
        return text.replace(/%s/g, danmaku.nickname).replace(/%n/g, danmaku.num).replace(/%v/g, danmaku.content)
      } else {
        return ""
      }
    },
    getFormatLiveId() {
      if (this.$store.state.roomInfo.liveId != "") {
        return this.$store.state.roomInfo.liveId
      }
      return "暂无"
    },
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
        case "update":
          this.dialogText = "是否更新版本"
          break
      }
      this.dialogUserName = username
      this.dialogUserId = userid
      this.dialogAction = action
      this.dialogShow = true
    },
    async dialogRun() {
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
        case "update":
          var result = await this.$ACFunCommon.getHTTPResult(
            "https://acfun-helper.oss-cn-shanghai.aliyuncs.com/ACLiveHelper/latest.yml",
            "",
            []
          )
          const doc = yaml.safeLoad(result.body)
          shell.openExternal("https://acfun-helper.oss-cn-shanghai.aliyuncs.com/ACLiveHelper/" + doc.path)
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
        "https://api-new.app.acfun.cn/rest/app/live/info?authorId=" + roomId,
        "https://www.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {}
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 0) {
        if (resJson.liveId !== undefined) {
          this.$store.state.roomInfo.onlineCount = resJson.onlineCount
          return resJson.liveId
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
          this.showSnackbar("请输入内容")
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
          this.$store.commit('addLog', "弹幕 " + Danmaku + " 发送成功")
          this.showSnackbar("弹幕 " + Danmaku + " 发送成功")
        } else {
          this.$store.commit('addLog', "弹幕 " + Danmaku + " 发送失败（" + resJson.error_msg + "）")
          this.showSnackbar(resJson.error_msg)
        }
      } else {
        this.showSnackbar("请先开播")
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
          if (element.anonymousUser == false && element.userId !== this.userId) {
            let result = this.$store.state.roomInfo.watchingList.find(c => Number(c.userId) === element.userId)
            let blockResult = this.$store.state.roomInfo.blockList.find(c => Number(c.userId) === element.userId)
            let billResult = this.$store.state.roomInfo.billList.find(c => Number(c.userId) === element.userId)
            if (blockResult) {
              this.$store.commit('addLog', "检测到黑名单观众 " + element.nickname + "(" + element.userId + ")")
              await this.kickUser(element.nickname, element.userId)
            }
            if (!result) {
              this.$store.state.roomInfo.watchingList.push(element)
            }
            if (!billResult && element.displaySendAmount > 0) {
              this.$store.state.roomInfo.billList.push(element)
            } else if (billResult) {
              billResult.displaySendAmount = element.displaySendAmount
            }
          }
        }
        this.$store.state.roomInfo.billList.sort(this.sortByAmount("displaySendAmount"))
        for (let i = 0; i < this.$store.state.roomInfo.watchingList.length; i++) {
          const element = this.$store.state.roomInfo.watchingList[i];
          let result = resJson.data.list.find(c => Number(c.userId) === element.userId)
          if (!result) {
            this.$store.state.roomInfo.watchingList.splice(i, 1)
          }
        }
      }
    },
    sortByAmount(prop) {
      return function (a, b) {
        var value1 = a[prop]
        var value2 = b[prop]
        return value2 - value1
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
          this.showSnackbar(resJson.error_msg)
        }
      } else {
        this.showSnackbar("请先开播")
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
        this.showSnackbar("操作成功")
      } else {
        this.$store.commit('addLog', "添加房管 " + userName + "(" + ManagerId + ") 失败（" + resJson.error_msg + "）")
        this.showSnackbar(resJson.error_msg)
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
        this.showSnackbar("操作成功")
      } else {
        this.$store.commit('addLog', "移除房管 " + userName + "(" + ManagerId + ") 失败（" + resJson.error_msg + "）")
        this.showSnackbar(resJson.error_msg)
      }
    },
    blockUser(userName, userId) {
      this.$store.state.roomInfo.blockList.unshift({
        nickname: userName,
        userId: userId,
      })
      this.$store.commit('addLog', "拉黑观众 " + userName + "(" + userId + ") 成功")
      this.$ACFunCommon.saveNewData(this)
      this.showSnackbar("操作成功")
    },
    unblockUser(userName, userId) {
      let result = this.$store.state.roomInfo.blockList.find(c => Number(c.userId) === userId)
      if (result) {
        this.$store.state.roomInfo.blockList.splice(result, 1)
        this.$store.commit('addLog', "取消拉黑观众 " + userName + "(" + userId + ") 成功")
        this.$ACFunCommon.saveNewData(this)
        this.showSnackbar("操作成功")
      }
    },
    switchDanmakuHime() {
      if (this.danmakuWindow == null) {
        this.$ACFunCommon.saveNewData(this)
        const winUrl = process.env.NODE_ENV === 'development' ? `http://localhost:8080/danmakuHime` : `file://${__dirname}/danmakuHime.html/`;
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
        const winUrl = process.env.NODE_ENV === 'development' ? `http://localhost:8080/danmakuFrame` : `file://${__dirname}/danmakuFrame.html`;
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
