  <script setup>
  import ItemTip from './ItemTip.vue'
  import BaseIcon from '../icons/BaseIcon.vue'
  import { useNumberDropdownInput } from '@/composables/common/useNumberDropdownInput'
  import { useUiStore } from '@/stores/uiStore'

  /**
   * @typedef {Object} NumberDropdownInputProps
   * @property {number} modelValue - Current input value (v-model)
   * @property {Array<number>} options - Dropdown options
   * @property {string} [tip=''] - Tooltip text
   * @property {string} [position='bottom'] - Tooltip position
   * @property {boolean} [disabled=false] - Whether the input is disabled
   * @property {string} [icon=''] - Icon name to display in the input
   * @property {string} [color='var(--text-c)'] - Icon color
   * @property {string|number} [size='16'] - Icon size
   * @property {number} [min=0] - Minimum value for the input
   * @property {number} [max=Infinity] - Maximum value for the input
   * @property {number} [step=1] - Step value for the input
   */

  /** @type {NumberDropdownInputProps} */
  const props = defineProps({
    modelValue: Number,
    options: Array,
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
    icon: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'var(--text-c)'
    },
    size: {
      type: [String, Number],
      default: '16'
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: Infinity
    },
    step: {
      type: Number,
      default: 1
    },
    background: {
      type: String,
      default: 'var(--secondary-c)'
    },
    onReset: {
      type: Function,
      default: null,
    },
    unit: {
      type: String,
      default: '',
    },
  })

  /**
   * @event update:modelValue - Emitted when the input value changes
   * @event update - Emitted for compatibility with older versions
   */
  const emit = defineEmits(['update:modelValue', 'update'])

  /**
   * Logic of the number dropdown input component
   */
  const { inputValue,
    showDropdown,
    inputRef,
    onInput,
    onSelect,
    toggleDropdown,
    setValue,
    onCommit,
    wrapperRef,
    dropdownRef,
    dropdownStyle,
    dropdownReady,
    onIconDoubleClick,
    showIcon,
    showUnit,
  } = useNumberDropdownInput(props, emit, useUiStore())

  /**
   * Supports primitive options and object options in shape { value, label }.
   * @param {number|string|{value:number|string,label?:string}} option
   * @returns {number|string}
   */
  const getOptionValue = (option) =>
    option && typeof option === 'object' && 'value' in option ? option.value : option

  /**
   * @param {number|string|{value:number|string,label?:string}} option
   * @returns {string|number}
   */
  const getOptionLabel = (option) =>
    option && typeof option === 'object' && 'label' in option ? option.label : option

  /**
   * Expose methods for external use
   * @type {{ setValue: (val: string) => void }}
   */
  defineExpose({ setValue })

  console.warn(showIcon, showUnit)
</script>

<template>
  <ItemTip :text="!showDropdown ? props.tip : ''" :position="props.position">
    <div class="number-dropdown-wrapper" ref="wrapperRef" :style="{
      '--wrapper-width': (showUnit || showIcon) ? (showIcon && showUnit) ? '120px' : '100px' : '80px',
    }">
      <input ref="inputRef" class="text-input" type="number" :disabled="props.disabled" :min="props.min"
        :max="props.max" :step="props.step" v-model="inputValue" @input="onInput" @blur="onCommit"
        @keydown.enter="onCommit" :style="{
          background: props.background, paddingLeft: showIcon ? '30px' : '10px',
          paddingRight: showUnit ? '50px' : '30px',
        }" />

      <BaseIcon v-if="props.icon" :name="props.icon" :size="props.size" :color="props.color" class="input-icon"
        @dblclick="onIconDoubleClick" :style="{ top: props.iconTop + '%' }" />

      <span v-if="showUnit" class="input-unit" :class="{ disabled: props.disabled }">{{
        props.unit
      }}</span>

      <BaseIcon name="IconDropDown" class="dropdown-icon" size="12" color="var(--primary-c)"
        :style="{ transform: showDropdown ? 'rotate(180deg) translateY(4px)' : 'rotate(0deg)' }"
        @click="toggleDropdown" />
    </div>
  </ItemTip>

  <Teleport to="body">
    <ul v-if="showDropdown && dropdownReady" class="dropdown-options-teleported" ref="dropdownRef"
      :style="dropdownStyle">
      <li v-for="(opt, index) in props.options" :key="`${getOptionValue(opt)}-${getOptionLabel(opt)}-${index}`"
        @mousedown.prevent="onSelect(getOptionValue(opt))"
        :style="{ background: props.background }">
        {{ getOptionLabel(opt) }}
      </li>
    </ul>
  </Teleport>
</template>


<style scoped>
.number-dropdown-wrapper {
  position: relative;
  display: inline-block;
  min-width: var(--wrapper-width);
  height: 27px;
}

.text-input {
  width: 100%;
  height: 100%;
  padding: 7px 25px 7px 10px;
  border-radius: var(--input-border-radius);
  border: none;
  color: var(--text-c);
  text-align: center;
  font-family: var(--font-family);
}

.text-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.input-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: auto;
}

.dropdown-icon {
  position: absolute;
  right: 8px;
  top: 2px;
  transform: translateY(-50%);
  cursor: pointer;
  pointer-events: auto;
  height: 100%;
  box-sizing: border-box;
}

.dropdown-options-teleported {
  margin: 0;
  color: var(--text-c);
  list-style: none;
  padding: 0;
  border-radius: var(--input-border-radius);
  overflow-y: auto;
  max-height: 250px;
  box-shadow: var(--box-shadow-ui);
  z-index: var(--z-index-dropdown-options);
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

.input-unit {
  position: absolute;
  right: 26px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  pointer-events: none;
  color: var(--text-placeholder-c);
}
</style>
