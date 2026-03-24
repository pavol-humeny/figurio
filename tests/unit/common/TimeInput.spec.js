/**
 * @file: TimeInput.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TimeInput from '@/components/common/TimeInput.vue'

const factory = (props = {}) => {
  setActivePinia(createPinia())

  return mount(TimeInput, {
    props: {
      modelValue: 150, // 2h 30m
      ...props,
    },
    global: {
      stubs: {
        ItemTip: {
          template: '<div><slot /></div>',
        },
      },
    },
  })
}

describe('TimeInput.vue', () => {
  it('renders hours and minutes correctly', () => {
    const wrapper = factory()
    const inputs = wrapper.findAll('input.value-input')

    expect(inputs.length).toBe(2)
    expect(inputs[0].element.value).toBe('02')
    expect(inputs[1].element.value).toBe('30')
  })

  it('emits update:modelValue and update on blur', async () => {
    const wrapper = factory()
    const inputs = wrapper.findAll('input.value-input')

    await inputs[0].setValue('04')
    await inputs[0].trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([270])
    expect(wrapper.emitted('update').at(-1)).toEqual([270])
  })

  it('emits update:modelValue and update on enter', async () => {
    const wrapper = factory()
    const inputs = wrapper.findAll('input.value-input')

    await inputs[1].setValue('45')
    await inputs[1].trigger('keydown.enter')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([165])
    expect(wrapper.emitted('update').at(-1)).toEqual([165])
  })

  it('updates minutes correctly', async () => {
    const wrapper = factory()
    const minutesInput = wrapper.findAll('input.value-input')[1]

    await minutesInput.setValue('59')
    await minutesInput.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([179])
  })

  it('clamps invalid hours input to max (23)', async () => {
    const wrapper = factory()
    const hoursInput = wrapper.findAll('input.value-input')[0]

    await hoursInput.setValue('99')
    await hoursInput.trigger('blur')

    expect(hoursInput.element.value).toBe('23')
  })

  it('clamps invalid minutes input to max (59)', async () => {
    const wrapper = factory({ modelValue: 180 })
    const minutesInput = wrapper.findAll('input.value-input')[1]

    await minutesInput.setValue('99')
    await minutesInput.trigger('blur')

    expect(minutesInput.element.value).toBe('59')
  })

  it('updates displayed values when modelValue changes', async () => {
    const wrapper = factory()

    await wrapper.setProps({ modelValue: 75 })
    const inputs = wrapper.findAll('input.value-input')

    expect(inputs[0].element.value).toBe('01')
    expect(inputs[1].element.value).toBe('15')
  })

  it('disables inputs when disabled=true', () => {
    const wrapper = factory({ disabled: true })
    const inputs = wrapper.findAll('input.value-input')

    expect(inputs[0].attributes('disabled')).toBeDefined()
    expect(inputs[1].attributes('disabled')).toBeDefined()
  })
})
