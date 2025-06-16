<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useUndoRedo } from '@/composables/topPanel/useUndoRedo'

const { undo, redo, canUndo, canRedo } = useUndoRedo()

</script>

<template>
  <div class="undo-redo">
    <div
      class="undo-button button button-control button-circle"
      @click="undo"
      :class="{ 'button--disabled': !canUndo }">
      <BaseIcon name="IconUndo" size="24" />
    </div>
    <div
      class="redo-button button button-control button-circle"
      @click="redo"
      :class="{ 'button--disabled': !canRedo }">
      <BaseIcon name="IconRedo" size="24" />
    </div>
  </div>
</template>

<style scoped>
.undo-redo {
  display: flex;
  align-items: center;
}

.undo-button,
.redo-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Border radius only on left side */
.undo-button {
  border-radius: 20px 0 0 20px;
}
/* Border radius only on right side */
.redo-button {
  border-radius: 0 20px 20px 0;
}

</style>
