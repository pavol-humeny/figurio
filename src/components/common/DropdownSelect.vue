<script setup>
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import { useDropdownSelect } from '@/composables/common/useDropdownSelect'
import { useUiStore } from '@/stores/uiStore'

/**
 * @typedef {Object} DropdownSelectProps
 * @property {string|number} modelValue - Currently selected value (v-model)
 * @property {{label: string, value: string|number}[]} options - Available options for the select input
 * @property {string} [tip=''] - Tooltip text to show on hover
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the select input is disabled
 * @property {string} [icon=''] - Optional icon name to display on the left
 * @property {string} [color='var(--text-c)'] - Icon color
 * @property {string|number} [size='16'] - Icon size in px
 * @property {Function|null} [onReset=null] - Optional function to call on double-clicking the icon
 */

/** @type {DropdownSelectProps} */
const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  options: {
    type: Array,
    required: true,
    // { label: 'Text', value: 'value' }
  },
  tip: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'bottom',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'var(--text-c)',
  },
  size: {
    type: [String, Number],
    default: '16',
  },
  onReset: {
    type: Function,
    default: null,
  },
})

/**
 * @event update:modelValue - Emitted when the selected value changes (for v-model)
 * @event update - Emitted when the selected value changes
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Logic of the dropdown select component
 */
const {
  selectedValue,
  onIconDoubleClick,
  setValue,
  showIcon,
  showDropdown,
  onSelect,
  toggleDropdown,
  wrapperRef,
  longestLabelWidth,
  dropdownRef,
  dropdownStyle,
  dropdownReady,
} = useDropdownSelect(props, emit, useUiStore())


/**
 * Expose methods for external use
 * @type {{ setValue: (val: string|number) => void }}
 */
defineExpose({ setValue })
</script>

<template>
  <ItemTip :text="!showDropdown ? props.tip : ''" :position="props.position">
    <div class="select-wrapper" ref="wrapperRef" :style="{ minWidth: longestLabelWidth + 'px' }">
      <BaseIcon v-if="showIcon" :name="props.icon" class="input-icon-left" :size="props.size" :color="props.color"
        @dblclick="onIconDoubleClick" />

      <div class="select-display" :style="{ paddingLeft: showIcon ? '30px' : '10px' }" @click="toggleDropdown">
        {{props.options.find(o => o.value === selectedValue)?.label || ''}}

        <BaseIcon name="IconDropDown" class="dropdown-icon" size="12" color="var(--primary-c)"
          :style="{ transform: showDropdown ? 'rotate(180deg) translateY(7px)' : 'rotate(0deg)' }" />
      </div>
    </div>
  </ItemTip>

  <Teleport to="body">
    <ul v-if="showDropdown && dropdownReady" class="dropdown-options-teleported" ref="dropdownRef"
      :style="dropdownStyle">
      <li v-for="option in props.options" :key="option.value" @click.prevent="onSelect(option.value)">
        {{ option.label }}
      </li>
    </ul>
  </Teleport>
</template>


<style scoped>
.select-wrapper {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.select-display {
  padding: var(--input-top-padding) 10px;
  border-radius: var(--input-border-radius);
  background: var(--secondary-c);
  color: var(--text-c);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: var(--input-text-size);
}

.input-icon-left {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: auto;
  cursor: pointer;
}

.input-icon-right {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.dropdown-options-teleported {
  margin: 0;
  color: var(--text-c);
  list-style: none;
  padding: 0;
  border-radius: var(--input-border-radius);
  background: var(--secondary-c);
  overflow-y: auto;
  max-height: 250px;
  box-shadow: var(--box-shadow-ui);
  z-index: var(--z-index-dropdown-options);
  font-size: var(--text-font-size);
  position: fixed;
  top: 0;
  left: 0;
}

.dropdown-options-teleported li {
  padding: 6px 10px;
  cursor: pointer;
}

.dropdown-options-teleported li:hover {
  color: var(--primary-c);
}

.dropdown-icon {
  position: absolute;
  right: 8px;
  top: 3px;
  transform: translateY(-50%);
  cursor: pointer;
  pointer-events: auto;
  height: 100%;
  box-sizing: border-box;
}
</style>
