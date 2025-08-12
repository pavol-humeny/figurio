import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useUiStore } from '@/stores/uiStore'

describe('LoadingSpinner.vue', () => {
  let uiStore
  let wrapper

  const events = ['click', 'mousedown', 'keydown', 'pointerdown']

  beforeEach(() => {
    setActivePinia(createPinia())
    uiStore = useUiStore()
    document.body.innerHTML = ''
    wrapper = undefined
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount()
      wrapper = undefined
    }
  })

  it('does not render spinner or blocker when not loading', () => {
    uiStore.isLoading = false
    wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.loading-overlay').exists()).toBe(false)
    expect(document.body.querySelector('.click-blocker')).toBeNull()
  })

  it('renders spinner and blocker when loading', () => {
    uiStore.isLoading = true
    wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.loading-overlay').exists()).toBe(true)

    const blocker = document.body.querySelector('.click-blocker')
    expect(blocker).toBeTruthy()
    expect(blocker.classList.contains('click-blocker')).toBe(true)
  })

  it('updates visibility when loading state changes', async () => {
    // start not loading
    uiStore.isLoading = false
    wrapper = mount(LoadingSpinner)

    const overlay = () => wrapper.find('.loading-overlay')
    const blocker = () => document.body.querySelector('.click-blocker')

    expect(overlay().exists()).toBe(false)
    expect(blocker()).toBeNull()

    // toggle loading on
    uiStore.isLoading = true
    // wait a tick so component re-renders
    await wrapper.vm.$nextTick()

    expect(overlay().exists()).toBe(true)
    expect(blocker()).toBeTruthy()
  })

  // Helper that mounts and runs a blocking test for a single event
  const runBlockingTest = async ({ eventName, loading, blockClicks, expectBlocked }) => {
    uiStore.isLoading = loading
    uiStore.blockClicks = blockClicks

    wrapper = mount(LoadingSpinner)

    // Add a test listener AFTER mount. If the spinner's listener stops immediate
    // propagation, this listener (added later) will NOT be called.
    const testHandler = vi.fn()
    window.addEventListener(eventName, testHandler, true)

    try {
      // dispatch DOM event
      const event = new Event(eventName, { bubbles: true, cancelable: true })
      window.dispatchEvent(event)

      if (expectBlocked) {
        // if blocked, our handler should NOT have been called
        expect(testHandler).not.toHaveBeenCalled()
      } else {
        // if not blocked, our handler SHOULD have been called
        expect(testHandler).toHaveBeenCalled()
      }
    } finally {
      // cleanup the test listener
      window.removeEventListener(eventName, testHandler, true)
    }
  }

  // Tests: when loading=true & blockClicks=true -> events should be blocked
  events.forEach((ev) => {
    it(`blocks ${ev} when loading=true and blockClicks=true`, async () => {
      await runBlockingTest({ eventName: ev, loading: true, blockClicks: true, expectBlocked: true })
    })
  })

  // Tests: when loading=false (but blockClicks true) -> events should NOT be blocked
  events.forEach((ev) => {
    it(`does NOT block ${ev} when loading=false (even if blockClicks=true)`, async () => {
      await runBlockingTest({ eventName: ev, loading: false, blockClicks: true, expectBlocked: false })
    })
  })

  // Tests: when blockClicks=false (even if loading true) -> events should NOT be blocked
  events.forEach((ev) => {
    it(`does NOT block ${ev} when blockClicks=false (even if loading=true)`, async () => {
      await runBlockingTest({ eventName: ev, loading: true, blockClicks: false, expectBlocked: false })
    })
  })

  it('removes global listeners when component is unmounted (no blocking after unmount)', async () => {
    uiStore.isLoading = true
    uiStore.blockClicks = true
    wrapper = mount(LoadingSpinner)

    // unmount => listeners should be removed
    wrapper.unmount()

    const testHandler = vi.fn()
    window.addEventListener('click', testHandler, true)

    try {
      window.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))
      // now that the spinner is unmounted, our handler should be invoked
      expect(testHandler).toHaveBeenCalled()
    } finally {
      window.removeEventListener('click', testHandler, true)
    }
  })
})
