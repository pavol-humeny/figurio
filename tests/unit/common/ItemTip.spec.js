/**
 * @file: ItemTip.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ItemTip from '@/components/common/ItemTip.vue'
import { useItemTip } from '@/composables/common/useItemTip'

vi.mock('@/stores/uiStore', () => ({
  useUiStore: () => ({
    isItemTipVisible: true,
    isDropdownOpen: false,
  }),
}))

vi.mock('@/stores/editorStore', () => ({
  useEditorStore: () => ({
    setToolWithOpenSubTools: vi.fn(),
  }),
}))

vi.mock('@/composables/modals/useVideoLoader', () => ({
  useVideoLoader: () => ({
    getVideo: () => 'video.mp4',
  }),
}))

vi.mock('@/composables/modals/useFeatureTourModal.js', () => ({
  useFeatureTourModal: () => ({
    openSingleFeatureTourModal: vi.fn(),
  }),
}))

const mockRect = {
  top: 100,
  left: 200,
  bottom: 150,
  right: 300,
  width: 100,
  height: 50,
}

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = ''

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    measureText: () => ({ width: 100 }),
    font: '',
  }))

  document.elementFromPoint = vi.fn(() => document.body)
})

afterEach(() => {
  vi.useRealTimers()
})

const mountTip = (props = {}, options = {}) =>
  mount(ItemTip, {
    props,
    attachTo: document.body,
    ...options,
    global: {
      stubs: {
        teleport: true,
        transition: false,
      },
      ...(options.global || {}),
    },
  })

describe('ItemTip.vue', () => {
  it('renders slot content', () => {
    const wrapper = mountTip(
      { text: 'Tooltip' },
      {
        slots: { default: '<button id="btn">Btn</button>' },
      },
    )

    expect(wrapper.find('#btn').exists()).toBe(true)
  })

  it('does not show tooltip when text empty', async () => {
    const wrapper = mountTip({ text: '' })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    expect(document.body.querySelector('.item-tip-bubble')).toBeFalsy()
  })

  it('shows tooltip', async () => {
    const wrapper = mountTip({ text: 'Hello' })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    expect(document.body.innerHTML).toContain('Hello')
  })

  it('hides tooltip after leave', async () => {
    const wrapper = mountTip({ text: 'Hello' })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    await wrapper.trigger('mouseleave')
    vi.runAllTimers()
    await flushPromises()

    expect(wrapper.vm.isVisible).toBe(false)
  })

  it('renders advanced tooltip', async () => {
    const wrapper = mountTip({
      text: 'Desc',
      advance: true,
      title: 'Title',
      shortcut: 'Ctrl+S',
    })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    const html = document.body.innerHTML
    expect(html).toContain('Title')
    expect(html).toContain('Ctrl+S')
    expect(html).toContain('Desc')
  })

  it('renders advanceTool with video', async () => {
    const wrapper = mountTip({
      text: 'Desc',
      advanceTool: true,
      title: 'Title',
      toolKey: 'crop',
    })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    expect(document.body.querySelector('video')).toBeTruthy()
  })

  it('applies position classes', async () => {
    const wrapper = mountTip({
      text: 'Test',
      position: 'bottom-left',
    })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    const bubble = document.body.querySelector('.item-tip-bubble')
    const arrow = document.body.querySelector('.item-tip-arrow')

    expect(bubble).toBeTruthy()
    expect(arrow).toBeTruthy()

    expect(bubble.classList.contains('bottom-left')).toBe(true)
    expect(arrow.classList.contains('bottom-left')).toBe(true)
  })
})

describe('useItemTip', () => {
  let uiStore
  let editorStore

  beforeEach(() => {
    uiStore = {
      isItemTipVisible: true,
      isDropdownOpen: false,
    }

    editorStore = {
      setToolWithOpenSubTools: vi.fn(),
    }
  })

  it('shows after delay', () => {
    const tip = useItemTip({ delay: 50 }, uiStore, editorStore)
    tip.wrapperRef.value = { getBoundingClientRect: () => mockRect }

    tip.handleMouseEnter()
    vi.advanceTimersByTime(50)

    expect(tip.isVisible.value).toBe(true)
  })

  it('hides after leave delay', () => {
    const tip = useItemTip({ delay: 0 }, uiStore, editorStore)

    const el = document.createElement('div')
    const tipEl = document.createElement('div')

    tip.wrapperRef.value = el
    tip.tipRef.value = tipEl

    document.body.appendChild(el)
    document.body.appendChild(tipEl)

    tip.isVisible.value = true

    document.elementFromPoint = vi.fn(() => document.createElement('div'))

    tip.handleMouseLeave()
    vi.runAllTimers()

    expect(tip.isVisible.value).toBe(false)
  })

  it('computes correct positions', () => {
    const tip = useItemTip({ position: 'bottom', offset: 8 }, uiStore, editorStore)
    tip.wrapperRef.value = { getBoundingClientRect: () => mockRect }

    tip.updatePosition()

    expect(tip.itemTipStyle.value.top).toBe('158px')
    expect(tip.itemTipStyle.value.left).toBe('250px')
  })

  it('hides on outside click', () => {
    const tip = useItemTip({}, uiStore, editorStore)

    const el = document.createElement('div')
    const tipEl = document.createElement('div')

    tip.wrapperRef.value = el
    tip.tipRef.value = tipEl

    tip.isVisible.value = true

    document.elementFromPoint = vi.fn(() => document.createElement('div'))

    tip.handleMouseClick()

    expect(tip.isVisible.value).toBe(false)
  })

  it('openToolVideo hides tooltip', () => {
    const tip = useItemTip({}, uiStore, editorStore)

    tip.isVisible.value = true
    tip.openToolVideo('crop')

    expect(tip.isVisible.value).toBe(false)
  })
})
