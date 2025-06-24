<script setup>
import { defineAsyncComponent, computed } from 'vue'
import ItemTip from '@/components/common/ItemTip.vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 20,
  },
  color: {
    type: String,
    default: 'currentColor',
  },
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
  }
})

const showTip = props.tip !== '';

// Get all icons
const icons = import.meta.glob('@/components/icons/Icon*.vue')

// Select the icon component based on the name
const iconComponent = computed(() => {
  const path = `/src/components/icons/${props.name}.vue`
  const loader = icons[path]

  if (!loader) {
    console.warn(`Icon ${props.name} does not exist: ${path}`)
    return null
  }

  return defineAsyncComponent(loader)
})

</script>

<template>
  <ItemTip
    v-if="showTip"
    :text="props.tip"
    :position="props.position"
  >
    <component
    :is="iconComponent"
    class="icon"
    :style="{ width: size + 'px', height: size + 'px', color: color }"
    :class="disabled ? 'disabled' : ''"
    />
  </ItemTip>

  <component
    v-else
    :is="iconComponent"
    class="icon"
    :style="{ width: size + 'px', height: size + 'px', color: color }"
    :class="disabled ? 'disabled' : ''"
    />

</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
.icon.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
