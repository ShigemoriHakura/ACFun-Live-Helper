<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12" md="7">
        <v-img src="https://acfun-helper.oss-cn-shanghai.aliyuncs.com/ACLiveHelper/image/screenshot.png"></v-img>
      </v-col>
      <v-col cols="12" md="5">
        AC直播助手<br>
        最新版本：{{version}}<br>
        文件名：{{path}}<br>
        <v-btn class="ma-2" elevation="2" color="primary" :href="link">点我下载</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import yaml from "js-yaml"
import axios from 'axios'

export default {
  name: 'RedirectToLatest',

  data: () => ({
    version: "",
    path: "",
    link: "",
    sha512: ""
  }),
  async created() {
    var result = await axios.get("https://acfun-helper.oss-cn-shanghai.aliyuncs.com/ACLiveHelper/latest.yml")
    const doc = yaml.safeLoad(result.data)
    this.version = doc.version
    this.path = doc.path
    this.link = "https://acfun-helper.oss-cn-shanghai.aliyuncs.com/ACLiveHelper/" + doc.path
    this.sha512 = doc.sha512
  }
}
</script>
