<template>
  <v-container style="max-width: 100% !important">
    <v-container v-if="$store.state.config.isLogin" style="max-width: 100% !important">
      <v-container v-if="!$store.state.liveInfo.isLive" style="max-width: 100% !important">
        <v-tabs>
          <v-tab>
            开播详情
          </v-tab>
          <v-tab>
            封面设置
          </v-tab>
          <v-tab-item>
            <v-row>
              <v-col cols="12" md="7">
                <v-img :src="$store.state.liveInfo.liveCover"></v-img>
              </v-col>
              <v-col cols="12" md="5">
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
                height: 756px!important;
                width: 1180px!important;
                overflow: unset;
              " v-model="$store.state.liveInfo.liveCover" :image-quality="0.85" clearable image-format="jpeg"
                  :imageHeight="608" :imageWidth="1024" :fullWidth="true" :fullHeight="true" :hideActions="false" />
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
          <v-col cols="12" md="12">
            <v-text-field v-model="$store.state.liveInfo.liveTitle" type="text" label="直播标题"></v-text-field>
            上传封面：
            <v-image-input style="
                height: 756px!important;
                width: 1180px!important;
                overflow: unset;
              " v-model="$store.state.liveInfo.liveCover" :image-quality="0.85" clearable image-format="jpeg"
              :imageHeight="608" :imageWidth="1024" :fullWidth="true" :fullHeight="true" :hideActions="false" />
          </v-col>
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
import axios from 'axios'

const econfig = new eConfig()
let Base64 = require("js-base64").Base64

export default {
  name: "ACFunPanel",
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
    }

    this.$store.watch((state) => state.liveInfo.isLive, async (newValue, oldValue) => {
      console.log('直播组件：直播状态变更：' + oldValue + ' -> ' + newValue)
      if (!newValue) {
        await this.getLiveType()
        await this.getLiveKey()
      }
    }).bind(this)

    this.$store.watch((state) => state.config.isLogin, async (newValue, oldValue) => {
      console.log('直播组件：登录变更：' + oldValue + ' -> ' + newValue)
      if (newValue) {
        await this.getLiveStatus()
        if (!this.$store.state.liveInfo.isLive) {
          await this.getLiveType()
          await this.getLiveKey()
        } else {
          console.log('账号已经开播，无视')
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
    async startLive() {
      this.$store.state.liveInfo.liveCategoryId = this.categoryId
      this.$store.state.liveInfo.liveConcreteId = this.concreteId
      this.$ACFunCommon.saveNewData(this)
      if (this.$store.state.liveInfo.liveCover !== null && this.$store.state.liveInfo.liveTitle !== "") {
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

        var blob = this.convertBase64UrlToBlob(this.$store.state.liveInfo.liveCover)

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

      var buf2 = this.convertBase64UrlToUint8Array(this.$store.state.liveInfo.liveCover)

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

      var buf2 = this.convertBase64UrlToUint8Array(this.$store.state.liveInfo.liveCover)

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
  },
};
</script>