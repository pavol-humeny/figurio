<script setup>
import ItemTip from './ItemTip.vue'
import { useToggleHoldButton } from '@/composables/common/useToggleHoldButton'

const props = defineProps({
  defaultValue: {
    type: Boolean,
    default: false
  },
  startFunction: {
    type: Function,
    required: true
  },
  endFunction: {
    type: Function,
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
  scale: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const { isActive, holdStart, holdEnd } = useToggleHoldButton(props)
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="toggle-switch" :style="{ transform: `scale(${props.scale})` }">
      <div class="toggle-switch-wrapper" :class="{ 'toggle-disabled': props.disabled, active: isActive }"
        @mousedown="holdStart" @mouseup="holdEnd">
        <div class="toggle-switch-slider" :class="{ active: isActive }"></div>
      </div>
    </div>
  </ItemTip>
</template>

<style scoped>
.toggle-switch {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-switch-wrapper {
  position: relative;
  display: flex;
  border: 2px solid var(--secondary-c);
  border-radius: 20px;
  padding: 5px;
  width: 80px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  transition: var(--default-transition);
}

.toggle-switch-wrapper.active {
  background: var(--secondary-c);
}

.toggle-switch-wrapper.toggle-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.toggle-switch-slider {
  position: absolute;
  top: 3px;
  opacity: 0.8;
  left: 5px;
  width: calc(100% / 2 - 5px);
  height: 30px;
  background: var(--primary-c);
  border: 2px solid var(--primary-c);
  border-radius: 15px;
  transition: var(--default-transition);
}

.toggle-switch-slider.active {
  left: calc(100% / 2);
  opacity: 1;
}
</style>
