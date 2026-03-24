/**
 * @file: NumberInput.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NumberInput from '@/components/common/NumberInput.vue'

const factory = (props = {}) => {
  setActivePinia(createPinia())

  return mount(NumberInput, {
    props: {
      modelValue: 10,
      min: 0,
      max: 100,
      ...props,
    },
    global: {
      stubs: {
        ItemTip: {
          template: '<div><slot /></div>',
        },
        BaseIcon: {
          template: `<div class="mock-icon" @dblclick="$emit('dblclick')" @pointerdown="$emit('pointerdown', $event)" />`,
        },
      },
    },
  })
}

describe('NumberInput.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input with correct initial value', () => {
    const wrapper = factory({ modelValue: 10 })

    expect(wrapper.find('input').element.value).toBe('10')
  })

  it('emits update:modelValue and update on blur', async () => {
    const wrapper = factory({ modelValue: 5 })
    const input = wrapper.find('input')

    await input.setValue(20)
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([20])
    expect(wrapper.emitted('update').at(-1)).toEqual([20])
  })

  it('clamps value to min on blur', async () => {
    const wrapper = factory({ modelValue: 5, min: 10 })
    const input = wrapper.find('input')

    await input.setValue(0)
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([10])
  })

  it('clamps value to max on enter', async () => {
    const wrapper = factory({ modelValue: 5, max: 50 })
    const input = wrapper.find('input')

    await input.setValue(100)
    await input.trigger('keydown.enter')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([50])
  })

  it('emits update on valid input (onInput)', async () => {
    const wrapper = factory({ modelValue: 10 })
    const input = wrapper.find('input')

    await input.setValue(25)

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([25])
  })

  it('does NOT emit update for empty or "-" input', async () => {
    const wrapper = factory({ modelValue: 10 })
    const input = wrapper.find('input')

    await input.setValue('')
    await input.trigger('input')

    await input.setValue('-')
    await input.trigger('input')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('handles mouse wheel increment/decrement', async () => {
    const wrapper = factory({ modelValue: 10, step: 2 })
    const input = wrapper.find('input')

    await input.trigger('wheel', { deltaY: -1 }) // up
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([12])

    await input.trigger('wheel', { deltaY: 1 }) // down
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([10])
  })

  it('displays icon and triggers reset on double click', async () => {
    const onReset = vi.fn()
    const wrapper = factory({ icon: 'IconTest', onReset })

    const icon = wrapper.find('.mock-icon')
    expect(icon.exists()).toBe(true)

    await icon.trigger('dblclick')
    expect(onReset).toHaveBeenCalled()
  })

  it('does not call onReset when disabled', async () => {
    const onReset = vi.fn()
    const wrapper = factory({ icon: 'IconTest', disabled: true, onReset })

    const icon = wrapper.find('.mock-icon')
    await icon.trigger('dblclick')

    expect(onReset).not.toHaveBeenCalled()
  })

  it('displays unit when set', () => {
    const wrapper = factory({ unit: 'px' })

    const unit = wrapper.find('.input-unit')
    expect(unit.exists()).toBe(true)
    expect(unit.text()).toBe('px')
  })

  it('applies disabled class to unit and icon', () => {
    const wrapper = factory({
      unit: 'px',
      icon: 'IconTest',
      disabled: true,
    })

    expect(wrapper.find('.input-unit').classes()).toContain('disabled')
    expect(wrapper.find('.mock-icon').classes()).toContain('disabled')
  })

  it('updates value via setValue()', async () => {
    const wrapper = factory()

    wrapper.vm.setValue(42)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('input').element.value).toBe('42')
  })

  it('reacts to modelValue changes', async () => {
    const wrapper = factory({ modelValue: 10 })

    await wrapper.setProps({ modelValue: 55 })
    expect(wrapper.vm.inputValue).toBe(55)

    await wrapper.setProps({ modelValue: 0 })
    expect(wrapper.vm.inputValue).toBe(0)
  })

  it('rounds value based on step', async () => {
    const wrapper = factory({ step: 0.25 })
    const input = wrapper.find('input')

    await input.setValue(1.234)
    await input.trigger('blur')

    expect(wrapper.vm.inputValue).toBe(1.23)
  })

  it('rounding works for various step values', async () => {
    let wrapper = factory({ step: 1 })
    wrapper.vm.inputValue = 1.234
    await wrapper.vm.onBlurOrEnter()
    expect(wrapper.vm.inputValue).toBe(1)

    wrapper = factory({ step: 0.005 })
    wrapper.vm.inputValue = 1.23456
    await wrapper.vm.onBlurOrEnter()
    expect(wrapper.vm.inputValue).toBe(1.235)
  })
})
