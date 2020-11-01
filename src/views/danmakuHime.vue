<template>
  <div class="danmakuHime" style="overflow: hidden;background-color: rgba(0, 0, 0, 0);">
      <div class="window-chrome" id="window-chrome">
          <div class="app-label">弹幕助手</div>
          <div class="window-controls">
              <div class="close" @click="closeWindow"><img src="@/assets/ui/close.png" /></div>
          </div>
      </div>

      <div class="app-controls" id="app-controls">
        <input type="range" v-model="opacity" value="0.95" min="0.2" max="1" step="0.05" id="transparencyRange"/>
        <button @click="enableClickThrough" id="clickthroughButton"><img src="@/assets/ui/eye.png"/></button>
    </div>

    <webview id="browserView" src="https://vup.loli.ren" style="background-color: rgba(0, 0, 0, 0)!important;display:inline-flex; width:100%;"></webview>
  </div>
</template>

<script>
import eConfig from "electron-config"
import got from "got"
import { remote, ipcRenderer } from 'electron'
const econfig = new eConfig();

export default {
  name: 'danmakuHime',
  data: () => ({
    opacity: 0.95,
  }),
  mounted () {
    window.addEventListener('load', () => {
      this.loadPage("https://danmaku.loli.ren/room/" + econfig.get("roomID") + "?minGiftPrice=0&exchangeRate=2&showDanmaku=true&showEqualMedal=false&showFollow=true&followText=%E5%85%B3%E6%B3%A8%E4%BA%86%EF%BC%81%EF%BC%81%EF%BC%81&showJoin=true&joinText=%E6%9D%A5%E7%9C%8B%E4%BA%86%EF%BC%81%EF%BC%81%EF%BC%81&showQuit=false&quitText=%E7%A6%BB%E5%BC%80%E4%BA%86%EF%BC%81%EF%BC%81%EF%BC%81&showLove=true&loveText=%E8%A1%A8%E7%A4%BA%E5%BE%88%E5%96%9C%E6%AC%A2%EF%BC%81%EF%BC%81%EF%BC%81&showJoinGroup=true&joinGroupText=%E5%8A%A0%E5%85%A5%E4%BA%86%E5%AE%88%E6%8A%A4%E5%9B%A2%EF%BC%81%EF%BC%81&showGift=true&showGiftPrice=true&showACCoinInstead=true&showGiftPngInstead=false&showGiftName=true&mergeSimilarDanmaku=true&mergeSimilarOther=true&mergeGift=true&maxNumber=60&blockGiftDanmaku=false&blockKeywords=%E4%B8%8D%E5%A5%BD%E5%90%AC%0Abu%E5%A5%BD%E5%90%AC&blockUsers=&blockMedalLevel=0&autoTranslate=false")
    })
  },
  methods:{
    async loadPage(url){
      console.log("Loading " + url);
      var webview = document.getElementById('browserView');
      const res = await got("https://danmaku.loli.ren/danmakuStyle.css", {
          method: "GET",
      })
      webview.addEventListener('dom-ready', function () {
        webview.insertCSS(res.body);
      })
      webview.loadURL(url);
      document.getElementById('inspire').style["background-color"] = "rgba(0, 0, 0, 0)"
      document.getElementById('inspire').style["color"] = "rgba(0, 0, 0, 0)"
    },
    closeWindow(){
      var window = remote.getCurrentWindow();
      window.close();
    },
    enableClickThrough(){
      console.log("Clickthrough enabled.")
      var window = remote.getCurrentWindow();
      window.setIgnoreMouseEvents(true);
      document.getElementById('browserView').classList.add("full-size")
      document.getElementById('window-chrome').style.height = 0;
      document.getElementById('app-controls').style.display = "none";
    },
    disableClickThrough(){
      console.log("Clickthrough disabled.")
      var window = remote.getCurrentWindow();
      window.setIgnoreMouseEvents(false);
      document.getElementById('browserView').classList.del("full-size")
      document.getElementById('window-chrome').style.height = 200;
      document.getElementById('app-controls').style.display = "flex";
    }
  },
  watch:{
    opacity(){
      document.getElementById('inspire').style["opacity"] = this.opacity
    }
  }
}

</script>

<style src="@/assets/css/app.css"></style>