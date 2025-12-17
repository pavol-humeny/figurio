<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import DefaultButton from '@/components/common/DefaultButton.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useDragAndDropArea } from '@/composables/editor/useDragAndDropArea'
import { useI18n } from 'vue-i18n'
import { useImageStore } from '@/stores/imageStore'
import { useRouter } from 'vue-router'
import { useEditorStore } from '@/stores/editorStore'
import { onMounted, onUnmounted } from 'vue'
import { useUserModeStore } from '@/stores/userModeStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useUiStore } from '@/stores/uiStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useHistoryStore } from '@/stores/historyStore'

const { t } = useI18n()
const router = useRouter()
const editorStore = useEditorStore()

/**
 * @typedef {Object} DragAndDropProps
 * @property {boolean} isHomePage - Whether it is a drag and drop on home page (do not show button)
 */

/** @type {DragAndDropProps} */
const props = defineProps({
  isHomePage: {
    type: Boolean,
    default: false,
  }
})

/**
 * Logic of the drag-and-drop area
 */
const {
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  selectFile,
  handlePaste,
} = useDragAndDropArea(useImageStore(), useEditorStore(), t, router, useUserModeStore(), useWorkspaceStore(), useUiStore(), useViewportStore(), useHistoryStore())

/**
 * Enable paste event listener on mount
 */
onMounted(() => {
  editorStore.imageCanBePasted = true
  document.addEventListener('paste', handlePaste)
})

/**
 * Disable paste event listener on unmount
 */
onUnmounted(() => {
  editorStore.imageCanBePasted = false
  document.removeEventListener('paste', handlePaste)
})
</script>

<template>
  <div class="drag-and-drop-area" :class="{ dragging: isDragging }" @dragover="handleDragOver"
    @dragleave="handleDragLeave" @drop.stop="handleDrop" id="drag-drop-area">
    <ItemTip :text="$t('dragAndDropArea.tip')" position="bottom">
      <div class="icon-wrap button-clickable" @click="selectFile">
        <BaseIcon name="IconImport" size="74" :color="'var(--primary-c)'" />
      </div>
    </ItemTip>
    <div class="title-wrapper">
      <p>{{ $t('dragAndDropArea.title') }}</p>
    </div>
    <div class="supported-formats-wrapper">
      <p>{{ $t('dragAndDropArea.supportedFormats') }}</p>
    </div>
    <div class="subtitle-wrapper">
      <p v-if="!props.isHomePage">{{ $t('dragAndDropArea.subtitle') }}</p>
      <p class="small">{{ $t('dragAndDropArea.pasteHint') }}</p>

    </div>
    <div v-if="!props.isHomePage" class="button-wrapper">
      <DefaultButton :text="$t('dragAndDropArea.button.text')" @click="selectFile" />
    </div>
  </div>
</template>

<style scoped>
.drag-and-drop-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  border: var(--border-drag-and-drop);
  background: var(--secondary-c);
  box-shadow: var(--box-shadow-ui);
  user-select: none;
  transition: var(--default-transition);
}

.drag-and-drop-area.dragging {
  transform: scale(1.01);
  transition: var(--default-transition);
  opacity: 0.95;
}

.icon-wrap {
  border-radius: 20px;
  padding: 2px;
  background: var(--background-c);
  cursor: pointer;
  transition: var(--default-transition);
}

.icon-wrap:hover {
  transition: var(--default-transition);
  box-shadow: var(--box-shadow-hover);
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
  margin-top: 20px;
  text-align: center;
}

.subtitle-wrapper {
  font-size: var(--subtitle-font-size);
  color: var(--primary-c);
}

.small {
  margin-top: 5px;
  font-size: 90%;
}

.subtitle-wrapper p {
  text-align: center;
}

.button-wrapper {
  margin-top: 20px;
}

.supported-formats-wrapper {
  font-size: var(--tip-font-size);

}
</style>
