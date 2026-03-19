<script setup>
/**
 * @file: UndoRedo.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the undo and redo buttons in the top panel. Renders two buttons that allow users to undo and redo their actions. The buttons are disabled when there are no actions to undo or redo, or when no file is open.
 */
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useUndoRedo } from '@/composables/topPanel/useUndoRedo'
import { useImageStore } from '@/stores/imageStore'
import ItemTip from '@/components/common/ItemTip.vue'
import { useHistoryStore } from '@/stores/historyStore'
import { useUiStore } from '@/stores/uiStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const imageStore = useImageStore()

/**
 * Logic for the undo/redo buttons.
 */
const {
  undo,
  redo,
  canUndo,
  canRedo
} = useUndoRedo(useHistoryStore(), useImageStore(), useUiStore(), t)
</script>

<template>
  <div class="undo-redo" :class="{ disabled: imageStore.file === null }">
    <!-- Undo -->
    <ItemTip :text="canUndo ? $t('topPanel.undoRedo.tip.undo') : ''" position="bottom">
      <div class="undo-button button button-control button-circle button-clickable" @click="undo"
        :class="{ disabled: !canUndo }">
        <BaseIcon name="IconUndo" size="24" />
      </div>
    </ItemTip>

    <!-- Redo -->
    <ItemTip :text="canRedo ? $t('topPanel.undoRedo.tip.redo') : ''" position="bottom">
      <div class="redo-button button button-control button-circle button-clickable" @click="redo"
        :class="{ disabled: !canRedo }">
        <BaseIcon name="IconRedo" size="24" />
      </div>
    </ItemTip>
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
