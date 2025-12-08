<script setup>
import BaseIcon from '../icons/BaseIcon.vue'
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
  onEnter,
  inputRef,
  isSupported,
  pickColor,
} = useColorPicker(props, emit)

/**
 * Expose setValue method to parent components
 */
defineExpose({ setValue })
</script>

<template>

  <div class="color-wrapper">
    <ItemTip :text="props.tip" :position="props.position">
      <div ref="previewRef" class="color-preview" @click="toggle" :style="{ background: colorValue }"
        :class="{ disabled: props.disabled }"></div>
    </ItemTip>
    <div class="hex-input-wrapper">
      <input class="hex-input-visible" type="text" ref="inputRef" v-model="hexValue" maxlength="7" @input="onHexInput"
        @blur="onHexBlur" @keydown.enter="onEnter" :class="{ disabled: props.disabled }" />
    </div>

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

        <div class="input-dropper-wrapper">
          <!-- Hex input -->
          <div class="hex-input-wrapper">
            <input class="hex-input" type="text" v-model="hexValue" maxlength="7" @input="onHexInput"
              @blur="onHexBlur" />
          </div>

          <!-- Eye dropper -->
          <div class="eye-dropper">
            <BaseIcon name="IconEyeDropper" size="18" color="var(--primary-c)" :tip="$t('tools.colorEyeDropper.tip')"
              position="bottom-left" :disabled="!isSupported || props.disabled" @click="pickColor"
              style="cursor: pointer; z-index: var(--z-index-color-eyedropper);" />
          </div>
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
</template>


<style scoped>
.color-wrapper {
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 5px;
  background: var(--secondary-c);
  border-radius: var(--input-border-radius);
  padding: var(--input-top-padding) 5px;
}

.color-preview {
  width: 18px;
  height: 18px;
  border: var(--border-modal);
  border-radius: 4px;
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

.hex-input-visible {
  width: 9ch;
  font-size: var(--input-text-size);
  border-radius: 4px;
  background: var(--secondary-c);
  border: none;
  color: var(--text-c);
  text-align: center;
  padding: 0;
  font-size: var(--input-text-size);
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

.input-dropper-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.hex-input-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hex-input {
  width: 11ch;
  padding: var(--input-top-padding) 10px;
  font-size: var(--input-text-size);
  border-radius: var(--input-border-radius);
  background: var(--secondary-c);
  border: none;
  color: var(--text-c);
  text-align: center;
}

.hex-input::selection {
  background: var(--primary-c);
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
