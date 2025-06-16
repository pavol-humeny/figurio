<script setup>
import { computed, defineAsyncComponent } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (val) => val.startsWith('Icon'),
  },
  size: {
    type: Number,
    default: 20,
  },
  color: {
    type: String,
    default: 'currentColor',
  },
})

const iconComponent = computed(() =>
  defineAsyncComponent(() => import(`@/components/icons/${props.name}.vue`))
)

</script>

<template>
  <component
    :is="iconComponent"
    class="icon"
    :style="{ width: size + 'px', height: size + 'px', color: color }"
  />

</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
