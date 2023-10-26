<template>
  <div id="app">
    <!-- <NavBar /> -->
    <AppMain>
      <!-- Your application's content goes here -->
      <!-- For example, a router-view if you're using Vue Router -->
      <router-view></router-view>
      <Sidebar />
      <!-- Place the Sidebar component inside the AppMain component -->
    </AppMain>
  </div>
</template>

<script>
import NavBar from '/src/admin/layout/NavBar.vue';
import SideBar from '/src/admin/layout/SideBar.vue';
import AppMain from '/src/admin/layout/AppMain.vue';

export default {
  components: {
    AppMain,
    Sidebar,
  },
};
</script>

<style lang="scss">
@import 'assets/style/app.scss';
</style>
