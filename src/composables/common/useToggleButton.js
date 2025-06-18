import { ref, computed, watch  } from 'vue'

export function useToggleButton(props, emit){
  const isActive = ref(props.modelValue)

  const toggleSwitch = () => {
    if (props.disabled) return
    isActive.value = !isActive.value
    emit('update:modelValue', isActive.value)
  }

  watch(() => props.modelValue, (value) => {
    isActive.value = value
  })

  const showTip = computed(() => props.tip !== '')

  return {
    isActive,
    toggleSwitch,
    showTip
  }
}
