import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useClickOutside } from '@/composables/common/useClickOutside' // uprav cestu podľa projektu

describe('useClickOutside', () => {
  let callback
  let wrapper

  const TestComponent = defineComponent({
    setup() {
      const cond = ref(true)
      const cb = vi.fn()

      const { wrapperRef } = useClickOutside({
        condition: () => cond.value,
        onOutsideClick: cb,
      })

      return { wrapperRef, cond, cb }
    },
    render() {
      return h('div', { ref: 'wrapperRef', id: 'wrapper' }, [
        h('button', { id: 'inside' }, 'Inside'),
      ])
    },
  })

  beforeEach(() => {
    wrapper = mount(TestComponent)
    callback = wrapper.vm.cb
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  it('adds and removes event listener', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const tempWrapper = mount(TestComponent)
    expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    tempWrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('calls onOutsideClick when clicking outside and condition true', async () => {
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 160))
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does not call onOutsideClick when clicking inside the element', async () => {
    const insideButton = wrapper.find('#inside')
    await insideButton.trigger('mousedown')

    await new Promise((resolve) => setTimeout(resolve, 160))

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call onOutsideClick when condition is false', async () => {
    wrapper.vm.cond = false

    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 160))

    expect(callback).not.toHaveBeenCalled()
  })
})
