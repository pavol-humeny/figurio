/**
 * @file: TimeInput.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeInput from '@/components/common/TimeInput.vue'

const factory = (props = {}) => {
  return mount(TimeInput, {
    props: {
      modelValue: 150, // 2h 30m
      ...props,
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

    await inputs[0].setValue('04') // 4 hours
    await inputs[0].trigger('blur')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    // Hours changed to 4, minutes remain 30 => 270 minutes
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([270])
    expect(wrapper.emitted('update')[0]).toEqual([270])
  })

  it('emits update:modelValue on enter keydown', async () => {
    const wrapper = factory()
    const inputs = wrapper.findAll('input.value-input')

    await inputs[1].setValue('45') // 2h 45m => 165 minutes
    await inputs[1].trigger('keydown.enter')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue').pop()).toEqual([165])
  })

  it('correctly updates minutes when minutes input changes', async () => {
    const wrapper = factory()
    const minutesInput = wrapper.findAll('input.value-input')[1]

    await minutesInput.setValue('59')
    await minutesInput.trigger('blur')
    expect(wrapper.emitted('update:modelValue').pop()).toEqual([179])
  })

  it('clamps invalid hours input to default (10)', async () => {
    const wrapper = factory()
    const hoursInput = wrapper.findAll('input.value-input')[0]

    await hoursInput.setValue('99') // invalid
    await hoursInput.trigger('input')
    expect(hoursInput.element.value).toBe('10')
  })

  it('resets invalid minutes input to default (10)', async () => {
    const wrapper = factory({ modelValue: 180 }) // 3h 0m
    const minutesInput = wrapper.findAll('input.value-input')[1]

    await minutesInput.setValue('99') // invalid
    await minutesInput.trigger('input')
    expect(minutesInput.element.value).toBe('10')
  })

  it('updates displayed values when modelValue changes', async () => {
    const wrapper = factory()
    await wrapper.setProps({ modelValue: 75 }) // 1h 15m
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
