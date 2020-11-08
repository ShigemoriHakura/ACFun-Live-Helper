<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-switch v-model="$store.state.TTSInfo.isTTS" :label="`播报开启: ${getStatus($store.state.TTSInfo.isTTS)}`">
        </v-switch>
        <v-btn class="ma-2" elevation="2" color="warning" @click="testTTS">测试TTS</v-btn>
        <v-btn class="ma-2" elevation="2" color="success" @click="saveSettings">保存</v-btn>
      </v-col>
      <v-col cols="12" md="8">
        <v-slider :label="`语速 ${$store.state.TTSInfo.TTSspeed}`" v-model="$store.state.TTSInfo.TTSspeed" step="1"
          min="1" max="15"></v-slider>
        <v-slider :label="`语调 ${$store.state.TTSInfo.TTSpitch}`" v-model="$store.state.TTSInfo.TTSpitch" step="1"
          min="1" max="15"></v-slider>
        <v-slider :label="`音量 ${$store.state.TTSInfo.TTSvolume}`" v-model="$store.state.TTSInfo.TTSvolume" step="1"
          min="1" max="15"></v-slider>
        <v-select v-model="$store.state.TTSInfo.TTSperson" :items="availableTTSPerson" label="音库" item-text="name"
          item-value="id">
        </v-select>
        <v-switch v-model="$store.state.TTSInfo.TTSgift" :label="`播报礼物: ${getStatus($store.state.TTSInfo.TTSgift)}`">
        </v-switch>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DanmakuTTS',
  data() {
    return {
      availableTTSPerson: [
        {
          name: "度小美",
          id: 0,
        }, {
          name: "度小宇",
          id: 1,
        }, {
          name: "度逍遥",
          id: 3,
        }, {
          name: "度丫丫",
          id: 4,
        }
      ]
    }
  },
  methods: {
    getStatus(status) {
      if (status) {
        return "已开始"
      }
      return "已停止"
    },
    testTTS() {
      var url = `https://tts.baidu.com/text2audio?lan=ZH&cuid=baike&pdt=301&ctp=1&spd=` + this.$store.state.TTSInfo.TTSspeed + `&per=` + this.$store.state.TTSInfo.TTSperson + `&vol=` + this.$store.state.TTSInfo.TTSvolume + `&pit=` + this.$store.state.TTSInfo.TTSpitch + `&tex=` + encodeURI("这是一个测试")
      this.$store.state.TTSInfo.TTSList.push(url)
    },
    saveSettings() {
      this.$ACFunCommon.saveTTSData(this)
      this.$store.state.snackbar.text = "保存成功"
      this.$store.state.snackbar.show = true
    }
  }
}
</script>