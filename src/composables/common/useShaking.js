import { ref } from 'vue'

export function useShaking() {
  const isShaking = ref(false)

  const triggerShake = () => {
    if (isShaking.value) return
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 500)
  }

  return{
    isShaking,
    triggerShake,
  }
}
