<script setup>
import { ref, watch, onMounted, onUpdated, nextTick } from 'vue'
import draggable from 'vuedraggable'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  localImageOperations: {
    type: Array,
    required: true,
  },
  modificationEnabled: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['removeOperation', 'update:localImageOperations', 'selectOperation'])

const selectedOperation = ref(null)
const internalList = ref([...props.localImageOperations])

watch(
  () => props.localImageOperations,
  (newVal) => {
    internalList.value = [...newVal]
  },
  { immediate: true, deep: true },
)

const removeOperation = (index, operation) => {
  if (operation === selectedOperation.value) {
    console.log('Removing selected operation:', operation)
    selectedOperation.value = null
  }
  internalList.value.splice(index, 1)
  emit('update:localImageOperations', [...internalList.value])
}

const onDragUpdate = () => {
  emit('update:localImageOperations', [...internalList.value])
}

const selectOperation = (operation) => {
  if (selectedOperation.value === operation) {
    selectedOperation.value = null
    emit('selectOperation', null)
  } else {
    selectedOperation.value = operation
    emit('selectOperation', operation)
  }
}

const handleSelect = (e, operation) => {
  if (e.target.closest('.drag-handle') || props.disabled) return
  selectOperation(operation)
}

const getOperationLabel = (type) => {
  switch (type) {
    case 'rotation':
      return t('tools.preset.settings.myPresets.presetValues.transformations.rotation')
    case 'flip':
      return t('tools.preset.settings.myPresets.presetValues.transformations.flip')
    case 'smartCrop':
      return t('tools.preset.settings.myPresets.presetValues.smartCrop.label')
    case 'grayscale':
      return t('tools.preset.settings.myPresets.presetValues.grayscale.label')
    default:
      return type
  }
}
</script>

<template>
  <draggable
    v-model="internalList"
    tag="div"
    item-key="id"
    handle=".drag-handle"
    animation="200"
    ghost-class="drag-ghost"
    class="operations-list"
    @update="onDragUpdate"
    :class="{ 'disabled-list': props.disabled }"
  >
    <template #item="{ element, index }">
      <div
        class="operation-item"
        @click="(e) => handleSelect(e, element)"
        :class="{
          selected: selectedOperation === element && props.modificationEnabled,
          modificationEnabled: props.modificationEnabled,
        }"
      >
        <div class="drag-handle" :class="{ hide: !props.modificationEnabled }">☰</div>

        <div class="operation-type">
          {{ getOperationLabel(element.type) }}
        </div>

        <div class="operation-value">
          <div v-if="element.type === 'rotation'">
            <p>{{ element.angle }}°</p>
          </div>
          <div v-else-if="element.type === 'flip'">
            <p>
              {{
                element.direction === 'horizontal'
                  ? t('tools.preset.settings.myPresets.presetValues.transformations.horizontalFlip')
                  : t('tools.preset.settings.myPresets.presetValues.transformations.verticalFlip')
              }}
            </p>
          </div>
          <div v-else-if="element.type === 'smartCrop'">
            <div class="color-circle" :style="{ backgroundColor: element.color }"></div>
          </div>
        </div>

        <div
          class="remove-button"
          @click.stop="removeOperation(index, element)"
          :class="{ hide: !props.modificationEnabled }"
        >
          ✕
        </div>
      </div>
    </template>
  </draggable>
</template>

<style scoped>
.operations-list {
  height: 300px;
  width: fit-content;
  max-width: 100%;
  min-width: 80%;
  overflow-y: auto;
  border-radius: 10px;
  margin-top: 10px;
  background: var(--secondary-c);
  border: solid 1px var(--secondary-c);
}

.operation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--background-c);
  padding: 6px 10px;
  transition: 0.25s ease;
}

.operation-item.selected {
  background-color: var(--background-c);
}
.operation-item.modificationEnabled {
  cursor: pointer;
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

.drag-ghost {
  opacity: 0.4;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px dashed var(--primary-c);
}

.operation-type {
  font-size: var(--text-font-size);
  flex-shrink: 0;
  color: var(--text-c);
}

.operation-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: end;
  color: var(--text-c);
  font-size: var(--text-font-size);
}

.operation-value p {
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

.disabled-list {
  opacity: 0.5;
}

.color-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: var(--border-input);
}
</style>
