<template>
  <v-app id="inspire">
    <v-navigation-drawer app>
      <v-list nav>
        <v-list-item v-for="item in items" :key="item.title" :to="item.link" link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
  },

  data () {
    return {
      items: [
        { title: '弹幕助手', icon: 'mdi-view-dashboard', link: '/'},
        { title: '关于', icon: 'mdi-help-box', link: '/about'},
      ],
      right: null,
    }
  },
};
</script>
