<template>
  <v-container style="max-width: 100% !important">
    <v-container v-if="$store.state.config.isLogin" style="max-width: 100% !important">
      <v-container v-if="!$store.state.liveInfo.isLive" style="max-width: 100% !important">
        <v-tabs>
          <v-tab>
            开播详情
          </v-tab>
          <v-tab>
            普通封面设置
          </v-tab>
          <v-tab>
            GIF封面设置
          </v-tab>
          <v-tab>
            OBS配置写入
          </v-tab>
          <v-tab>
            上场直播总结
          </v-tab>
          <v-tab-item>
            <v-row>
              <v-col cols="12" md="7">
                <v-img :src="getCover()"></v-img>
              </v-col>
              <v-col cols="12" md="5">
                <v-switch v-model="$store.state.liveInfo.useGifCover" label="使用GIF封面"></v-switch>
                <v-text-field v-model="$store.state.liveInfo.liveTitle" type="text" label="直播标题"></v-text-field>
                <v-select v-model="categoryId" :items="category" item-text="categoryName" item-value="categoryId"
                  label="分区">
                </v-select>
                <v-select v-model="concreteId" :items="concrete" item-text="name" item-value="id" label="具体"></v-select>
                <v-text-field v-model="$store.state.liveInfo.liveStreamUrl" type="text" label="推流地址" disabled>
                </v-text-field>
                <v-text-field v-model="$store.state.liveInfo.liveStreamKey" type="text" label="推流码" disabled>
                </v-text-field>
                <v-btn class="ma-2" elevation="2" color="primary" v-clipboard:copy="$store.state.liveInfo.liveStreamUrl"
                  v-clipboard:success="onCopy">
                  复制地址</v-btn>
                <v-btn class="ma-2" elevation="2" color="primary" v-clipboard:copy="$store.state.liveInfo.liveStreamKey"
                  v-clipboard:success="onCopy">
                  复制推流码</v-btn>
                <v-btn class="ma-2" elevation="2" color="error" @click="startLive">开播</v-btn>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item>
            <v-row>
              <v-col cols="12" md="12">
                上传封面：
                <v-image-input style="
                height: 806px!important;
                width: 1280px!important;
                overflow: unset;
              " v-model="$store.state.liveInfo.liveCover" :image-quality="0.85" clearable image-format="jpeg"
                  :imageHeight="608" :imageWidth="1080" :fullWidth="true" :fullHeight="true" :hideActions="false" />
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item>
            <v-row>
              <v-col cols="12" md="12">
                请自行裁切到1080*608
                <v-file-input v-model="$store.state.liveInfo.liveCoverGifFile" show-size counter accept="image/gif"
                  label="上传" filled prepend-icon="mdi-camera"></v-file-input>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item>
            <v-row>
              <v-col cols="12" md="12">
                请先打开本助手，再打开OBS！！！<br>
                中途中断重新开播时请关闭OBS重新打开，或重新手动复制推流码至OBS。
                <v-text-field v-model="$store.state.liveInfo.OBSFolder" type="text" label="OBS配置文件夹"></v-text-field>
                <v-btn class="ma-2" @click="testWriteOBSConfig" elevation="2" color="primary">测试写入</v-btn>
                <v-btn class="ma-2" @click="closeOBSConfig" elevation="2" color="error">关闭此功能</v-btn>
              </v-col>
              <v-col cols="12" md="12">
                设置教程：<br>
                1.打开OBS，选择文件->打开配置文件夹<br>
                2.复制下文件夹路径<br>
                3.粘贴入上方“OBS配置文件夹”中<br>
                4.点击测试写入，如果成功会提示写入成功<br>
                5.需要开播时，请先打开本助手，再打开OBS！！！<br>
                <br>
                <v-img height="237px" width="295px" src="@/assets/img/obs/1.png"></v-img>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item>
            <v-row>
              <v-col cols="12" md="12">
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">
                          名称
                        </th>
                        <th class="text-left">
                          情况
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>直播ID（如果为空则无数据）</td>
                        <td>{{$store.state.summaryInfo.liveId}}</td>
                      </tr>
                      <tr>
                        <td>得到点赞</td>
                        <td>{{$store.state.summaryInfo.likeCount}}</td>
                      </tr>
                      <tr>
                        <td>观看人数</td>
                        <td>{{$store.state.summaryInfo.watchCount}}</td>
                      </tr>
                      <tr>
                        <td>获得钻石数</td>
                        <td>{{$store.state.summaryInfo.diamond}}</td>
                      </tr>
                      <tr>
                        <td>收到礼物</td>
                        <td>{{$store.state.summaryInfo.gift}}</td>
                      </tr>
                      <tr>
                        <td>获得金香蕉数</td>
                        <td>{{$store.state.summaryInfo.glodBanana}}</td>
                      </tr>
                      <tr>
                        <td>直播时长</td>
                        <td>{{$store.state.summaryInfo.liveDurationMs}}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </v-row>
          </v-tab-item>
        </v-tabs>
      </v-container>
      <v-container v-if="$store.state.liveInfo.isLive" style="max-width: 100% !important">
        <v-row>
          <v-col cols="12" md="12">
            <v-btn class="ma-2" elevation="2" color="error" @click="stopPush">关闭直播</v-btn>
            <v-btn class="ma-2" elevation="2" color="warning" @click="changeCoverAndTitle">修改封面和标题</v-btn>
          </v-col>
          <v-tabs>
            <v-tab>
              基础设置
            </v-tab>
            <v-tab>
              普通封面上传
            </v-tab>
            <v-tab>
              GIF封面上传
            </v-tab>
            <v-tab-item>
              <v-row>
                <v-col cols="12" md="7">
                  <v-img :src="getCover()"></v-img>
                </v-col>
                <v-col cols="12" md="5">
                  <v-switch v-model="$store.state.liveInfo.useGifCover" label="使用GIF封面"></v-switch>
                  <v-text-field v-model="$store.state.liveInfo.liveTitle" type="text" label="直播标题"></v-text-field>
                </v-col>
              </v-row>
            </v-tab-item>
            <v-tab-item>
              <v-row>
                <v-col cols="12" md="12">
                  普通封面裁剪：
                  <v-image-input style="
                height: 806px!important;
                width: 1280px!important;
                overflow: unset;
              " v-model="$store.state.liveInfo.liveCover" :image-quality="0.85" clearable image-format="jpeg"
                    :imageHeight="608" :imageWidth="1080" :fullWidth="true" :fullHeight="true" :hideActions="false" />
                </v-col>
              </v-row>
            </v-tab-item>
            <v-tab-item>
              <v-row>
                <v-col cols="12" md="12">
                  上传GIF封面：<br>
                  请自行裁切到1080*608
                  <v-file-input v-model="$store.state.liveInfo.liveCoverGifFile" show-size counter accept="image/gif"
                    label="上传" filled prepend-icon="mdi-camera"></v-file-input>
                </v-col>
              </v-row>
            </v-tab-item>
          </v-tabs>
        </v-row>
      </v-container>
    </v-container>
    <v-container v-if="!$store.state.config.isLogin" style="max-width: 100%!important;">
      请先登录
    </v-container>
  </v-container>
</template>

<script>
import eConfig from "electron-config"
import cookie from "cookie"
import got from "got"
import fs from "fs"
import axios from 'axios'

const econfig = new eConfig()
let Base64 = require("js-base64").Base64

export default {
  name: "ACFunLive",
  data: () => ({
    categoryId: 0,
    concreteId: 0,
    //大分区
    category: [],
    //子分区
    concrete: [],
    //总数组
    categoryConcrete: [],
    getLiveStatusTimer: 0,
  }),
  async created() {
    this.categoryId = this.$store.state.liveInfo.liveCategoryId
    this.concreteId = this.$store.state.liveInfo.liveConcreteId

    await this.getLiveStatus()
    if (this.$store.state.config.isLogin && !this.$store.state.liveInfo.isLive) {
      await this.getLiveType()
      await this.getLiveKey()
      if (this.$store.state.liveInfo.OBSFolder != "") {
        this.readOBSConfig(this.$store.state.liveInfo.OBSFolder + '/service.json')
      }
    }

    this.$store.watch((state) => state.liveInfo.isLive, async (newValue, oldValue) => {
      console.log('直播组件：直播状态变更：' + oldValue + ' -> ' + newValue)
      if (!newValue) {
        await this.getLiveType()
        await this.getLiveKey()
        if (this.$store.state.liveInfo.OBSFolder != "") {
          this.readOBSConfig(this.$store.state.liveInfo.OBSFolder + '/service.json')
        }
      }
    }).bind(this)

    this.$store.watch((state) => state.liveInfo.liveId, async (newValue, oldValue) => {
      console.log('直播组件：直播ID变更：' + oldValue + ' -> ' + newValue)
      if (oldValue != "") {
        await this.getLiveEndSummary(oldValue)
      }
    }).bind(this)

    this.$store.watch((state) => state.config.isLogin, async (newValue, oldValue) => {
      console.log('直播组件：登录变更：' + oldValue + ' -> ' + newValue)
      if (newValue) {
        await this.getLiveStatus()
        if (!this.$store.state.liveInfo.isLive) {
          await this.getLiveType()
          await this.getLiveKey()
          if (this.$store.state.liveInfo.OBSFolder != "") {
            this.readOBSConfig(this.$store.state.liveInfo.OBSFolder + '/service.json')
          }
        } else {
          console.log('账号已经开播，无视')
        }
      }
    }).bind(this)

    this.$store.watch((state) => state.liveInfo.liveCoverGifFile, async (newValue, oldValue) => {
      console.log('直播组件：检查到GIF封面上传：' + oldValue + ' -> ' + newValue)
      if (newValue) {
        var reader = new FileReader()
        reader.readAsDataURL(newValue)
        reader.onload = () => {
          this.$store.state.liveInfo.liveCoverGif = reader.result
        }
      }
    }).bind(this)

    //设置定时
    this.getLiveStatusTimer = window.setInterval(this.getLiveStatus, 2 * 1000)
  },
  watch: {
    categoryId: {
      handler(val) {
        this.concrete = this.categoryConcrete[val]
      },
    },
  },
  beforeDestroy() {
    window.clearInterval(this.getLiveStatusTimer)
  },
  methods: {
    getFormatedDuration(time) {
      var days = time / 1000 / 60 / 60 / 24
      var daysRound = Math.floor(days)
      var hours = time / 1000 / 60 / 60 - (24 * daysRound)
      var hoursRound = Math.floor(hours)
      var minutes = time / 1000 / 60 - (24 * 60 * daysRound) - (60 * hoursRound)
      var minutesRound = Math.floor(minutes)
      var seconds = time / 1000 - (24 * 60 * 60 * daysRound) - (60 * 60 * hoursRound) - (60 * minutesRound)
      var secondsRound = Math.floor(seconds)
      var time = this.formatZero(hoursRound, 2) + ':' + this.formatZero(minutesRound, 2) + ':' + this.formatZero(secondsRound, 2)
      return time
    },
    formatZero(num, len) {
      if (String(num).length > len) return num;
      return (Array(len).join(0) + num).slice(-len);
    },
    onCopy: function () {
      this.$store.state.snackbar.text = "复制成功"
      this.$store.state.snackbar.show = true
    },
    async getLiveStatus() {
      if (this.$store.state.config.isLogin && this.$store.state.ACFunCommon.acfunST != "") {
        var res = await this.$ACFunCommon.postHTTPResult(
          "https://api.kuaishouzt.com/rest/zt/live/web/obs/status?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" + this.$store.state.ACFunCommon.userId + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST,
          "https://member.acfun.cn",
          this.$store.state.ACFunCommon.acfunCookies,
          {}
        )
        var resJson = JSON.parse(res.body)
        window.console.log(resJson)
        if (resJson.result == 1) {
          this.$store.state.liveInfo.isLive = true
          this.$store.state.liveInfo.liveId = resJson.data.liveId
        } else {
          this.$store.state.liveInfo.isLive = false
          this.$store.state.liveInfo.liveId = ""
        }
      }
    },
    async getLiveKey() {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/obs/config?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" + this.$store.state.ACFunCommon.userId + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST,
        "https://member.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {}
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        this.$store.state.liveInfo.liveStreamName = resJson.data.streamName
        this.$store.state.liveInfo.liveStreamUrl =
          resJson.data.streamPushAddress[0].split("livecloud/")[0] +
          "livecloud/"
        this.$store.state.liveInfo.liveStreamKey = resJson.data.streamPushAddress[0].split(
          "livecloud/"
        )[1]
      }
    },
    async getLiveType() {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://member.acfun.cn/common/api/getLiveTypeList",
        "https://member.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {}
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 0) {
        for (let i = 0; i < resJson.typeList.length; i++) {
          const element = resJson.typeList[i];
          let result = this.category.find(
            (c) => Number(c.categoryId) === element.categoryId
          )
          if (!result) {
            this.category.push(element)
            this.categoryConcrete[element.categoryId] = []
          }
          this.categoryConcrete[element.categoryId].push({
            name: element.name,
            id: element.id,
          })
        }
        this.concrete = this.categoryConcrete[this.categoryId]
      }
    },
    async getLiveEndSummary(liveId) {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/endSummary?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" + this.$store.state.ACFunCommon.userId + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST + "&liveId=" + liveId,
        "https://member.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {}
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        var data = resJson.data
        this.$store.state.summaryInfo.liveId = liveId
        this.$store.state.summaryInfo.likeCount = data.likeCount
        this.$store.state.summaryInfo.watchCount = data.watchCount
        this.$store.state.summaryInfo.liveDurationMs = this.getFormatedDuration(data.liveDurationMs)
        if (data.payWalletTypeToReceiveCurrency && data.payWalletTypeToReceiveCurrency[1]) {
          this.$store.state.summaryInfo.diamond = data.payWalletTypeToReceiveCurrency[1]
        }
        if (data.payWalletTypeToReceiveCount && data.payWalletTypeToReceiveCount[1]) {
          this.$store.state.summaryInfo.gift = data.payWalletTypeToReceiveCount[1]
        }
        if (data.payWalletTypeToReceiveCurrency && data.payWalletTypeToReceiveCurrency[2]) {
          this.$store.state.summaryInfo.glodBanana = data.payWalletTypeToReceiveCurrency[2]
        }
      }
    },
    async startLive() {
      this.$store.state.liveInfo.liveCategoryId = this.categoryId
      this.$store.state.liveInfo.liveConcreteId = this.concreteId
      this.$ACFunCommon.saveNewData(this)
      if (this.getCover() !== null && this.$store.state.liveInfo.liveTitle !== "") {
        await this.uploadPhoto()
      } else {
        this.$store.state.snackbar.text = "请设置封面和标题"
        this.$store.state.snackbar.show = true
      }
    },
    GenGuid() {
      var e, t = 0, n = (new Date).getTime().toString(32);
      for (e = 0; e < 5; e++)
        n += Math.floor(65535 * Math.random()).toString(32);
      return "o_" + n + (t++).toString(32)
    },
    convertBase64UrlToBlob(base64) {
      var type = base64.split(",")[0].match(/:(.*?);/)[1];//提取base64头的type如 'image/png'     
      var bytes = window.atob(base64.split(',')[1]);//去掉url的头，并转换为byte (atob:编码 btoa:解码)

      //处理异常,将ascii码小于0的转换为大于0 
      var ab = new ArrayBuffer(bytes.length);//通用的、固定长度(bytes.length)的原始二进制数据缓冲区对象
      var ia = new Uint8Array(ab);
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return new Blob([ab], { type: type });
    },
    convertBase64UrlToUint8Array(base64) {
      var type = base64.split(",")[0].match(/:(.*?);/)[1];//提取base64头的type如 'image/png'     
      var bytes = window.atob(base64.split(',')[1]);//去掉url的头，并转换为byte (atob:编码 btoa:解码)

      //处理异常,将ascii码小于0的转换为大于0 
      var ab = new ArrayBuffer(bytes.length);//通用的、固定长度(bytes.length)的原始二进制数据缓冲区对象
      var ia = new Uint8Array(ab);
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return ia;
    },
    async uploadPhoto() {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://member.acfun.cn/common/api/getQiniuToken",
        "https://member.acfun.cn/liveTool/config",
        this.$store.state.ACFunCommon.acfunCookies,
        { headers: { devicetype: 7 } }
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 0) {
        var token = Base64.decode(resJson.info.upToken)
        var rtoken = token.slice(token.indexOf(":") + 1)

        var blob = this.convertBase64UrlToBlob(this.getCover())

        var formData = new FormData();
        formData.append("file", blob, "blob")
        formData.append("key", this.GenGuid() + "." + blob.type.split("/")[1])
        formData.append("token", rtoken)

        var resJson = await axios.post("https://upload.qiniup.com/", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
        if (resJson.status == 200) {
          this.$store.state.liveInfo.liveStreamPhotoKey = resJson.data.key
          await this.startPush()
        }
      } else {
        this.$store.state.snackbar.text = res.body
        this.$store.state.snackbar.show = true
      }
    },
    async startPush() {
      var boundary = "----WebKitFormBoundary" + window.btoa(Math.random().toString()).substr(0, 16)

      var resultBefore =
        "--" +
        boundary +
        "\r\n" +
        "Content-Disposition: form-data; " +
        'name="cover"; filename="cover.jpeg"\r\n' +
        "Content-Type: image/jpeg\r\n\r\n"

      var buf1 = Buffer.from(resultBefore, 'utf8')

      var buf2 = this.convertBase64UrlToUint8Array(this.getCover())

      var resultAfter =
        "\r\n" +
        "--" + boundary + "--\r\n"

      var buf3 = Buffer.from(resultAfter, 'utf8')

      var totalLength = buf1.length + buf2.length + buf3.length;
      var bufDone = Buffer.concat([buf1, buf2, buf3], totalLength);

      var res = await this.$ACFunCommon.postHTTPRawBody(
        "https://api.kuaishouzt.com/rest/zt/live/web/obs/startPush?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" +
        this.$store.state.ACFunCommon.userId +
        "&acfun.midground.api_st=" +
        this.$store.state.ACFunCommon.acfunST +
        "&videoPushReq=&caption=" +
        this.$store.state.liveInfo.liveTitle +
        "&streamName=" +
        this.$store.state.liveInfo.liveStreamName +
        "&isPanoramic=false&bizCustomData=%7B%22typeId%22:" +
        this.$store.state.liveInfo.liveConcreteId +
        ",%22type%22:[" +
        this.$store.state.liveInfo.liveCategoryId +
        "," +
        this.$store.state.liveInfo.liveConcreteId +
        "]%7D",
        "https://member.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        "multipart/form-data; boundary=" + boundary,
        bufDone
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        this.$store.state.liveInfo.isLive = true
        this.$store.state.liveInfo.liveId = resJson.data.liveId
      } else {
        this.$store.state.snackbar.text = resJson.error_msg
        this.$store.state.snackbar.show = true
      }
    },
    async changeCoverAndTitle() {
      this.$ACFunCommon.saveNewData(this)
      var boundary = "----WebKitFormBoundary" + window.btoa(Math.random().toString()).substr(0, 16)

      var resultBefore =
        "--" + boundary + "\r\n" +
        'Content-Disposition: form-data; name="caption"; \r\n' +
        "\r\n" + this.$store.state.liveInfo.liveTitle + "\r\n" +

        "--" + boundary + "\r\n" +
        'Content-Disposition: form-data; name="liveId"; \r\n' +
        "\r\n" + this.$store.state.liveInfo.liveId + "\r\n" +

        "--" + boundary + "\r\n" +
        'Content-Disposition: form-data; name="cover"; filename="cover.jpeg"\r\n' +
        "Content-Type: image/jpeg\r\n\r\n"

      var buf1 = Buffer.from(resultBefore, 'utf8')

      var buf2 = this.convertBase64UrlToUint8Array(this.getCover())

      var resultAfter =
        "\r\n" +
        "--" + boundary + "--\r\n"

      var buf3 = Buffer.from(resultAfter, 'utf8')

      var totalLength = buf1.length + buf2.length + buf3.length;
      var bufDone = Buffer.concat([buf1, buf2, buf3], totalLength);

      var res = await this.$ACFunCommon.postHTTPRawBody(
        "https://api.kuaishouzt.com/rest/zt/live/web/changeCover?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" +
        this.$store.state.ACFunCommon.userId +
        "&acfun.midground.api_st=" +
        this.$store.state.ACFunCommon.acfunST,
        "https://member.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        "multipart/form-data; boundary=" + boundary,
        bufDone
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        this.$store.state.snackbar.text = "提交成功"
        this.$store.state.snackbar.show = true
      } else {
        this.$store.state.snackbar.text = resJson.error_msg
        this.$store.state.snackbar.show = true
      }
    },
    async stopPush() {
      var res = await this.$ACFunCommon.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/obs/stopPush?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" + this.$store.state.ACFunCommon.userId + "&acfun.midground.api_st=" + this.$store.state.ACFunCommon.acfunST,
        "https://member.acfun.cn",
        this.$store.state.ACFunCommon.acfunCookies,
        {
          liveId: this.$store.state.liveInfo.liveId
        }
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        this.$store.state.liveInfo.isLive = false
      } else {
        this.$store.state.snackbar.text = resJson.error_msg
        this.$store.state.snackbar.show = true
      }
    },
    getCover() {
      if (this.$store.state.liveInfo.useGifCover && this.$store.state.liveInfo.liveCoverGif != null && this.$store.state.liveInfo.liveCoverGif != undefined) {
        return this.$store.state.liveInfo.liveCoverGif
      }
      return this.$store.state.liveInfo.liveCover
    },
    testWriteOBSConfig() {
      if (this.$store.state.liveInfo.OBSFolder != "") {
        this.readOBSConfig(this.$store.state.liveInfo.OBSFolder + '/service.json')
      } else {
        this.$store.state.snackbar.text = "请输入OBS配置文件夹"
        this.$store.state.snackbar.show = true
      }
    },
    readOBSConfig(path) {
      fs.readFile(path, 'utf-8', function (err, data) {
        if (err) {
          this.$store.state.snackbar.text = "发生错误，请检查OBS配置文件夹"
          this.$store.state.snackbar.show = true
        } else {
          this.$ACFunCommon.saveNewData(this)
          this.writeOBSConfig(path, data)
        }
      }.bind(this))
    },
    writeOBSConfig(path, oldConfig) {
      try {
        var resJson = JSON.parse(oldConfig)
        resJson.settings.key = this.$store.state.liveInfo.liveStreamKey
        resJson.settings.server = this.$store.state.liveInfo.liveStreamUrl
        fs.writeFile(path, JSON.stringify(resJson, null, 4), { 'flag': 'w' }, function (err) {
          if (err) {
            this.$store.state.snackbar.text = "发生错误，请检查权限"
            this.$store.state.snackbar.show = true
          } else {
            this.$store.state.snackbar.text = "写入成功"
            this.$store.state.snackbar.show = true
          }
        }.bind(this))
      } catch (err) {
        this.$store.state.snackbar.text = "发生错误，请检查配置文件"
        this.$store.state.snackbar.show = true
      }
    },
    closeOBSConfig() {
      this.$store.state.liveInfo.OBSFolder = ""
      this.$ACFunCommon.saveNewData(this)
    }
  },
};
</script>