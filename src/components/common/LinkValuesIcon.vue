<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { defineProps } from 'vue';
import { useLinkValuesIcon } from '@/composables/common/useLinkValuesIcon';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  tipLinked: {
    type: String,
    default: ''
  },
  tipUnlinked: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'bottom'
  },
  size: {
    type: [Number, String],
    default: 30
  },
  color: {
    type: String,
    default: 'var(--primary-c)'
  }
});

const emit = defineEmits(['update:modelValue'])

const {
  isLinked,
  toggleLinkedValue,
  showTip
} = useLinkValuesIcon(props, emit)

</script>

<template>
  <BaseIcon
    :name="isLinked ? 'IconLinkValues' : 'IconUnLinkValues'"
    :size="size"
    :color="color"
    @click="toggleLinkedValue"
    :tip="showTip ? isLinked ? tipLinked : tipUnlinked : ''"
  />
</template>

<style scoped>
</style>
