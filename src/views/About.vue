<template>
  <div class="about">
    <v-container style="max-width: 100%!important;">
      <h1>感谢使用</h1>
      <h1>作者：茂森白咲</h1>
      <hr>
      <h1>Github地址：https://github.com/ShigemoriHakura/ACFun-Live-Helper</h1>
      <hr>
      <h1>Bug或者功能需求请前往A站文章：https://www.acfun.cn/a/ac19231355</h1>
      <hr>
      <h1>本项目的发展离不开各位的投喂，</h1>
      <h1>以下是投喂过的老板列表（排名不分先后）：</h1>
      <h1><a @click="openExternal(879259)">IXTUS</a></h1>
    </v-container>
  </div>
</template>

<script>
import { shell } from 'electron'
export default {
  data() {
    return {
    }
  },
  methods: {
    openExternal(userId) {
      shell.openExternal("https://www.acfun.cn/u/" + userId)
    }
  }
}
</script>