<script setup>
import DragAndDropArea from '@/components/editor/DragAndDropArea.vue';

</script>

<template>
  <div class="home-view">
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
