/**
 * @file: CollapsiblePanel.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CollapsiblePanel from '@/components/common/CollapsiblePanel.vue'
import { useCollapsiblePanel } from '@/composables/common/useCollapsiblePanel'

let mockUiStore
let panel

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

    panel = useCollapsiblePanel(mockUiStore)
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

  it('toggles visibility: open → close', async () => {
    mockUiStore.rightPanelOpen = true
    mockUiStore.rightPanelWidth = 250
    const wrapper = mount(CollapsiblePanel)

    await wrapper.find('.toggle-button').trigger('click')

    expect(mockUiStore.toggleRightPanel).toHaveBeenCalledTimes(1)
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(0)
  })

  it('toggles visibility: closed → open', async () => {
    mockUiStore.rightPanelOpen = false
    mockUiStore.rightPanelWidth = 0
    mockUiStore.rightPanelDefaultWidth = 220
    const wrapper = mount(CollapsiblePanel)

    await wrapper.find('.toggle-button').trigger('click')

    expect(mockUiStore.toggleRightPanel).toHaveBeenCalledTimes(1)
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(220)
  })

  it('showPanel opens panel when hidden', () => {
    mockUiStore.rightPanelOpen = false
    panel.showPanel()
    expect(mockUiStore.toggleRightPanel).toHaveBeenCalled()
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(200)
  })

  it('showPanel does nothing when visible', () => {
    mockUiStore.rightPanelOpen = true
    panel.showPanel()
    expect(mockUiStore.toggleRightPanel).not.toHaveBeenCalled()
  })

  it('hidePanel closes when visible', () => {
    mockUiStore.rightPanelOpen = true
    panel.hidePanel()
    expect(mockUiStore.toggleRightPanel).toHaveBeenCalled()
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(0)
  })

  it('hidePanel does nothing when hidden', () => {
    mockUiStore.rightPanelOpen = false
    panel.hidePanel()
    expect(mockUiStore.toggleRightPanel).not.toHaveBeenCalled()
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

  it('stopResize stops resizing and removes event listeners', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    panel.isVisible.value = true
    panel.startResize({ clientX: 100 }) // Add event listeners
    expect(removeEventListenerSpy).not.toHaveBeenCalled()

    panel.stopResize()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))

    expect(panel.isResizing.value).toBe(false)
  })

  it('handleResize does nothing if not resizing', () => {
    panel.isResizing.value = false
    panel.startX.value = 100
    panel.startWidth.value = 300

    const event = { clientX: 150 }
    panel.handleResize(event)

    expect(mockUiStore.setRightPanelWidth).not.toHaveBeenCalled()
  })
})
