<script setup>
import { useImageStore } from '@/stores/imageStore'
import draggable from 'vuedraggable'
import { useI18n } from 'vue-i18n'
import { useSvgObjectsList } from '@/composables/toolsSettings/useSvgObjectsList'
import { useHistoryStore } from '@/stores/historyStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useEditorStore } from '@/stores/editorStore'
import { useUiStore } from '@/stores/uiStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const { t } = useI18n()

const imageStore = useImageStore()

/**
 * Logic for managing SVG objects list
 */
const {
  mappedObjects,
  panelVars,
  startResize,
  selectObject,
  deleteObject,
  renameObject,
  editingId,
  startEditing,
  editingInputRef,
  getElementName,
} = useSvgObjectsList(useImageStore(), useHistoryStore(), useViewportStore(), useEditorStore(), useUiStore(), useWorkspaceStore(), t)
</script>

<template>
  <div class="svg-objects-list-panel" :style="panelVars">
    <div class="svg-objects-list-wrapper">
      <p>Objects</p>
      <draggable v-model="mappedObjects" tag="div" item-key="id" handle=".drag-handle" animation="200"
        ghost-class="drag-ghost" class="svg-objects-list"
        :move="({ element }) => element ? element.draggable !== false : true">
        <template #item="{ element }">
          <div class="svg-object-item" :class="{ selected: imageStore.selectedSvgObjectId === element.id }"
            @click="selectObject(element.id)">
            <span class="drag-handle" :style="{ opacity: element.draggable ? 1 : 0 }">☰</span>

            <input v-if="editingId === element.id" ref="editingInputRef" class="rename-input" type="text"
              :value="getElementName(element.name)" @input="element.name = $event.target.value"
              @keyup.enter="renameObject(element.id, element.name)" @blur="renameObject(element.id, element.name)"
              autofocus maxlength="20" />
            <span v-else class="object-name" @dblclick="startEditing(element.id)">
              {{ getElementName(element.name) }}
            </span>

            <div v-if="imageStore.selectedSvgObjectId === element.id" class="delete-button" @click.stop="deleteObject">✕
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
  </div>

</template>

<style scoped>
.svg-objects-list-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: var(--panel-height);
  background: var(--background-c);
  z-index: var(--z-index-tools-settings-panel);
  overflow: hidden;
}

.resize-handle {
  height: 5px;
  width: 100%;
  cursor: ns-resize;
  background: transparent;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-top: var(--border-ui-2);
}

.resize-handle:hover {
  border-top: var(--border-modal);
}

.svg-objects-list-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: 20px 30px;
  overflow-y: auto;
}

.svg-objects-list {
  height: fit-content;
  width: 100%;
  max-width: 100%;
  min-width: 80%;
  overflow-y: auto;
  border-radius: 10px;
  margin-top: 10px;
  background: var(--background-c);
  border: solid 1px var(--secondary-c);
}

.svg-object-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--background-c);
  padding: 6px 10px;
  transition: 0.25s ease;
  width: 100%;
}

.svg-object-item.selected {
  background-color: var(--secondary-c);
  color: var(--primary-c);
}

.drag-handle {
  cursor: grab;
  color: var(--text-c);
  user-select: none;
  padding-right: 6px;
}

.drag-handle:active {
  cursor: grabbing;
}

.delete-button {
  cursor: pointer;
  color: var(--primary-c);
  font-weight: bold;
  padding-left: 8px;
}

.object-name {
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.rename-input {
  flex: 1;
  min-width: 0;
  padding: 2px 2px;
  border-radius: 4px;
  color: var(--text-c);
  outline: none;
  background: var(--background-c);
  border: none;
}

.rename-input:focus {
  border-color: var(--primary-c);
}
</style>
