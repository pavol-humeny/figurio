import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ItemTip from '@/components/common/ItemTip.vue'
import { useItemTip } from '@/composables/common/useItemTip'

// === Mocks ===
const mockRect = {
  top: 100,
  left: 200,
  bottom: 150,
  right: 300,
  width: 100,
  height: 50,
}

// === Component tests ===
describe('ItemTip.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders slot content correctly', () => {
    const wrapper = mount(ItemTip, {
      props: { text: 'Tooltip text' },
      slots: { default: '<button>Hover me</button>' },
    })
    expect(wrapper.find('button').text()).toBe('Hover me')
  })

  it('does not render tooltip if text is empty', async () => {
    const wrapper = mount(ItemTip, { props: { text: '' } })
    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()
    expect(document.body.innerHTML).not.toContain('item-tip-bubble')
  })

  it('shows tooltip on hover and hides on leave', async () => {
    const wrapper = mount(ItemTip, { props: { text: 'Hover tooltip' } })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    expect(document.body.innerHTML).toContain('Hover tooltip')

    await wrapper.trigger('mouseleave')
    expect(wrapper.vm.isVisible).toBe(false)
  })

  it('renders advanced tooltip with title and shortcut', async () => {
    const wrapper = mount(ItemTip, {
      props: {
        text: 'Advanced description',
        advance: true,
        title: 'Tooltip Title',
        shortcut: 'Ctrl+T',
      },
    })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    expect(document.body.innerHTML).toContain('Tooltip Title')
    expect(document.body.innerHTML).toContain('Ctrl+T')
    expect(document.body.innerHTML).toContain('Advanced description')
  })

  it('does not render shortcut if empty', async () => {
    const wrapper = mount(ItemTip, {
      props: {
        text: 'Some text',
        advance: true,
        title: 'My title',
        shortcut: '',
      },
    })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    expect(document.body.innerHTML).not.toContain('tip-shortcut')
  })

  it('applies correct position class', async () => {
    const wrapper = mount(ItemTip, {
      props: {
        text: 'Positioned tooltip',
        position: 'bottom-left',
      },
    })

    await wrapper.trigger('mouseenter')
    vi.runAllTimers()
    await flushPromises()

    expect(document.body.querySelector('.item-tip-bubble')?.classList).toContain('bottom-left')
    expect(document.body.querySelector('.item-tip-arrow')?.classList).toContain('bottom-left')
  })
})

// === Composable logic tests ===
describe('useItemTip composable', () => {
  it('shows and hides tooltip via composable', async () => {
    const tip = useItemTip({ delay: 50 })
    tip.wrapperRef.value = { getBoundingClientRect: () => mockRect }

    vi.useFakeTimers()
    tip.handleMouseEnter()
    vi.advanceTimersByTime(50)

    expect(tip.isVisible.value).toBe(true)

    tip.handleMouseLeave()
    expect(tip.isVisible.value).toBe(false)
    vi.useRealTimers()
  })

  it('computes correct coordinates for all positions', () => {
    const positions = {
      'top-right': { top: 92, left: 200 },
      'top-left': { top: 92, left: 300 },
      bottom: { top: 158, left: 250 },
      'bottom-right': { top: 158, left: 200 },
      'bottom-left': { top: 158, left: 300 },
      left: { top: 125, left: 192 },
      right: { top: 125, left: 308 },
    }

    for (const [pos, expected] of Object.entries(positions)) {
      const tip = useItemTip({ position: pos, offset: 8 })
      tip.wrapperRef.value = { getBoundingClientRect: () => mockRect }

      tip.updatePosition()

      expect(tip.itemTipStyle.value.top).toBe(`${expected.top}px`)
      expect(tip.itemTipStyle.value.left).toBe(`${expected.left}px`)
    }
  })
})
