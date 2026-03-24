/**
 * @file: StepperInput.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StepperInput from '@/components/common/StepperInput.vue'

const factory = (props = {}) => {
  setActivePinia(createPinia())

  return mount(StepperInput, {
    props: {
      modelValue: 5,
      min: 0,
      max: 10,
      step: 1,
      ...props,
    },
    global: {
      stubs: {
        ItemTip: {
          template: '<div><slot /></div>',
        },
        BaseIcon: true, // no need to simulate events anymore
      },
    },
  })
}

describe('StepperInput.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders initial value correctly', () => {
    const wrapper = factory({ modelValue: 5 })
    expect(wrapper.find('input').element.value).toBe('5')
  })

  it('increases value correctly', () => {
    const wrapper = factory({ modelValue: 5, step: 2 })

    wrapper.vm.increase()

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([7])
    expect(wrapper.emitted('update').at(-1)).toEqual([7])
  })

  it('decreases value correctly', () => {
    const wrapper = factory({ modelValue: 5, step: 2 })

    wrapper.vm.decrease()

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([3])
    expect(wrapper.emitted('update').at(-1)).toEqual([3])
  })

  it('does not increase above max', () => {
    const wrapper = factory({ modelValue: 10, max: 10 })

    wrapper.vm.increase()

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('does not decrease below min', () => {
    const wrapper = factory({ modelValue: 0, min: 0 })

    wrapper.vm.decrease()

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('handles wheel correctly', async () => {
    const wrapper = factory({ modelValue: 5, step: 1 })
    const input = wrapper.find('input')

    await input.trigger('wheel', { deltaY: -1 })
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([6])

    await input.trigger('wheel', { deltaY: 1 })
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([5])
  })

  it('updates value via setValue()', async () => {
    const wrapper = factory()

    wrapper.vm.setValue(42)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('input').element.value).toBe('42')
  })

  it('updates when modelValue changes', async () => {
    const wrapper = factory({ modelValue: 5 })

    await wrapper.setProps({ modelValue: 8 })
    expect(wrapper.find('input').element.value).toBe('8')
  })

  it('handles manual input and blur', async () => {
    const wrapper = factory({ modelValue: 5 })
    const input = wrapper.find('input')

    await input.setValue('100')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([10])
  })

  it('clamps invalid input to min', async () => {
    const wrapper = factory({ modelValue: 5, min: 2 })
    const input = wrapper.find('input')

    await input.setValue('abc')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([2])
  })

  it('does not change when disabled', () => {
    const wrapper = factory({ modelValue: 5, disabled: true })

    wrapper.vm.increase()
    wrapper.vm.decrease()

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
