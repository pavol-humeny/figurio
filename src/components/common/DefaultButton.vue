<script setup>
import ItemTip from './ItemTip.vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    required: true,
  },
  tip: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'bottom',
  },
  onlyText: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <button
      class="button"
      @click="emit('click')"
      :class="{
        'button-text': props.onlyText,
        'button-default': !props.onlyText,
        'disabled': props.disabled,
      }"
    >
      {{ props.text }}
    </button>
  </ItemTip>
</template>

<style scoped></style>
