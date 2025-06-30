import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

export function useItemTip(options = {}) {
  const { position = 'top', delay = 700, offset = 8, text = '' } = options

  const showTip = computed(() => text && text.length > 0)
  const isVisible = ref(false)
  const wrapper = ref(null)
  const hoverTimeout = ref(null)
  const coords = ref({ top: 0, left: 0 })

  const itemTipStyle = computed(() => ({
    position: 'absolute',
    top: `${coords.value.top}px`,
    left: `${coords.value.left}px`,
    zIndex: 'var(--z-index-tip)',
  }))

  function updatePosition() {
    if (!wrapper.value) return

    const rect = wrapper.value.getBoundingClientRect()

    switch (position) {
      case 'top':
        coords.value = {
          top: rect.top - offset,
          left: rect.left + rect.width / 2,
        }
        break
      case 'bottom':
        coords.value = {
          top: rect.bottom + offset,
          left: rect.left + rect.width / 2,
        }
        break
      case 'bottom-right':
        coords.value = {
          top: rect.bottom + offset,
          left: rect.left,
        }
        break
      case 'bottom-left':
        coords.value = {
          top: rect.bottom + offset,
          left: rect.right,
        }
        break
      case 'left':
        coords.value = {
          top: rect.top + rect.height / 2,
          left: rect.left - offset,
        }
        break
      case 'right':
      default:
        coords.value = {
          top: rect.top + rect.height / 2,
          left: rect.right + offset,
        }
        break
    }
  }

  function handleMouseEnter() {
    hoverTimeout.value = setTimeout(() => {
      isVisible.value = true
    }, delay)
  }

  function handleMouseLeave() {
    clearTimeout(hoverTimeout.value)
    isVisible.value = false
  }

  onMounted(() => nextTick(updatePosition))

  onBeforeUnmount(() => clearTimeout(hoverTimeout.value))

  watch(isVisible, (visible) => {
    if (visible) nextTick(updatePosition)
  })

  return {
    showTip,
    isVisible,
    wrapper,
    itemTipStyle,
    handleMouseEnter,
    handleMouseLeave,
    updatePosition,
  }
}
