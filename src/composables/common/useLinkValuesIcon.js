import { ref, computed, watch  } from 'vue'

export function useLinkValuesIcon(props, emit){
  const isLinked = ref(props.modelValue)

  const toggleLinkedValue = () => {
    if (props.disabled) return
    isLinked.value = !isLinked.value
    emit('update:modelValue', isLinked.value)
  }

  watch(() => props.modelValue, (value) => {
    isLinked.value = value
  })

  const showTip = computed(() => props.tip !== '')

  return {
    isLinked,
    toggleLinkedValue,
    showTip
  }
}
