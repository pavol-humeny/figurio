/**
 * @file: LoadingSpinner.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useUiStore } from '@/stores/uiStore'

vi.mock('@/composables/common/useConsole.js', () => ({
  useConsole: () => ({
    log: vi.fn(),
  }),
}))

const mountSpinner = () =>
  mount(LoadingSpinner, {
    attachTo: document.body,
    global: {
      stubs: {
        teleport: true,
      },
    },
  })

describe('LoadingSpinner.vue', () => {
  let uiStore
  let wrapper

  beforeEach(() => {
    vi.useFakeTimers()

    setActivePinia(createPinia())
    uiStore = useUiStore()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()

    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  it('does not render anything when idle', () => {
    uiStore.isLoading = false
    uiStore.isApplying = false

    wrapper = mountSpinner()

    expect(wrapper.find('.overlay').exists()).toBe(false)
    expect(document.body.querySelector('.click-blocker')).toBeNull()
  })

  it('renders loading overlay when isLoading true', () => {
    uiStore.isLoading = true
    uiStore.blockClicks = true

    wrapper = mountSpinner()

    expect(wrapper.find('.overlay').exists()).toBe(true)
    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
    expect(document.body.querySelector('.click-blocker')).toBeTruthy()
  })

  it('reacts to loading state change', async () => {
    uiStore.isLoading = false

    wrapper = mountSpinner()

    expect(wrapper.find('.overlay').exists()).toBe(false)

    uiStore.isLoading = true
    await nextTick()

    expect(wrapper.find('.overlay').exists()).toBe(true)
  })

  it('shows applying spinner after delay', async () => {
    wrapper = mountSpinner()

    uiStore.isApplying = true 
    await nextTick()

    expect(wrapper.find('.overlay').exists()).toBe(false)

    vi.runAllTimers()
    await nextTick()

    expect(wrapper.find('.overlay').exists()).toBe(true)
  })

  it('hides applying spinner when applying stops', async () => {
    wrapper = mountSpinner()

    uiStore.isApplying = true
    await nextTick()

    vi.runAllTimers()
    await nextTick()

    expect(wrapper.find('.overlay').exists()).toBe(true)

    uiStore.isApplying = false
    await nextTick()

    expect(wrapper.find('.overlay').exists()).toBe(false)
  })

  it('renders click blocker when blockClicks true', () => {
    uiStore.isLoading = true
    uiStore.blockClicks = true

    wrapper = mountSpinner()

    const blocker = document.body.querySelector('.click-blocker')
    expect(blocker).toBeTruthy()
  })

  it('does not render click blocker when blockClicks false', () => {
    uiStore.isLoading = true
    uiStore.blockClicks = false

    wrapper = mountSpinner()

    const blocker = document.body.querySelector('.click-blocker')
    expect(blocker).toBeNull()
  })

  it('removes blocker after unmount', () => {
    uiStore.isLoading = true
    uiStore.blockClicks = true

    wrapper = mountSpinner()
    expect(document.body.querySelector('.click-blocker')).toBeTruthy()

    wrapper.unmount()

    expect(document.body.querySelector('.click-blocker')).toBeNull()
  })
})
