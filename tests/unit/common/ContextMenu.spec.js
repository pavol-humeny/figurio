/**
 * @file: ContextMenu.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ContextMenu from '@/components/common/ContextMenu.vue'
import { useContextMenu } from '@/composables/common/useContextMenu'

// Mocks
vi.mock('@/config/editorConfig', () => ({
  editorConfig: {
    contextMenuDelay: 200,
  },
}))

vi.mock('@/composables/common/useConsole.js', () => ({
  useConsole: () => ({
    log: vi.fn(),
  }),
}))

const makeEvent = (x = 100, y = 100) => ({
  clientX: x,
  clientY: y,
  preventDefault: vi.fn(),
})

const itemsFactory = (overrides = {}) => [
  { label: 'Rename', action: vi.fn(), ...overrides },
  { label: 'Delete', action: vi.fn(), ...overrides },
]

const getMenu = () => document.body.querySelector('.context-menu-wrapper')

describe('ContextMenu.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'

    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
    })
    Object.defineProperty(window, 'innerHeight', {
      value: 768,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('renders slot content', () => {
    const wrapper = mount(ContextMenu, {
      props: { items: itemsFactory() },
      slots: { default: '<button id="target">Right click me</button>' },
      attachTo: document.body,
    })

    expect(wrapper.find('#target').exists()).toBe(true)
  })

  it('opens on contextmenu and positions correctly (with offset)', async () => {
    const wrapper = mount(ContextMenu, {
      props: { items: itemsFactory() },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent(250, 300))
    await flushPromises()

    const menu = getMenu()
    expect(menu).toBeTruthy()

    expect(menu.style.left).toBe('245px')
    expect(menu.style.top).toBe('295px')
  })

  it('keeps open on hover and closes after delay', async () => {
    const wrapper = mount(ContextMenu, {
      props: { items: itemsFactory() },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent())
    await flushPromises()

    const menu = getMenu()
    expect(menu).toBeTruthy()

    menu.dispatchEvent(new Event('mouseenter'))
    menu.dispatchEvent(new Event('mouseleave'))

    expect(getMenu()).toBeTruthy()

    vi.advanceTimersByTime(200)
    await flushPromises()

    expect(getMenu()).toBeFalsy()
  })

  it('corrects overflow (right & bottom)', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 320 })
    Object.defineProperty(window, 'innerHeight', { value: 240 })

    const rect = {
      right: 500,
      bottom: 350,
      width: 200,
      height: 150,
      top: 200,
      left: 300,
      x: 300,
      y: 200,
      toJSON: () => {},
    }

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect)

    const wrapper = mount(ContextMenu, {
      props: { items: itemsFactory() },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent(290, 210))
    await flushPromises()

    const menu = getMenu()

    const baseX = 285
    const baseY = 205

    const expectedLeft = baseX - (500 - 320 + 8)
    const expectedTop = baseY - (350 - 240 + 8)

    expect(menu.style.left).toBe(`${expectedLeft}px`)
    expect(menu.style.top).toBe(`${expectedTop}px`)
  })

  it('filters hidden items and hides menu if none visible', async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        items: [
          { label: 'A', action: vi.fn(), hide: true },
          { label: 'B', action: vi.fn(), hide: false },
        ],
      },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent())
    await flushPromises()

    const items = [...document.querySelectorAll('.context-menu-wrapper-item')].map((el) =>
      el.textContent.trim(),
    )

    expect(items).toEqual(['B'])

    await wrapper.setProps({
      items: [{ label: 'X', action: vi.fn(), hide: true }],
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent())
    await flushPromises()

    expect(getMenu()).toBeFalsy()
  })

  it('calls action and closes menu on click', async () => {
    const action = vi.fn()

    const wrapper = mount(ContextMenu, {
      props: { items: [{ label: 'Run', action }] },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent())
    await flushPromises()

    const item = document.querySelector('.context-menu-wrapper-item')
    item.click()

    await flushPromises()

    expect(action).toHaveBeenCalledTimes(1)
    expect(getMenu()).toBeFalsy()
  })

  it('applies disabled class (action still fires)', async () => {
    const action = vi.fn()

    const wrapper = mount(ContextMenu, {
      props: {
        items: [{ label: 'Disabled', action, disabled: true }],
      },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent())
    await flushPromises()

    const el = document.querySelector('.context-menu-wrapper-item')

    expect(el.classList.contains('disabled')).toBe(true)

    el.click()
    await flushPromises()

    expect(action).toHaveBeenCalledTimes(1)
  })
})

describe('useContextMenu composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('showMenu sets coords (with offset) and visibility', async () => {
    const { isVisible, menuCoords, contextMenuStyle, showMenu } = useContextMenu()

    const evt = makeEvent(420, 380)
    showMenu(evt)

    await flushPromises()

    expect(evt.preventDefault).toHaveBeenCalled()
    expect(isVisible.value).toBe(true)

    expect(menuCoords.value).toEqual({ x: 415, y: 375 })
    expect(contextMenuStyle.value.left).toBe('415px')
    expect(contextMenuStyle.value.top).toBe('375px')
  })

  it('closeMenu hides menu', () => {
    const { isVisible, showMenu, closeMenu } = useContextMenu()

    showMenu(makeEvent())
    expect(isVisible.value).toBe(true)

    closeMenu()
    expect(isVisible.value).toBe(false)
  })

  it('hover prevents closing, leave triggers delayed close', async () => {
    const { isVisible, showMenu, handleMenuEnter, handleMenuLeave } = useContextMenu()

    showMenu(makeEvent())
    await flushPromises()

    handleMenuEnter()
    handleMenuLeave()

    expect(isVisible.value).toBe(true)

    vi.advanceTimersByTime(199)
    expect(isVisible.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(isVisible.value).toBe(false)
  })
})
