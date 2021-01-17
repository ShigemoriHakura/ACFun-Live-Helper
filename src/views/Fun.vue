<template>
  <div class="about">
    <v-container style="max-width: 100%!important;">
      <v-tabs>
        <v-tab>
          文章/视频抽奖
        </v-tab>
        <v-tab>
          关注检测
        </v-tab>
        <v-tab>
          动态读取
        </v-tab>
        <v-tab-item>
          <ACDraw />
        </v-tab-item>
        <v-tab-item>
          <ACFollow />
        </v-tab-item>
        <v-tab-item>
          <ACFeed />
        </v-tab-item>
      </v-tabs>
    </v-container>
  </div>
</template>

<script>
import { formatDate } from '@/utils/timeFormat'
import ACDraw from '@/components/Fun/ACDraw.vue'
import ACFollow from '@/components/Fun/ACFollow.vue'
import ACFeed from '@/components/Fun/ACFeed.vue'

export default {
  data() {
    return {
    }
  },
  components: {
    ACDraw,
    ACFollow,
    ACFeed
  },
  filters: {
    formatDate(time) {
      let date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  },
  created() {
  },
  methods: {
  }
}
</script>