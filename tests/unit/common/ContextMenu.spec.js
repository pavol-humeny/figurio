/**
 * @file: ContextMenu.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
// tests/ContextMenu.spec.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ContextMenu from '@/components/common/ContextMenu.vue'
import { useContextMenu } from '@/composables/common/useContextMenu'

// === Mocks ===
vi.mock('@/config/editorConfig', () => ({
  editorConfig: {
    contextMenuDelay: 200,
  },
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

describe('ContextMenu.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders slot content', () => {
    const wrapper = mount(ContextMenu, {
      props: { items: itemsFactory() },
      slots: { default: '<button id="target">Right click me</button>' },
      attachTo: document.body,
    })
    expect(wrapper.find('#target').exists()).toBe(true)
  })

  it('opens on contextmenu and positions by mouse coords', async () => {
    const wrapper = mount(ContextMenu, {
      props: { items: itemsFactory() },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent(250, 300))
    await flushPromises()

    const menu = document.body.querySelector('.context-menu-wrapper')
    expect(menu).toBeTruthy()
    expect(menu.style.top).toBe('300px')
    expect(menu.style.left).toBe('250px')
  })

  it('closes on outside click', async () => {
    const originalAdd = document.addEventListener
    let outsideHandler = null
    const addSpy = vi.spyOn(document, 'addEventListener').mockImplementation((type, cb, opts) => {
      if (type === 'click') {
        outsideHandler = cb
        return
      }
      return originalAdd.call(document, type, cb, opts)
    })

    const wrapper = mount(ContextMenu, {
      props: {
        items: [
          { label: 'Rename', action: vi.fn() },
          { label: 'Delete', action: vi.fn() },
        ],
      },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', {
      clientX: 10,
      clientY: 10,
      preventDefault: vi.fn(),
    })
    await flushPromises()

    const menuBefore = document.body.querySelector('.context-menu-wrapper')
    expect(menuBefore).toBeTruthy()
    expect(typeof outsideHandler).toBe('function')

    const outside = document.createElement('div')
    document.body.appendChild(outside)

    await outsideHandler({ target: outside })

    await flushPromises()

    expect(document.body.querySelector('.context-menu-wrapper')).toBeFalsy()

    addSpy.mockRestore()
    wrapper.unmount()
  })

  it('keeps open while hovering and closes after delay on leave', async () => {
    const wrapper = mount(ContextMenu, {
      props: { items: itemsFactory() },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent(10, 10))
    await flushPromises()

    const menu = document.body.querySelector('.context-menu-wrapper')
    expect(menu).toBeTruthy()

    menu.dispatchEvent(new Event('mouseenter'))
    await flushPromises()
    menu.dispatchEvent(new Event('mouseleave'))
    await flushPromises()
    expect(document.body.querySelector('.context-menu-wrapper')).toBeTruthy()

    vi.advanceTimersByTime(200)
    await flushPromises()
    expect(document.body.querySelector('.context-menu-wrapper')).toBeFalsy()
  })

  it('applies overflow correction (right/bottom edges)', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 320 })
    Object.defineProperty(window, 'innerHeight', { value: 240 })

    const rect = {
      top: 200,
      left: 300,
      width: 200,
      height: 150,
      right: 500,
      bottom: 350,
      x: 300,
      y: 200,
      toJSON: () => {},
    }
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect)

    const wrapper = mount(ContextMenu, {
      props: { items: itemsFactory() },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent(290, 210))
    await flushPromises()

    const expectedLeft = 290 - (500 - 320 + 8) // 102
    const expectedTop = 210 - (350 - 240 + 8) // 92

    const menu = document.body.querySelector('.context-menu-wrapper')
    expect(menu.style.left).toBe(`${expectedLeft}px`)
    expect(menu.style.top).toBe(`${expectedTop}px`)

    rectSpy.mockRestore()
  })

  it('filters out hidden items and does not render when all are hidden', async () => {
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

    const items = [...document.body.querySelectorAll('.context-menu-wrapper-item')].map((el) =>
      el.textContent?.trim(),
    )
    expect(items).toEqual(['B'])

    await wrapper.setProps({ items: [{ label: 'X', action: vi.fn(), hide: true }] })
    await wrapper.find('#area').trigger('contextmenu', makeEvent())
    await flushPromises()
    expect(document.body.querySelector('.context-menu-wrapper')).toBeFalsy()
  })

  it('calls item action and closes the menu on click', async () => {
    const action = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: { items: [{ label: 'Run', action }] },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent())
    await flushPromises()

    const item = document.body.querySelector('.context-menu-wrapper-item')
    item.click()
    await flushPromises()

    expect(action).toHaveBeenCalledTimes(1)
    expect(document.body.querySelector('.context-menu-wrapper')).toBeFalsy()
  })

  it('adds disabled class when item.disabled = true (note: action still fires per current code)', async () => {
    const action = vi.fn()
    const wrapper = mount(ContextMenu, {
      props: { items: [{ label: 'Disabled', action, disabled: true }] },
      slots: { default: '<div id="area">area</div>' },
      attachTo: document.body,
    })

    await wrapper.find('#area').trigger('contextmenu', makeEvent())
    await flushPromises()

    const el = document.body.querySelector('.context-menu-wrapper-item')
    expect(el.classList.contains('disabled')).toBe(true)

    el.click()
    await flushPromises()
    expect(action).toHaveBeenCalledTimes(1) // current implementation still triggers
  })
})

describe('useContextMenu composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('showMenu sets coords and visible, closeMenu hides it', async () => {
    const { isVisible, menuCoords, contextMenuStyle, showMenu, closeMenu } = useContextMenu()

    expect(isVisible.value).toBe(false)

    const evt = makeEvent(420, 380)
    showMenu(evt)
    await flushPromises()

    expect(evt.preventDefault).toHaveBeenCalled()
    expect(isVisible.value).toBe(true)
    expect(menuCoords.value).toEqual({ x: 420, y: 380 })
    expect(contextMenuStyle.value.top).toBe('380px')
    expect(contextMenuStyle.value.left).toBe('420px')

    closeMenu()
    expect(isVisible.value).toBe(false)
  })

  it('handleMenuEnter cancels hide timeout; handleMenuLeave closes after delay', async () => {
    const { isVisible, showMenu, handleMenuEnter, handleMenuLeave } = useContextMenu()

    showMenu(makeEvent(10, 10))
    await flushPromises()
    expect(isVisible.value).toBe(true)

    handleMenuEnter()
    handleMenuLeave()
    expect(isVisible.value).toBe(true)

    vi.advanceTimersByTime(199)
    expect(isVisible.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(isVisible.value).toBe(false)
  })
})
