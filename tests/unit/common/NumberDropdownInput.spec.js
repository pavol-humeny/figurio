/**
 * @file: NumberDropdownInput.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import NumberDropdownInput from '@/components/common/NumberDropdownInput.vue'

const factory = (props = {}) => {
  setActivePinia(createPinia())

  return mount(NumberDropdownInput, {
    attachTo: document.body,
    props: {
      modelValue: 10,
      options: [5, 10, 15, 20],
      ...props,
    },
    global: {
      stubs: {
        ItemTip: {
          template: '<div><slot /></div>',
        },
        BaseIcon: true,
      },
    },
  })
}

describe('NumberDropdownInput.vue', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  const openDropdown = async (wrapper) => {
    wrapper.vm.toggleDropdown()
    await nextTick()
    await nextTick()
    await new Promise(requestAnimationFrame)
  }

  it('renders input with initial value', () => {
    const wrapper = factory()
    expect(wrapper.find('input').element.value).toBe('10')
  })

  it('emits update:modelValue and update on blur', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')

    await input.setValue('15')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([15])
    expect(wrapper.emitted('update').at(-1)).toEqual([15])
  })

  it('handles Enter key correctly (commit + blur)', async () => {
    const wrapper = factory({ min: 0, max: 20 })
    const input = wrapper.find('input')

    await input.setValue('100')
    await input.trigger('keydown.enter')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([20])
  })

  it('clamps value to min on blur', async () => {
    const wrapper = factory({ min: 5, max: 100 })
    const input = wrapper.find('input')

    await input.setValue('0')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([5])
  })

  it('shows dropdown when toggled', async () => {
    const wrapper = factory()

    await openDropdown(wrapper)

    expect(wrapper.vm.showDropdown).toBe(true)

    const dropdown = document.body.querySelector('.dropdown-options-teleported')
    expect(dropdown).toBeTruthy()
  })

  it('selects value from dropdown and emits', async () => {
    const wrapper = factory()

    await openDropdown(wrapper)

    const options = document.body.querySelectorAll('.dropdown-options-teleported li')
    expect(options.length).toBeGreaterThan(0)

    options[2].dispatchEvent(new MouseEvent('mousedown'))

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([15])
    expect(wrapper.vm.inputValue).toBe('15')
  })

  it('does not open dropdown when disabled', async () => {
    const wrapper = factory({ disabled: true })

    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(false)
  })

  it('disables input when disabled=true', () => {
    const wrapper = factory({ disabled: true })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('renders icon when provided', () => {
    const wrapper = factory({ icon: 'IconTest' })
    expect(wrapper.findComponent({ name: 'BaseIcon' }).exists()).toBe(true)
  })

  it('calls exposed setValue() method', async () => {
    const wrapper = factory()

    wrapper.vm.setValue(42)
    await nextTick()

    expect(wrapper.find('input').element.value).toBe('42')
  })

  it('updates inputValue when modelValue prop changes', async () => {
    const wrapper = factory()

    await wrapper.setProps({ modelValue: 42 })
    expect(wrapper.vm.inputValue).toBe('42')

    await wrapper.setProps({ modelValue: 7 })
    expect(wrapper.vm.inputValue).toBe('7')
  })

  it('resets invalid input on blur and emits fallback value', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')

    await input.setValue('')
    await input.trigger('blur')

    expect(wrapper.vm.inputValue).toBe('10')
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([10])

    await input.setValue('-')
    await input.trigger('blur')

    expect(wrapper.vm.inputValue).toBe('10')
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([10])
  })

  it('removes mousedown listener on unmount', () => {
    const spy = vi.spyOn(document, 'removeEventListener')

    const wrapper = factory()
    wrapper.unmount()

    expect(spy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    spy.mockRestore()
  })

  it('rounds values correctly based on step', async () => {
    let wrapper = factory({ step: 1 })
    wrapper.vm.inputValue = '1.234'
    await wrapper.vm.onCommit()
    expect(wrapper.vm.inputValue).toBe('1')

    wrapper = factory({ step: 0.25 })
    wrapper.vm.inputValue = '1.234'
    await wrapper.vm.onCommit()
    expect(wrapper.vm.inputValue).toBe('1.23')

    wrapper = factory({ step: 0.005 })
    wrapper.vm.inputValue = '1.23456'
    await wrapper.vm.onCommit()
    expect(wrapper.vm.inputValue).toBe('1.235')
  })

  it('toggleDropdown works correctly', () => {
    const wrapper = factory()

    wrapper.vm.showDropdown = false
    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(true)

    wrapper.vm.toggleDropdown()
    expect(wrapper.vm.showDropdown).toBe(false)
  })

  it('calls onReset on icon double click', async () => {
    const onReset = vi.fn()
    const wrapper = factory({ icon: 'IconTest', onReset })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    await icon.trigger('dblclick')

    expect(onReset).toHaveBeenCalled()
  })
})
