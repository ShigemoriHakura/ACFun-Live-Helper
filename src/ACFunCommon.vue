<script>
import eConfig from "electron-config"
import cookie from "cookie"
import got from "got"
import axios from 'axios'

const econfig = new eConfig()
const UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"
let Base64 = require('js-base64').Base64

//主业务逻辑，处理全局登录等属性。
export default {
  //存储区逻辑
  //同步存储数据，经典的this和that！
  getSavedData(that) {
    //获取存储的cookies
    that.$store.state.ACFunCommon.acfunCookies = econfig.get("ACFunCommon.acfunCookies")

    //获取房间的拉黑列表
    var blockList = econfig.get("roomInfo.blockList")
    //判断拉黑列表的情况
    if (blockList !== undefined) {
      that.$store.state.roomInfo.blockList = blockList
    }

    //获取存储的直播分区和子分区，直播标题，直播封面
    var liveCover = econfig.get("liveInfo.liveCover")
    var liveCoverGif = econfig.get("liveInfo.liveCoverGif")
    that.$store.state.liveInfo.useGifCover = econfig.get("liveInfo.useGifCover")
    that.$store.state.liveInfo.liveTitle = econfig.get("liveInfo.liveTitle")
    that.$store.state.liveInfo.liveCategoryId = econfig.get("liveInfo.liveCategoryId")
    that.$store.state.liveInfo.liveConcreteId = econfig.get("liveInfo.liveConcreteId")
    var cacheCovers = econfig.get("liveInfo.cacheCovers")
    //判断存储的封面情况
    if (liveCover !== undefined) {
      that.$store.state.liveInfo.liveCover = liveCover
    }
    if (liveCoverGif !== undefined) {
      that.$store.state.liveInfo.liveCoverGif = liveCoverGif
    }
    if (cacheCovers !== undefined && Array.isArray(cacheCovers)) {
      that.$store.state.liveInfo.cacheCovers = cacheCovers
    } else {
      that.$store.state.liveInfo.cacheCovers = []
    }

    that.$store.state.obsInfo.obsPort = econfig.get("obsInfo.obsPort")
    that.$store.state.obsInfo.obsPass = econfig.get("obsInfo.obsPass")
    that.$store.state.obsInfo.obsEnabled = econfig.get("obsInfo.obsEnabled")
    that.$store.state.obsInfo.obsStopStreamingAfterClose = econfig.get("obsInfo.obsStopStreamingAfterClose")

    //读取TTS信息
    var TTS = econfig.get("config.TTSInfo")
    if (TTS != undefined) {
      that.$store.state.TTSInfo.isTTS = TTS.isTTS
      that.$store.state.TTSInfo.TTSspeed = TTS.TTSspeed
      that.$store.state.TTSInfo.TTSpitch = TTS.TTSpitch
      that.$store.state.TTSInfo.TTSvolume = TTS.TTSvolume
      that.$store.state.TTSInfo.TTSperson = TTS.TTSperson
      that.$store.state.TTSInfo.TTSgift = TTS.TTSgift
      if (TTS.TTSLang != undefined) {
        that.$store.state.TTSInfo.TTSLang = TTS.TTSLang
      }
    }

    that.$store.commit('addLog', "读取设置内容完成")
  },

  getMinSavedData(that) {
    //获取存储的cookies
    that.$store.state.ACFunCommon.acfunCookies = econfig.get("ACFunCommon.acfunCookies")

  },

  //全部数据保存
  saveNewData(that) {
    //保存的房间ID，弹幕显示用
    econfig.set("config.roomId", that.$store.state.ACFunCommon.userId)
    var cookies = []

    if (that.$store.state.ACFunCommon.acfunCookies != undefined) {
      that.$store.state.ACFunCommon.acfunCookies.forEach(element => {
        if (element.indexOf("_did=") === 0) {
          //window.console.log("移除did")
        } else {
          cookies.unshift(element)
        }
      });
    }
    //保存存储的cookies
    econfig.set("ACFunCommon.acfunCookies", cookies)

    //保存房间的拉黑列表
    econfig.set("roomInfo.blockList", that.$store.state.roomInfo.blockList)

    //保存存储的直播分区和子分区，直播标题，直播封面
    econfig.set("liveInfo.liveCover", that.$store.state.liveInfo.liveCover)
    econfig.set("liveInfo.useGifCover", that.$store.state.liveInfo.useGifCover)
    econfig.set("liveInfo.liveCoverGif", that.$store.state.liveInfo.liveCoverGif)
    econfig.set("liveInfo.liveTitle", that.$store.state.liveInfo.liveTitle)
    econfig.set("liveInfo.liveCategoryId", that.$store.state.liveInfo.liveCategoryId)
    econfig.set("liveInfo.liveConcreteId", that.$store.state.liveInfo.liveConcreteId)
    econfig.set("liveInfo.cacheCovers", that.$store.state.liveInfo.cacheCovers)

    econfig.set("obsInfo.obsPort", that.$store.state.obsInfo.obsPort)
    econfig.set("obsInfo.obsPass", that.$store.state.obsInfo.obsPass)
    econfig.set("obsInfo.obsEnabled", that.$store.state.obsInfo.obsEnabled)
    econfig.set("obsInfo.obsStopStreamingAfterClose", that.$store.state.obsInfo.obsStopStreamingAfterClose)

    that.$store.commit('addLog', "保存设置内容完成")
  },

  saveTTSData(that) {
    that.$store.state.TTSList = []
    //保存的房间ID，弹幕显示用
    econfig.set("config.TTSInfo", that.$store.state.TTSInfo)

    that.$store.commit('addLog', "保存TTS设置内容完成")
  },

  //刷新登录区逻辑
  async getLoginDataFromCookies(that) {
    const res = await this.getHTTPResult(
      "https://api-new.app.acfun.cn/rest/app/user/personalInfo",
      "",
      that.$store.state.ACFunCommon.acfunCookies
    )
    var resJson = JSON.parse(res.body)
    if (resJson.result == 0) {
      that.$store.state.config.isLogin = true
      that.$store.state.ACFunCommon.userName = resJson.info.userName
      that.$store.state.ACFunCommon.userId = resJson.info.userId
      var did = "_did=" + that.$store.state.ACFunCommon.acfunDid
      that.$store.state.ACFunCommon.acfunCookies.push(did)
      await this.getSt(that)
    } else {
      that.$store.state.config.isLogin = false
    }
  },
  async getDid(that) {
    const res = await this.getHTTPResult(
      "https://www.acfun.cn/login",
      "",
      that.$store.state.ACFunCommon.acfunCookies
    )
    var did_cookie = cookie.parse(res.headers["set-cookie"][1]);
    that.$store.state.ACFunCommon.acfunDid = did_cookie._did
  },
  async getSt(that) {
    var res = await this.postHTTPResult(
      "https://id.app.acfun.cn/rest/web/token/get",
      "https://www.acfun.cn",
      that.$store.state.ACFunCommon.acfunCookies,
      {
        sid: "acfun.midground.api",
      }
    )
    var resJson = JSON.parse(res.body)
    if (resJson.result == 0) {
      that.$store.state.ACFunCommon.acfunST = resJson["acfun.midground.api_st"];
    }
  },

  //不同请求有不同的referer和ua需求，这里统一封装方法。因为formdata有点问题所以多一个RawBody（Buffer）的方法
  async postHTTPResult(url, referer, cookies, form) {
    try {
      const res = await got(url, {
        method: "POST",
        headers: {
          Referer: referer,
          cookie: cookies,
          "user-agent": UserAgent,
        },
        form: form,
      })
      return res
    } catch (error) {
      return error.response
    }
  },
  async postHTTPRawBody(url, referer, cookies, contentType, body) {
    try {
      const res = await got(url, {
        method: "POST",
        headers: {
          Referer: referer,
          cookie: cookies,
          "content-type": contentType,
          "user-agent": UserAgent,
        },
        body: body,
      })
      return res
    } catch (error) {
      return error.response
    }
  },
  async getHTTPResult(url, referer, cookies) {
    try {
      const res = await got(url, {
        method: "GET",
        headers: {
          Referer: referer,
          cookie: cookies,
          "user-agent": UserAgent,
        },
      })
      return res
    } catch (error) {
      return error.response
    }
  },
}
</script>