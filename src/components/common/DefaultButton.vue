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
  // onClick: {
  //   type: Function,
  //   required: true
  // },
  onlyText: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const showTip = props.tip !== ''
</script>

<template>
  <ItemTip v-if="showTip" :text="props.tip" :position="props.position">
    <button
      class="button"
      @click="emit('click')"
      :class="{
        'button-text': props.onlyText,
        'button-default': !props.onlyText,
        'button--disabled': props.disabled,
      }"
    >
      {{ props.text }}
    </button>
  </ItemTip>

  <button
    v-else
    class="button"
    @click="emit('click')"
    :class="{
      'button-text': props.onlyText,
      'button-default': !props.onlyText,
      'button--disabled': props.disabled,
    }"
  >
    {{ props.text }}
  </button>
</template>

<style scoped></style>
