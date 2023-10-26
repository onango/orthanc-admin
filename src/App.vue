<template>
  <router-view></router-view>
  <router-view name="ContentView"></router-view>
</template>

<script>
export default {
  async created() {
    console.log('Creating App...');
    await this.$store.dispatch('configuration/load');
    await this.$store.dispatch('studies/initialLoad');
    await this.$store.dispatch('labels/refresh');
    console.log('App created');
  },
};
</script>

<style lang="scss">
@import './admin/assets/style/app.scss';
</style>
