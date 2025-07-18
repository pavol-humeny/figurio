import { ref } from 'vue'

const isShaking = ref(false)

export function useShaking() {
  const triggerShake = () => {
    if (isShaking.value) return
    console.log('Triggering shake effect')
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 500)
  }

  return {
    isShaking,
    triggerShake,
  }
}
