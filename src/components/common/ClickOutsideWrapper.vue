<template>
  <div ref="wrapperRef">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  active: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click-outside'])

const wrapperRef = ref(null)

const activated = ref(false)

onMounted(() => {
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event) {
  if (!props.active || !activated.value) return
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    console.log('Click outside detected')
    //  add delay 1000ms
    setTimeout(() => {
      activated.value = true
    }, 10)

    emit('click-outside', event)
  }
}
</script>
