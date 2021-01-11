<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="uperId" label="用户UID"></v-text-field>
        <v-btn elevation="2" @click="search">读取</v-btn>
      </v-col>
      <v-col cols="12" md="5">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  关注了 ({{following.length}})
                </th>
                <th class="text-left">
                  UID
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in following" :key="item.name">
                <td>{{ item.userName }}</td>
                <td>{{ item.userId }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col cols="12" md="3">
        结果：{{getStatus(hasMyself)}}
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import got from 'got'
export default {
  name: 'Gift',
  data() {
    return {
      uperId: 0,
      following: [],
      hasMyself: false,
    }
  },
  methods: {
    getStatus(hasMyself) {
      if (hasMyself) {
        return "有我，真爱！"
      }
      return "无我，骗子！"
    },
    async search() {
      this.following = []
      this.hasMyself = false
      var pcursor = 0
      while (pcursor != "no_more") {
        var res = await this.$ACFunCommon.getHTTPResult(
          "http://api-new.app.acfun.cn/rest/app/relation/getFollows?toUserId=" + this.uperId + "&action=7&pcursor=" + pcursor,
          "",
          []
        )
        var resJson = JSON.parse(res.body)
        if (resJson.friendList.length > 0) {
          resJson.friendList.forEach(function (v) {
            this.following.push(v)
            if (v.userId == this.$store.state.ACFunCommon.userId) {
              this.hasMyself = true
            }
          }, this);
        }
        pcursor = resJson.pcursor
      }
      console.log(resJson.friendList)
      //http://api-new.app.acfun.cn/rest/app/relation/getFollows?toUserId=36424299&action=7&pcursor=
      //console.log(this.uperId)
    },

  }
}
</script>