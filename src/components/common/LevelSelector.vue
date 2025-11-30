<script setup>
import ItemTip from './ItemTip.vue'
import { useLevelSelector } from '@/composables/common/useLevelSelector'

/**
 * @typedef {Object} LevelSelectorProps
 * @property {Array<number|string>} levels - List of values for each level (e.g. [1,2,3])
 * @property {number|string} modelValue - Currently selected level
 * @property {boolean} [disabled=false] - Whether interaction is disabled
 * @property {string} [tip=''] - Tooltip text
 * @property {string} [position='bottom'] - Tooltip position
 */

/** @type {LevelSelectorProps} */
const props = defineProps({
  levels: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [Number, String],
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  tip: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'bottom',
  },
})

/**
 * Emits:
 *  - update:modelValue
 *  - update
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Logic for level selection
 */
const {
  selectLevel,
} = useLevelSelector(props, emit)

</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="level-wrapper" :class="{ disabled: props.disabled }">

      <!-- Connecting line -->
      <div class="line"></div>

      <!-- Level dots -->
      <div class="levels">
        <div v-for="level in props.levels" :key="level" class="dot" :class="{ active: level === props.modelValue }"
          @click="selectLevel(level)">
          {{ level }}
        </div>
      </div>

    </div>
  </ItemTip>
</template>

<style scoped>
.level-wrapper {
  position: relative;
  width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Connecting line behind dots */
.line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--secondary-c);
  transform: translateY(-50%);
  border-radius: 5px;
}

/* Container for dots */
.levels {
  position: relative;
  display: flex;
  gap: 15px;
}

/* Each level dot */
.dot {
  border-radius: 50%;
  background: var(--secondary-c);
  color: var(--text-c);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: calc(var(--input-text-size) + var(--input-top-padding) * 2);
  height: calc(var(--input-text-size) + var(--input-top-padding) * 2);
  font-size: var(--input-text-size);
  line-height: 1;
  flex-shrink: 0;
  text-align: center;

  /* animation */
  transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease;
}

/* Selected dot animation */
.dot.active {
  background: var(--primary-c);
  color: var(--background-c);
}

/* Click effect */
.dot:active {
  transform: scale(1.1);
}

/* Disabled state */
.disabled .dot {
  opacity: 0.5;
  pointer-events: none;
}
</style>
