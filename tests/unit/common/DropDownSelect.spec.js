/**
 * @file: DropDownSelect.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import DropdownSelect from '@/components/common/DropdownSelect.vue'

// Mock canvas getContext for JSDOM
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  measureText: (text) => ({ width: text.length * 8 }), // simple fake width
}))

// Mock ItemTip (avoid Pinia usage inside it)
vi.mock('@/components/common/ItemTip.vue', () => ({
  default: {
    name: 'ItemTip',
    template: '<div><slot /></div>',
    props: ['text', 'position'],
  },
}))

// Mock BaseIcon (simplified)
vi.mock('@/components/icons/BaseIcon.vue', () => ({
  default: {
    name: 'BaseIcon',
    template: '<div class="mock-icon" @dblclick="$emit(\'dblclick\')" />',
    props: ['name', 'size', 'color'],
  },
}))

const defaultOptions = [
  { label: 'First', value: 'first' },
  { label: 'Second', value: 'second' },
]

const factory = (props = {}) => {
  return mount(DropdownSelect, {
    props: {
      modelValue: 'first',
      options: defaultOptions,
      ...props,
    },
    global: {
      plugins: [createPinia()],
    },
    attachTo: document.body,
  })
}

describe('DropdownSelect.vue', () => {
  it('renders current selected label correctly', () => {
    const wrapper = factory({ modelValue: 'second' })
    expect(wrapper.text()).toContain('Second')
  })

  it('emits update:modelValue and update when option is clicked', async () => {
    const wrapper = factory()

    await wrapper.find('.select-display').trigger('click')
    await flushPromises()

    const options = document.querySelectorAll('.dropdown-options-teleported li')
    options[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))

    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['second'])
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')[0]).toEqual(['second'])
  })

  it('calls onReset function on icon double click', async () => {
    const onResetMock = vi.fn()
    const wrapper = factory({ icon: 'IconTest', onReset: onResetMock })

    const icon = wrapper.find('.mock-icon')
    await icon.trigger('dblclick')

    expect(onResetMock).toHaveBeenCalled()
  })

  it('does not render left icon if icon prop is empty', () => {
    const wrapper = factory({ icon: '' })

    const icons = wrapper.findAllComponents({ name: 'BaseIcon' })

    // only dropdown arrow should exist
    expect(icons.length).toBe(1)
  })

  it('renders icon if icon prop is set', () => {
    const wrapper = factory({ icon: 'IconTest' })

    const icons = wrapper.findAllComponents({ name: 'BaseIcon' })

    // left icon + dropdown arrow
    expect(icons.length).toBe(2)
  })

  it('renders icon if icon prop is set', () => {
    const wrapper = factory({ icon: 'IconTest' })
    expect(wrapper.find('.mock-icon').exists()).toBe(true)
  })

  it('toggles dropdown when display is clicked', async () => {
    const wrapper = factory()
    const display = wrapper.find('.select-display')

    expect(wrapper.vm.showDropdown).toBe(false)

    await display.trigger('click')
    expect(wrapper.vm.showDropdown).toBe(true)

    await display.trigger('click')
    expect(wrapper.vm.showDropdown).toBe(false)
  })

  it('closes dropdown when clicking outside', async () => {
    const wrapper = factory()

    await wrapper.find('.select-display').trigger('click')
    await flushPromises()

    expect(wrapper.vm.showDropdown).toBe(true)

    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await flushPromises()

    expect(wrapper.vm.showDropdown).toBe(false)
  })

  it('calls setValue exposed method correctly', async () => {
    const wrapper = factory()

    wrapper.vm.setValue('second')
    expect(wrapper.vm.selectedValue).toBe('second')
  })

  it('updates selectedValue when modelValue prop changes (watch)', async () => {
    const wrapper = factory({ modelValue: 'first' })

    expect(wrapper.vm.selectedValue).toBe('first')

    await wrapper.setProps({ modelValue: 'second' })
    expect(wrapper.vm.selectedValue).toBe('second')
  })

  it('removes mousedown listener on unmount', () => {
    const wrapper = factory()
    const spy = vi.spyOn(document, 'removeEventListener')

    wrapper.unmount()

    expect(spy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    spy.mockRestore()
  })

  it('toggleDropdown does nothing when disabled and toggles when enabled', async () => {
    // disabled
    let wrapper = factory({ disabled: true })
    wrapper.vm.showDropdown = false
    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(false)

    // enabled
    wrapper = factory({ disabled: false })
    wrapper.vm.showDropdown = false
    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(true)

    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(false)
  })

  it('returns empty label when options is empty', () => {
    const wrapper = mount(DropdownSelect, {
      props: {
        modelValue: 'any',
        options: [],
      },
      global: {
        plugins: [createPinia()],
      },
    })

    const display = wrapper.find('.select-display')
    expect(display.text()).toBe('')
  })

  it('computes longestLabelWidth', () => {
    const wrapper = factory({
      options: [
        { label: 'Short', value: 1 },
        { label: 'Very very long label', value: 2 },
      ],
    })

    expect(wrapper.vm.longestLabelWidth).toBeGreaterThan(0)
  })
})
