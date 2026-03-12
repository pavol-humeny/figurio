/**
 * @file: DropDownSelect.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
// DropdownSelect.spec.js – unit tests for new DropdownSelect component
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DropdownSelect from '@/components/common/DropdownSelect.vue'

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
  })
}

describe('DropdownSelect.vue', () => {
  it('renders current selected label correctly', () => {
    const wrapper = factory({ modelValue: 'second' })
    expect(wrapper.text()).toContain('Second')
  })

  it('emits update:modelValue and update when option is clicked', async () => {
    const wrapper = factory()
    // open dropdown
    await wrapper.find('.select-display').trigger('click')
    const option = wrapper.findAll('.dropdown-options li')[1] // 'Second'
    await option.trigger('mousedown.prevent')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['second'])
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')[0]).toEqual(['second'])
  })

  it('calls onReset function on icon double click', async () => {
    const onResetMock = vi.fn()
    const wrapper = factory({ icon: 'IconTest', onReset: onResetMock })
    const icon = wrapper.find('.input-icon-left')
    await icon.trigger('dblclick')
    expect(onResetMock).toHaveBeenCalled()
  })

  it('does not render icon if icon prop is empty', () => {
    const wrapper = factory({ icon: '' })
    expect(wrapper.find('.input-icon-left').exists()).toBe(false)
  })

  it('renders icon if icon prop is set', () => {
    const wrapper = factory({ icon: 'IconTest' })
    expect(wrapper.find('.input-icon-left').exists()).toBe(true)
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
    expect(wrapper.vm.showDropdown).toBe(true)

    // simulate click outside as mousedown
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await flushPromises()
    expect(wrapper.vm.showDropdown).toBe(false)
  })

  it('calls setValue exposed method correctly', async () => {
    const wrapper = factory()
    await wrapper.vm.setValue('second')
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
    // disabled → should return early
    let wrapper = factory({ disabled: true })
    wrapper.vm.showDropdown = false
    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(false)

    // enabled → toggles correctly
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
        options: [], // prázdne pole
      },
    })

    const display = wrapper.find('.select-display')
    expect(display.text()).toBe('') // fallback
  })
})
