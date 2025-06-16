<script setup>
import { RouterLink, RouterView } from 'vue-router'
import TopPanel from './components/topPanel/TopPanel.vue';
</script>

<template>
  <div class="main">
    <TopPanel />
    <!-- <RouterView /> -->
  </div>
</template>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: var(--background-c);
}
</style>
