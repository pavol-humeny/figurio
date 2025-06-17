<script setup>
import ItemTip from './ItemTip.vue';
import { defineProps } from 'vue';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  text: {
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
  onClick: {
    type: Function,
    required: true
  },
  onlyText: {
    type: Boolean,
    default: false
  }
});

const showTip = props.tip !== '';

</script>

<template>
  <ItemTip
    v-if="showTip"
    :text="props.tip"
    :position="props.position"
  >
    <button
      class="button"
      @click="props.onClick"
      :class="{
        'button-text': props.onlyText,
        'button-default': !props.onlyText,
        'button--disabled': props.disabled
      }"
    >
      {{ props.text }}
    </button>
  </ItemTip>

  <button
    v-else
    class="button"
    @click="props.onClick"
    :class="{
      'button-text': props.onlyText,
      'button-default': !props.onlyText,
      'button--disabled': props.disabled
    }"
  >
    {{ props.text }}
  </button>
</template>

<style scoped>
</style>
