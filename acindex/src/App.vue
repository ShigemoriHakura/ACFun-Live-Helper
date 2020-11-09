<template>
  <v-app>
    <v-main>
      <RedirectToLatest />
    </v-main>
  </v-app>
</template>

<script>
import RedirectToLatest from './components/RedirectToLatest';

export default {
  name: 'App',

  components: {
    RedirectToLatest,
  },

  data: () => ({
    //
  }),
};
</script>
