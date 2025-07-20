<script setup>
import { usePresetsStore } from '@/stores/presetsStore'
import { computed } from 'vue'
import { useImageStore } from '@/stores/imageStore'

const imageStore = useImageStore()
const presetsStore = usePresetsStore()

/**
 * Computed cropBox from the selected preset (if present)
 */
const cropBox = computed(() => {
  const cropOp = presetsStore.selectedPreset?.imageOperations.find((op) => op.type === 'crop')
  return cropOp?.cropBox ?? null
})

/**
 * Determines whether the cropBox should be shown
 */
const showCropBox = computed(() => {
  const box = cropBox.value
  const dim = imageStore.fileDimensions
  if (!box || !dim) return false

  return (
    box.x >= 0 &&
    box.y >= 0 &&
    box.width > 0 &&
    box.height > 0 &&
    box.x + box.width <= dim.width &&
    box.y + box.height <= dim.height
  )
})
</script>

<template>
  <div v-if="showCropBox" class="crop-overlay">
    <div class="crop-box" :style="{
      left: cropBox.x + 'px',
      top: cropBox.y + 'px',
      width: cropBox.width + 'px',
      height: cropBox.height + 'px',
    }"></div>
  </div>
</template>

<style scoped>
.crop-overlay {
  position: absolute;
  pointer-events: none;
}

.crop-box {
  position: absolute;
  border: var(--border-crop);
  background-color: var(--crop-c);
  pointer-events: auto;
}
</style>
