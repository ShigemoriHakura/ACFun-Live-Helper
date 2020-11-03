<template>
  <v-container style="max-width: 100% !important">
    <v-container v-if="isLogin" style="max-width: 100% !important">
      <div class="text-center"></div>
      <v-container v-if="!isLive" style="max-width: 100% !important">
        <v-row>
          <v-col cols="12" md="6">
            上传封面：
            <v-image-input style="
              transform: scale(0.35);
              transform-origin: left top;
              height: 700px;
              width: 1200px;
            " v-model="imageData" :image-quality="0.85" clearable image-format="jpeg" :imageHeight="608"
              :imageWidth="1024" :fullWidth="true" :hideActions="true" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="titleText" type="text" label="直播标题"></v-text-field>
            <v-select v-model="categoryId" :items="category" item-text="categoryName" item-value="categoryId"
              label="分区">
            </v-select>
            <v-select v-model="moreId" :items="more" item-text="name" item-value="id" label="具体"></v-select>
            <v-text-field v-model="streamUrl" type="text" label="推流地址" disabled></v-text-field>
            <v-text-field v-model="streamKey" type="text" label="推流码" disabled></v-text-field>
            <v-btn class="ma-2" elevation="2" color="primary" v-clipboard:copy="streamUrl" v-clipboard:success="onCopy">
              复制地址</v-btn>
            <v-btn class="ma-2" elevation="2" color="primary" v-clipboard:copy="streamKey" v-clipboard:success="onCopy">
              复制推流码</v-btn>
            <v-btn class="ma-2" elevation="2" color="error" @click="startLive">开播</v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-container v-if="isLive" style="max-width: 100% !important">
        <v-row>
          <v-col cols="12" md="12">
            <v-btn class="ma-2" elevation="2" color="error" @click="stopPush">关闭直播</v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-snackbar v-model="snackbar">
        {{ text }}
        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
    <v-container v-if="!isLogin" style="max-width: 100% !important">
      <v-row>
        <v-col cols="12" md="12">
          <v-btn class="ma-2" elevation="2" color="error" @click="retryCreate">刷新</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
//不要问为什么全写这里，问就是懒，功能全做完再拆分。
import * as urlConfig from "@/api/urlConfig";
import eConfig from "electron-config";
import cookie from "cookie";
import got from "got";

const econfig = new eConfig();
let Base64 = require("js-base64").Base64;
export default {
  name: "ACFunPanel",
  data: () => ({
    snackbar: false,
    text: `(/=-=)/`,

    config: [],

    //开播
    isLogin: false,
    isLive: false,
    imageData: null,
    titleText: "",
    streamName: "",
    streamUrl: "",
    streamKey: "",
    streamPhoto: "",
    category: [],
    categoryMore: [],
    more: [],
    categoryId: 0,
    moreId: 0,
  }),
  async created() {
    await this.getCookiesFromLogin()
    this.syncSavedData()
    if (this.isLogin) {
      await this.getSt()
      await this.getLiveStatus()
    }
  },
  watch: {
    categoryId: {
      handler(val) {
        this.more = this.categoryMore[val]
      },
    },
  },
  methods: {
    async retryCreate() {
      await this.getCookiesFromLogin()
      this.syncSavedData()
      if (this.isLogin) {
        await this.getSt()
        await this.getLiveStatus()
      }
    },
    onCopy: function () {
      this.text = "复制成功"
      this.snackbar = true
    },
    syncSavedData() {
      this.imageData = econfig.get("imageData")
      this.titleText = econfig.get("titleText")
      this.categoryId = econfig.get("categoryId")
      this.moreId = econfig.get("moreId")
      if (this.imageData == undefined) {
        this.imageData = null
      }
    },
    async postHTTPResult(url, referer, cookies, form) {
      const res = await got(url, {
        method: "POST",
        headers: {
          Referer: referer,
          cookie: cookies,
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
        },
        form: form,
      })
      var resJson = JSON.parse(res.body);
      return resJson;
    },
    async getHTTPResult(url, referer, cookies) {
      const res = await got(url, {
        method: "GET",
        headers: {
          Referer: referer,
          cookie: cookies,
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
        },
      })
      var resJson = JSON.parse(res.body);
      return resJson;
    },
    async getCookiesFromLogin() {
      this.config.loginCookies = econfig.get("loginCookies");
      var resJson = await this.getHTTPResult(
        urlConfig.DEFAULT_CONFIG.acfun_personalInfo,
        "",
        this.config.loginCookies
      )
      if (resJson.result == 0) {
        this.isLogin = true;
        this.config.userName = resJson.info.userName;
        this.config.userId = resJson.info.userId;
      }
    },
    async getSt() {
      var resJson = await this.postHTTPResult(
        urlConfig.DEFAULT_CONFIG.acfun_tokenGet,
        "https://www.acfun.cn",
        this.config.loginCookies,
        {
          sid: "acfun.midground.api",
        }
      )
      if (resJson.result == 0) {
        this.config.midground = resJson["acfun.midground.api_st"];
      }
    },
    async getLiveStatus() {
      var resJson = await this.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/obs/status?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" + this.config.userId + "&acfun.midground.api_st=" + this.config.midground,
        "https://member.acfun.cn",
        this.config.loginCookies,
        {}
      )
      if (resJson.result == 1) {
        this.isLive = true
        this.config.LiveId = resJson.data.liveId
      } else {
        await this.getLiveKey()
        await this.getLiveType()
      }
    },
    async getLiveKey() {
      var resJson = await this.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/obs/config?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" + this.config.userId + "&acfun.midground.api_st=" + this.config.midground,
        "https://member.acfun.cn",
        this.config.loginCookies,
        {}
      )
      if (resJson.result == 1) {
        this.streamName = resJson.data.streamName
        this.streamUrl =
          resJson.data.streamPushAddress[0].split("livecloud/")[0] +
          "livecloud/"
        this.streamKey = resJson.data.streamPushAddress[0].split(
          "livecloud/"
        )[1]
      }
    },
    async getLiveType() {
      var resJson = await this.postHTTPResult(
        "https://member.acfun.cn/common/api/getLiveTypeList",
        "https://member.acfun.cn",
        this.config.loginCookies,
        {}
      )
      if (resJson.result == 0) {
        for (let i = 0; i < resJson.typeList.length; i++) {
          const element = resJson.typeList[i];
          let result = this.category.find(
            (c) => Number(c.categoryId) === element.categoryId
          )
          if (!result) {
            this.category.push(element)
            this.categoryMore[element.categoryId] = []
          }
          this.categoryMore[element.categoryId].push({
            name: element.name,
            id: element.id,
          })
        }
        this.more = this.categoryMore[this.categoryId]
      }
    },
    async startLive() {
      econfig.set("titleText", this.titleText)
      econfig.set("categoryId", this.categoryId)
      econfig.set("moreId", this.moreId)
      econfig.set("imageData", this.imageData)
      if (this.imageData !== null) {
        await this.uploadPhoto()
        await this.startPush()
      } else {
        this.text = "请设置封面"
        this.snackbar = true
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
      var resJson = await this.postHTTPResult(
        "https://member.acfun.cn/common/api/getQiniuToken",
        "https://member.acfun.cn",
        this.config.loginCookies,
        { "headers": { "devicetype": 7 } }
      )
      if (resJson.result == 0) {
        var token = Base64.decode(resJson.info.upToken)
        var rtoken = token.slice(token.indexOf(":") + 1)

        var blob = this.convertBase64UrlToBlob(this.imageData)

        var formData = new FormData();
        formData.append("file", blob, "blob")
        formData.append("key", this.GenGuid() + "." + blob.type.split("/")[1])
        formData.append("token", rtoken)

        var resJson = await this.$axios.post("https://upload.qiniup.com/", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
        if (resJson.status == 200) {
          this.streamPhoto = resJson.data.key
        }
      }
    },
    async startPush() {
      var boundary = "----WebKitFormBoundary" + window.btoa(Math.random().toString()).substr(0, 16)

      var resultBefore =
        "--" +
        boundary +
        "\r\n" +
        "Content-Disposition: form-data; " +
        'name="cover"; filename="' + this.streamPhoto + '"\r\n' +
        "Content-Type: image/jpeg\r\n\r\n"

      var buf1 = Buffer.from(resultBefore, 'utf8')

      var buf2 = this.convertBase64UrlToUint8Array(this.imageData)

      var resultAfter =
        "\r\n" +
        "--" + boundary + "--\r\n"

      var buf3 = Buffer.from(resultAfter, 'utf8')

      var totalLength = buf1.length + buf2.length + buf3.length;
      var bufA = Buffer.concat([buf1, buf2, buf3], totalLength);

      var res = await got(
        "https://api.kuaishouzt.com/rest/zt/live/web/obs/startPush?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" +
        this.config.userId +
        "&acfun.midground.api_st=" +
        this.config.midground +
        "&videoPushReq=&caption=" +
        this.titleText +
        "&streamName=" +
        this.streamName +
        "&isPanoramic=false&bizCustomData=%7B%22typeId%22:" +
        this.moreId +
        ",%22type%22:[" +
        this.categoryId +
        "," +
        this.moreId +
        "]%7D",
        {
          method: "POST",
          headers: {
            Referer: "https://member.acfun.cn",
            cookie: this.config.loginCookies,
            "content-type": "multipart/form-data; boundary=" + boundary,
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
          },
          body: bufA,
        }
      )

      var resJson = JSON.parse(res.body)
      if (resJson.result == 1) {
        this.isLive = true
        this.config.LiveId = resJson.data.liveId
      } else {
        this.text = resJson.error_msg
        this.snackbar = true
      }

    },
    async stopPush() {
      var resJson = await this.postHTTPResult(
        "https://api.kuaishouzt.com/rest/zt/live/web/obs/stopPush?kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&userId=" + this.config.userId + "&acfun.midground.api_st=" + this.config.midground,
        "https://member.acfun.cn",
        this.config.loginCookies,
        {
          liveId: this.config.LiveId
        }
      )
      if (resJson.result == 1) {
        this.isLive = false
        this.getLiveStatus()
      } else {
        this.text = resJson.error_msg
        this.snackbar = true
      }
    },
  },
};
</script>