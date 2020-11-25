<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="acLink" label="文章或视频AC号，如AC18826178"></v-text-field>
        <v-text-field v-model="drawAmount" type="number" label="抽奖个数"></v-text-field>
        <v-btn elevation="2" color="primary" @click="loadUrl">读取</v-btn>
        <v-btn elevation="2" @click="getResult">抽奖</v-btn>
        <v-btn elevation="2" @click="cleanTable">清除</v-btn>
      </v-col>
      <v-col cols="12" md="5">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  发送者
                </th>
                <th class="text-left">
                  UID
                </th>
                <th class="text-left">
                  评论
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in comment" :key="item.name">
                <td>{{ item.userName }}</td>
                <td>{{ item.userId }}</td>
                <td>{{ item.content }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col cols="12" md="3">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  中奖者
                </th>
                <th class="text-left">
                  ID
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in commentDrawed" :key="item.name">
                <td>{{ item.userName }}</td>
                <td>{{ item.userId }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Gift',
  data() {
    return {
      text: "",
      items: [],
      comment: [],
      acLink: "",
      drawAmount: 1,
      commentDrawed: [],
    }
  },
  methods: {
    getComments(link, page) {
      return new Promise(resolve =>
        fetch(`https://acmate.loli.ren/api/commentapi?commentid=` + link + `&page=${page || 1}`)
          .then(r => r.json())
          .then(resolve)
          .catch(() => alert('网络错误，请重试'))
      );
    },
    async loadUrl() {
      var article = this.acLink.replace("ac", "").replace("AC", "")
      const { totalPage, rootComments } = await this.getComments(article);
      (await Promise.all(Array
        .from({ length: totalPage - 1 })
        .map((_, i) => this.getComments(article, i + 2)),
      )).forEach(({ rootComments: commentList }) => {
        rootComments.push(...commentList);
      });
      this.comment = rootComments
    },
    getResult() {
      this.commentDrawed = this.makeRandomArr(this.comment, this.drawAmount)
    },
    makeRandomArr(arrList, num) {
      if (num > arrList.length) {
        return;
      }
      var tempArr = arrList.slice(0);
      var newArrList = [];
      for (var i = 0; i < num; i++) {
        var random = Math.floor(Math.random() * (tempArr.length));
        var arr = tempArr[random];
        tempArr.splice(random, 1);
        newArrList.push(arr);
      }
      return newArrList;
    },
    cleanTable() {
      this.comment = []
      this.commentDrawed = []
    }
  }
}
</script>