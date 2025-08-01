<script setup>
import ItemTip from './ItemTip.vue'
import BaseIcon from '@/components/icons/BaseIcon.vue';

const props = defineProps({
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
  icon: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 20,
  },
  color: {
    type: String,
    default: 'var(--primary-c)',
  },
  active: {
    type: Boolean,
    default: false,
  },
  scale: {
    type: Number,
    default: 1,
  },
})

/**
 * Emits a click event when the button is pressed
 * @event click
 */
const emit = defineEmits(['click'])

</script>

<template>
  <ItemTip :text="props.tip" :position="props.position" :style="{ transform: `scale(${props.scale})` }">
    <button class="button button-icon" @click="emit('click')" :class="{
      'disabled': props.disabled,
      'active': props.active,
    }">
      <BaseIcon :name="props.icon" :size="props.size" :color="props.color" />
    </button>
  </ItemTip>
</template>

<style scoped></style>
