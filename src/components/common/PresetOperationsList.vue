<script setup>
import { ref } from 'vue'

const props = defineProps({
  localImageOperations: {
    type: Array,
    required: true,
  },
  modificationEnabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['removeOperation', 'update:localImageOperations'])

const draggedIndex = ref(null)

const onDragStart = (event, index) => {
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index)
  event.dataTransfer.setDragImage(event.target, 0, 0)
}

const onDrop = (index) => {
  if (draggedIndex.value === null || draggedIndex.value === index) return

  const updated = [...props.localImageOperations]
  const [movedItem] = updated.splice(draggedIndex.value, 1)
  updated.splice(index, 0, movedItem)

  emit('update:localImageOperations', updated)
  draggedIndex.value = null
}

const onDragOver = (event) => {
  event.preventDefault()
}

const removeOperation = (index) => {
  emit('removeOperation', index)
}
</script>

<template>
  <transition-group name="fade-move" tag="div" class="operations-list">
    <div
      v-for="(operation, index) in props.localImageOperations"
      :key="operation.id || index"
      class="operation-item"
      :class="{ dragging: draggedIndex === index }"
      @dragover="onDragOver"
      @drop="onDrop(index)"
    >
      <div
        class="drag-handle"
        draggable="true"
        @dragstart="(e) => onDragStart(e, index)"
        @dragend="() => { draggedIndex = null }"
        :class="{ hide: !props.modificationEnabled }"
      >
        ☰
      </div>

      <div class="operation-type">
        {{ operation.type }}
      </div>

      <div class="operation-value">
        <div v-if="operation.type === 'rotation'">
          <p>{{ operation.angle }}°</p>
        </div>
        <div v-else-if="operation.type === 'flip'">
          <p>{{ operation.direction }}</p>
        </div>
        <div v-else-if="operation.type === 'smartCrop'">
          <p :style="{ color: operation.color }">{{ operation.color }}</p>
        </div>
      </div>

      <div
        class="remove-button"
        @click="removeOperation(index)"
        :class="{ hide: !props.modificationEnabled }"
      >
        ✕
      </div>
    </div>
  </transition-group>
</template>

<style scoped>
.operations-list {
  height: 300px;
  overflow-y: auto;
  border-radius: 10px;
  padding: 7px 10px;
  margin-top: 10px;
  background: var(--secondary-c);
  border: solid 1px var(--secondary-c);
}

/* Animácia presunu */
.fade-move-move {
  transition: transform 0.25s ease;
}

/* Každá položka v zozname */
.operation-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  border-bottom: 1px solid var(--background-c);
  padding: 6px 0;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

/* Položka pri ťahaní */
.operation-item.dragging {
  opacity: 0.5;
  transform: scale(1.02);
  z-index: 10;
  position: relative;
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

.operation-type {
  font-size: var(--text-font-size);
  width: 100px;
  flex-shrink: 0;
  color: var(--text-c);
}

.operation-value {
  flex: 1;
  color: var(--text-c);
  font-size: var(--text-font-size);
}

.remove-button {
  cursor: pointer;
  color: var(--primary-c);
  font-weight: bold;
  padding-left: 8px;
}

.hide {
  display: none;
}
</style>
