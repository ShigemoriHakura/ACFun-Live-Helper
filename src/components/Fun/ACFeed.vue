<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="2">
        <v-text-field v-model="uperId" label="用户UID"></v-text-field>
        <v-btn elevation="2" @click="load">读取</v-btn>
      </v-col>
      <v-col cols="12" md="10">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  载入了的动态数量 ({{feeds.length}})
                </th>
                <th class="text-left">
                  类型
                </th>
                <th class="text-left">
                  时间
                </th>
                <th class="text-left">
                  链接内容
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in feeds" :key="item.id">
                <td v-html="item.feed"></td>
                <td>{{ item.type }}</td>
                <td>{{ item.time }}</td>
                <td>
                  <v-btn elevation="2" color="primary" v-for="link in item.links" :key="link.name"
                    @click="openExternal(link.url)">
                    {{link.name}}</v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { shell } from 'electron'

export default {
  name: 'Gift',
  data() {
    return {
      uperId: 0,
      feeds: [],
    }
  },
  methods: {
    async load() {
      this.feeds = []
      var res = await this.$ACFunCommon.getHTTPResult(
        "https://api-new.app.acfun.cn/rest/app/feed/profile?userId=" + this.uperId + "&count=100",
        "",
        []
      )
      var resJson = JSON.parse(res.body)
      if (resJson.result == 0) {
        resJson.feedList.forEach(element => {
          var feedDone = this.getFeed(element)
          if (feedDone) {
            this.feeds.push(feedDone)
          }
        });
      }
    },
    getFeed(data) {
      var returnData = {
        id: data.resourceId,
        time: data.time,
        links: [{
          name: "原文链接",
          url: data.shareUrl
        }]
      }
      if (data.moment != undefined) {
        if (data.moment.imgs != undefined) {
          var imageI = 1
          data.moment.imgs.forEach(element => {
            returnData.links.push({
              name: "图片" + imageI,
              url: element.originUrl
            })
            imageI++
          })
        }
      }
      switch (data.resourceType) {
        case 2:
        case 3:
          returnData.feed = this.translateFeed(data)
          returnData.type = "稿件"
          return returnData
          break
        case 10:
          if (data.repostSource) {
            switch (data.repostSource.resourceType) {
              case 2:
              case 3:
                returnData.feed = this.replaceAll(data.moment.text, "\n", "<br />") + " <br /><br /> 原文> " + data.repostSource.caption
                returnData.type = "转发稿件"
                return returnData
                break
              case 10:
                returnData.feed = this.replaceAll(data.moment.text, "\n", "<br />") + " <br /><br /> 原文> " + data.repostSource.moment.text
                returnData.type = "转发动态"
                return returnData
                break
            }
          } else {
            returnData.feed = this.replaceAll(data.moment.text, "\n", "<br />")
            returnData.type = "普通"
            return returnData
            break
          }
      }
    },
    translateFeed(feedData) {
      switch (feedData.resourceType) {
        case 2:
          return "发布了视频：" + feedData.caption
          break
        case 3:
          return "发布了文章：" + feedData.articleTitle
          break
        case 10:
          break
      }
    },
    replaceAll(text, need, to) {
      while (!(text.indexOf(need) < 1)) {
        text = text.replace(need, to)
      }
      return text
    },
    openExternal(link) {
      shell.openExternal(link)
    }
  }
}
</script>