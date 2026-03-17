/**
 * @file: CollapsiblePanel.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { reactive } from 'vue'

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

    mockUiStore = reactive({
      rightPanelOpen: true,
      rightPanelWidth: 200,
      rightPanelMinWidth: 100,
      rightPanelMaxWidth: 400,
      rightPanelDefaultWidth: 200,
      collapseButtonWidth: 20,

      toggleRightPanel: vi.fn(),
      setRightPanelWidth: vi.fn((w) => {
        mockUiStore.rightPanelWidth = w
      }),
      resetRightPanelWidth: vi.fn(() => {
        mockUiStore.rightPanelWidth = mockUiStore.rightPanelDefaultWidth
      }),
      resetSvgObjectsListHeight: vi.fn(),
    })

    panel = useCollapsiblePanel(mockUiStore)
  })

  it('computes rightSidePanelWidth correctly', () => {
    expect(panel.rightSidePanelWidth.value).toBe(220)
  })

  it('renders slot content when visible', () => {
    const wrapper = mount(CollapsiblePanel, {
      slots: {
        default: '<div class="slot-content">Test</div>',
      },
    })

    expect(wrapper.find('.slot-content').exists()).toBe(true)
    expect(wrapper.find('.panel-content').classes()).not.toContain('hidden')
  })

  it('hides content when panel is closed', () => {
    mockUiStore.rightPanelOpen = false

    const wrapper = mount(CollapsiblePanel)
    expect(wrapper.find('.panel-content').classes()).toContain('hidden')
  })

  it('toggleVisibility: open → close stores tmpWidth and sets width 0', async () => {
    mockUiStore.rightPanelOpen = true
    mockUiStore.rightPanelWidth = 250

    panel.toggleVisibility()

    expect(mockUiStore.toggleRightPanel).toHaveBeenCalled()
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(0)
  })

  it('toggleVisibility: closed → open restores tmpWidth', () => {
    mockUiStore.rightPanelOpen = true
    mockUiStore.rightPanelWidth = 300

    panel.toggleVisibility() // close → uloží tmpWidth = 300

    mockUiStore.rightPanelOpen = false

    panel.toggleVisibility() // open

    expect(mockUiStore.setRightPanelWidth).toHaveBeenLastCalledWith(300)
  })

  it('toggleVisibility uses default width if tmpWidth is empty', () => {
    mockUiStore.rightPanelOpen = false
    panel.toggleVisibility()

    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(200)
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

  it('hidePanel closes panel and stores width', () => {
    mockUiStore.rightPanelOpen = true
    mockUiStore.rightPanelWidth = 280

    panel.hidePanel()

    expect(mockUiStore.toggleRightPanel).toHaveBeenCalled()
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(0)
  })

  it('hidePanel does nothing when already hidden', () => {
    mockUiStore.rightPanelOpen = false

    panel.hidePanel()

    expect(mockUiStore.toggleRightPanel).not.toHaveBeenCalled()
  })

  it('startResize initializes resizing state and listeners', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')

    panel.startResize({ clientX: 100 })

    expect(panel.isResizing.value).toBe(true)
    expect(panel.startX.value).toBe(100)
    expect(panel.startWidth.value).toBe(200)

    expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })

  it('handleResize updates width correctly', () => {
    panel.startResize({ clientX: 100 })

    panel.handleResize({ clientX: 150 })

    // newWidth = 200 - (150 - 100) = 150
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(150)
  })

  it('handleResize clamps to min/max', () => {
    panel.startResize({ clientX: 100 })

    // too small
    panel.handleResize({ clientX: 500 })
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(100)

    // too large
    panel.handleResize({ clientX: -500 })
    expect(mockUiStore.setRightPanelWidth).toHaveBeenCalledWith(400)
  })

  it('handleResize does nothing if not resizing', () => {
    panel.isResizing.value = false

    panel.handleResize({ clientX: 150 })

    expect(mockUiStore.setRightPanelWidth).not.toHaveBeenCalled()
  })

  it('stopResize removes listeners and resets flag', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    panel.startResize({ clientX: 100 })
    panel.stopResize()

    expect(panel.isResizing.value).toBe(false)

    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })

  it('resetPanelWidth resets width and svg list height', () => {
    panel.resetPanelWidth()

    expect(mockUiStore.resetRightPanelWidth).toHaveBeenCalled()
    expect(mockUiStore.resetSvgObjectsListHeight).toHaveBeenCalled()
  })

  it('component toggle button works', async () => {
    const wrapper = mount(CollapsiblePanel)

    await wrapper.find('.toggle-button').trigger('click')

    expect(mockUiStore.toggleRightPanel).toHaveBeenCalled()
  })

  it('resize handle triggers resize start', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener')

    const wrapper = mount(CollapsiblePanel)

    await wrapper.find('.resize-handle').trigger('mousedown', { clientX: 100 })

    expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })

  it('double click on resize handle resets width', async () => {
    const wrapper = mount(CollapsiblePanel)

    await wrapper.find('.resize-handle').trigger('dblclick')

    expect(mockUiStore.resetRightPanelWidth).toHaveBeenCalled()
  })
})
