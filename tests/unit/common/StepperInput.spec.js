import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StepperInput from '@/components/common/StepperInput.vue'

describe('StepperInput.vue', () => {
  it('renders initial value correctly', () => {
    const wrapper = mount(StepperInput, {
      props: { modelValue: 5 },
    })
    expect(wrapper.text()).toContain('5')
  })

  it('increases value when clicking plus icon', async () => {
    const wrapper = mount(StepperInput, {
      props: {
        modelValue: 5,
        step: 2,
        max: 10,
      },
    })

    const plus = wrapper.findAllComponents({ name: 'BaseIcon' })[1]
    await plus.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([7])
  })

  it('decreases value when clicking minus icon', async () => {
    const wrapper = mount(StepperInput, {
      props: {
        modelValue: 5,
        step: 2,
        min: 0,
      },
    })

    const minus = wrapper.findAllComponents({ name: 'BaseIcon' })[0]
    await minus.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([3])
  })

  it('does not increase above max', async () => {
    const wrapper = mount(StepperInput, {
      props: {
        modelValue: 10,
        step: 1,
        max: 10,
      },
    })

    const plus = wrapper.findAllComponents({ name: 'BaseIcon' })[1]
    await plus.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('does not decrease below min', async () => {
    const wrapper = mount(StepperInput, {
      props: {
        modelValue: 0,
        step: 1,
        min: 0,
      },
    })

    const minus = wrapper.findAllComponents({ name: 'BaseIcon' })[0]
    await minus.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('calls onReset when double-clicked', async () => {
    const onReset = vi.fn()
    const wrapper = mount(StepperInput, {
      props: {
        modelValue: 5,
        onReset,
      },
    })

    const span = wrapper.find('.value')
    await span.trigger('dblclick')
    expect(onReset).toHaveBeenCalled()
  })

  it('handles wheel up as increase and down as decrease', async () => {
    const wrapper = mount(StepperInput, {
      props: {
        modelValue: 5,
        step: 1,
        min: 0,
        max: 10,
      },
    })

    const span = wrapper.find('.value')

    // scroll up → increase
    await span.trigger('wheel', { deltaY: -1 })
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([6])

    // scroll down → decrease
    await span.trigger('wheel', { deltaY: 1 })
    expect(wrapper.emitted('update:modelValue')[1]).toEqual([5])
  })

  it('exposes setValue and updates value programmatically', async () => {
    const wrapper = mount(StepperInput, {
      props: { modelValue: 1 },
    })

    wrapper.vm.setValue(42)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('42')
  })

  it('updates displayed value when modelValue prop changes (watch)', async () => {
    const wrapper = mount(StepperInput, {
      props: { modelValue: 5 },
    })

    expect(wrapper.find('.value').text()).toBe('5')

    await wrapper.setProps({ modelValue: 8 })

    expect(wrapper.find('.value').text()).toBe('8')
  })
})
