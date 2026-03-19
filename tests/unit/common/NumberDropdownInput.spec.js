/**
 * @file: NumberDropdownInput.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberDropdownInput from '@/components/common/NumberDropdownInput.vue'

const factory = (props = {}) => {
  return mount(NumberDropdownInput, {
    props: {
      modelValue: 10,
      options: [5, 10, 15, 20],
      ...props,
    },
  })
}

describe('NumberDropdownInput.vue', () => {
  it('renders input with initial value', () => {
    const wrapper = factory()
    const input = wrapper.find('input[type="number"]')
    expect(input.element.value).toBe('10')
  })

  it('emits update:modelValue and update on blur', async () => {
    const wrapper = factory()
    const input = wrapper.find('input[type="number"]')
    await input.setValue('15')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([15])
    expect(wrapper.emitted('update')[0]).toEqual([15])
  })

  it('clamps value to max on enter keydown', async () => {
    const wrapper = factory({ min: 0, max: 20 })
    const input = wrapper.find('input[type="number"]')
    await input.setValue('100')
    await input.trigger('keydown.enter')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([20])
  })

  it('clamps value to min on blur', async () => {
    const wrapper = factory({ min: 5, max: 100 })
    const input = wrapper.find('input[type="number"]')
    await input.setValue('0')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([5])
  })

  it('shows dropdown on icon click', async () => {
    const wrapper = factory()
    const icon = wrapper.find('.dropdown-icon')
    await icon.trigger('click')
    expect(wrapper.vm.showDropdown).toBe(true)
    expect(wrapper.find('ul.dropdown-options').exists()).toBe(true)
  })

  it('selects value from dropdown and emits', async () => {
    const wrapper = factory()
    await wrapper.find('.dropdown-icon').trigger('click')

    const option = wrapper.findAll('ul.dropdown-options li')[2] // value: 15
    await option.trigger('mousedown')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([15])
    expect(wrapper.vm.inputValue).toBe('15')
  })

  it('hides dropdown when clicking outside', async () => {
    const wrapper = factory()
    await wrapper.find('.dropdown-icon').trigger('click')
    expect(wrapper.vm.showDropdown).toBe(true)

    await document.dispatchEvent(new MouseEvent('mousedown'))
    expect(wrapper.vm.showDropdown).toBe(false)
  })

  it('disables input when disabled=true', () => {
    const wrapper = factory({ disabled: true })
    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('renders icon when provided', () => {
    const wrapper = factory({ icon: 'IconTest' })
    expect(wrapper.findComponent({ name: 'BaseIcon' }).exists()).toBe(true)
  })

  it('calls exposed setValue() method', async () => {
    const wrapper = factory()
    wrapper.vm.setValue(42)
    await wrapper.vm.$nextTick()

    const input = wrapper.find('input[type="number"]')
    expect(input.element.value).toBe('42')
  })

  it('updates inputValue when modelValue prop changes', async () => {
    const wrapper = factory()

    expect(wrapper.vm.inputValue).toBe('10')

    await wrapper.setProps({ modelValue: 42 })

    expect(wrapper.vm.inputValue).toBe('42')

    await wrapper.setProps({ modelValue: 7 })

    expect(wrapper.vm.inputValue).toBe('7')
  })

  it('resets inputValue to modelValue when input is not a valid number on blur', async () => {
    const wrapper = factory()
    const input = wrapper.find('input[type="number"]')

    await input.setValue('')
    await input.trigger('blur')

    expect(wrapper.vm.inputValue).toBe('10')

    await input.setValue('-')
    await input.trigger('blur')

    expect(wrapper.vm.inputValue).toBe('10')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('removes mousedown event listener on unmount', () => {
    const removeListenerSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(NumberDropdownInput, {
      props: {
        modelValue: 10,
        options: [5, 10, 15, 20],
      },
    })

    wrapper.unmount()

    expect(removeListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))

    removeListenerSpy.mockRestore()
  })

  it('rounds input value correctly according to step/decimals', async () => {
    // step >= 1 0 decimals
    let wrapper = mount(NumberDropdownInput, {
      props: { modelValue: 0, min: 0, max: 10, step: 1, options: [0, 1, 2] },
    })
    wrapper.vm.inputValue = '1.234'
    await wrapper.vm.onCommit()
    expect(wrapper.vm.inputValue).toBe('1')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([1])

    // step < 1 2 decimals
    wrapper = mount(NumberDropdownInput, {
      props: { modelValue: 0, min: 0, max: 10, step: 0.25, options: [0, 0.25, 0.5] },
    })
    wrapper.vm.inputValue = '1.234'
    await wrapper.vm.onCommit()
    expect(wrapper.vm.inputValue).toBe('1.23')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([1.23])

    // step < 1 3 decimals
    wrapper = mount(NumberDropdownInput, {
      props: { modelValue: 0, min: 0, max: 10, step: 0.005, options: [0, 0.005, 0.01] },
    })
    wrapper.vm.inputValue = '1.23456'
    await wrapper.vm.onCommit()
    expect(wrapper.vm.inputValue).toBe('1.235')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([1.235])

    // invalid step
    wrapper = mount(NumberDropdownInput, {
      props: { modelValue: 0, min: 0, max: 10, step: 'a', options: [0, 1, 2] },
    })
    wrapper.vm.inputValue = '1.234'
    await wrapper.vm.onCommit()
    expect(wrapper.vm.inputValue).toBe('1')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([1])
  })

  it('toggleDropdown does nothing when disabled and toggles when enabled', async () => {
    // disabled should return early
    let wrapper = mount(NumberDropdownInput, {
      props: { modelValue: 0, options: [0, 1], disabled: true },
    })
    wrapper.vm.showDropdown = false
    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(false) // stays false

    // enabled toggles correctly
    wrapper = mount(NumberDropdownInput, {
      props: { modelValue: 0, options: [0, 1], disabled: false },
    })
    wrapper.vm.showDropdown = false
    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(true)

    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(false)
  })
})
