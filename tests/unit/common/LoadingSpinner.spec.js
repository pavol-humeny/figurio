import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useUiStore } from '@/stores/uiStore'

describe('LoadingSpinner.vue', () => {
  let uiStore

  beforeEach(() => {
    setActivePinia(createPinia())
    uiStore = useUiStore()
    document.body.innerHTML = ''
  })

  it('does not render spinner or blocker when not loading', () => {
    uiStore.isLoading = false
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.loading-overlay').exists()).toBe(false)
    expect(document.body.querySelector('.click-blocker')).toBeNull()
  })

  it('renders spinner and blocker when loading', async () => {
    uiStore.isLoading = true
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.loading-overlay').exists()).toBe(true)

    const blocker = document.body.querySelector('.click-blocker')
    expect(blocker).toBeTruthy()
    expect(blocker.classList.contains('click-blocker')).toBe(true)
  })

  it('updates visibility when loading state changes', async () => {
    const wrapper = mount(LoadingSpinner)
    const overlay = () => wrapper.find('.loading-overlay')
    const blocker = () => document.body.querySelector('.click-blocker')

    uiStore.isLoading = false
    await wrapper.vm.$nextTick()
    expect(overlay().exists()).toBe(false)
    expect(blocker()).toBeNull()

    uiStore.isLoading = true
    await wrapper.vm.$nextTick()
    expect(overlay().exists()).toBe(true)
    expect(blocker()).toBeTruthy()
  })
})
