<script setup>
import DragAndDropArea from '@/components/editor/DragAndDropArea.vue';

import { useRouter } from 'vue-router';
const router = useRouter();

const ahoj = () => {
  if (router.currentRoute.value.name !== 'editor') {
    router.push({ name: 'editor' })
  }
};

</script>

<template>
  <div class="home-view">
    <button @click="ahoj">Move</button>
    <DragAndDropArea />
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--background-c);
  padding: 14px 20px;
}

</style>
