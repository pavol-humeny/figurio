import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CollapsiblePanel from '@/components/common/CollapsiblePanel.vue'

let mockUiStore

vi.mock('@/stores/uiStore', () => ({
  useUiStore: () => mockUiStore,
}))

describe('CollapsiblePanel.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    mockUiStore = {
      rightPanelOpen: true,
      rightPanelWidth: 200,
      rightPanelMinWidth: 100,
      rightPanelMaxWidth: 400,
      rightPanelDefaultWidth: 200,
      collapseButtonWidth: 20,
      toggleRightPanel: vi.fn(),
      setRightPanelWidth: vi.fn(),
    }
  })

  it('renders correctly and shows content by default', () => {
    const wrapper = mount(CollapsiblePanel, {
      slots: {
        default: '<div class="slot-content">Test content</div>',
      },
    })

    expect(wrapper.find('.slot-content').exists()).toBe(true)
    expect(wrapper.find('.panel-content').classes()).not.toContain('hidden')
  })

  it('calls toggleVisibility on click', async () => {
    const wrapper = mount(CollapsiblePanel)
    await wrapper.find('.toggle-button').trigger('click')
    expect(mockUiStore.toggleRightPanel).toHaveBeenCalled()
  })

  it('hides content when panel is closed', () => {
    mockUiStore.rightPanelOpen = false
    const wrapper = mount(CollapsiblePanel)
    expect(wrapper.find('.panel-content').classes()).toContain('hidden')
  })

  it('starts resizing on mousedown', async () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    const wrapper = mount(CollapsiblePanel)

    await wrapper.find('.resize-handle').trigger('mousedown', { clientX: 100 })

    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })

  it('resizes panel on mousemove', async () => {
    const wrapper = mount(CollapsiblePanel)
    mockUiStore.rightPanelWidth = 200
    await wrapper.find('.resize-handle').trigger('mousedown', { clientX: 100 })

    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 150 })
    document.dispatchEvent(mouseMoveEvent)

    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(150)
  })

  it('close collapsible panel by clicking on the toggle button', async () => {
    mockUiStore.rightPanelOpen = true
    const wrapper = mount(CollapsiblePanel)

    expect(wrapper.find('.toggle-button').exists()).toBe(true)
    await wrapper.find('.toggle-button').trigger('click')

    expect(mockUiStore.toggleRightPanel).toHaveBeenCalled()
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(0)
  })
})
