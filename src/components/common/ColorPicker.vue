<script setup>
import ItemTip from './ItemTip.vue'
import { useColorPicker } from '@/composables/common/useColorPicker'


/**
 * @typedef {Object} ColorPickerProps
 * @property {string} modelValue - The current color value in hex format (v-model)
 * @property {string} [tip=''] - Tooltip text shown on hover
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the color picker is disabled
 */

/** @type {ColorPickerProps} */
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  tip: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'bottom'
  },
  disabled: {
    type: Boolean,
    default: false
  },
})

/**
 * @event update:modelValue - Emitted when the color value changes
 * @event update - Emitted when the color value changes (alias of update:modelValue)
 * @event commit - Emitted when the user finishes selecting a color
 */
const emit = defineEmits(['update:modelValue', 'update', 'commit'])

/**
 * Logic for color picker
 */
const {
  colorValue,
  hueIndicatorColor,
  onHexInput,
  onHexBlur,
  hexValue,
  isVisible,
  panelStyle,
  previewRef,
  panelRef,
  svCanvasRef,
  hueCanvasRef,
  svIndicatorX,
  svIndicatorY,
  hueIndicatorX,
  toggle,
  startSVPick,
  startHuePick,
  recentColors,
  selectRecentColor,
  setValue,
} = useColorPicker(props, emit)

/**
 * Expose setValue method to parent components
 */
defineExpose({ setValue })
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="color-wrapper">
      <div ref="previewRef" class="color-preview" @click="toggle" :style="{ background: colorValue }"
        :class="{ disabled: props.disabled }"></div>

      <Teleport to="body">
        <div v-if="isVisible" ref="panelRef" class="color-settings" :style="panelStyle">
          <!-- SV plocha -->
          <div class="canvas-wrapper">
            <canvas ref="svCanvasRef" class="sv-canvas" width="200" height="200" @mousedown="startSVPick"></canvas>
            <div class="sv-indicator"
              :style="{ left: svIndicatorX + 'px', top: svIndicatorY + 'px', background: colorValue }"></div>
          </div>

          <!-- Hue slider -->
          <div class="canvas-wrapper">
            <canvas ref="hueCanvasRef" class="hue-canvas" width="200" height="10" @mousedown="startHuePick"></canvas>
            <div class="hue-indicator" :style="{ left: hueIndicatorX + 'px', background: hueIndicatorColor }"></div>
          </div>

          <!-- Hex input -->
          <div class="hex-input-wrapper">
            <input class="hex-input" type="text" v-model="hexValue" maxlength="7" @input="onHexInput"
              @blur="onHexBlur" />
          </div>

          <!-- Recent colors -->
          <div class="recent-colors">
            <div v-for="(c, i) in recentColors" :key="i" class="recent-color" :style="{
              background: c || '#ffffff',
              opacity: c ? 1 : 0.3,
              cursor: c ? 'pointer' : 'default'
            }" @click="c && selectRecentColor(c)">
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </ItemTip>
</template>


<style scoped>
.color-wrapper {
  width: 35px;
  height: 35px;
}

.color-preview {
  width: 100%;
  height: 100%;
  border: var(--border-modal);
  border-radius: 50%;
  cursor: pointer;
}

.color-settings {
  position: absolute;
  z-index: var(--z-index-color-picker);
  background: var(--background-c);
  border: var(--border-modal);
  border-radius: 10px;
  padding: 10px;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.canvas-wrapper {
  position: relative;
}

.sv-canvas {
  width: 100%;
  height: 200px;
  border-radius: 5px;
  cursor: pointer;
}

.hue-canvas {
  width: 100%;
  height: 10px;
  cursor: pointer;
  border-radius: 5px;
  cursor: pointer;
}

.sv-indicator {
  position: absolute;
  width: 10px;
  height: 10px;
  border: solid 1px var(--text-c);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  cursor: pointer;
}

.hue-indicator {
  position: absolute;
  top: 4px;
  width: 14px;
  height: 14px;
  border: solid 1px var(--text-c);
  border-radius: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  cursor: pointer;
}

.hex-input-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hex-input {
  width: 10ch;
  padding: 7px 10px;
  font-size: 14px;
  border-radius: 4px;
  background: var(--secondary-c);
  border: none;
  color: var(--text-c);
}

.recent-colors {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  gap: 5px;
}

.recent-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: solid 1px var(--text-c);
  cursor: pointer;
}
</style>
