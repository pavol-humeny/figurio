import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberInput from '@/components/common/NumberInput.vue'

describe('NumberInput.vue', () => {
  it('renders input with correct initial value', () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        min: 0,
        max: 100,
      },
    })

    const input = wrapper.find('input[type="number"]')
    expect(input.element.value).toBe('10')
  })

  it('emits update:modelValue and update on blur', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 5,
        min: 0,
        max: 100,
      },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(20)
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update')[0]).toEqual([20])
  })

  it('clamps value to min on blur', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 5,
        min: 10,
        max: 100,
      },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(0)
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([10])
  })

  it('clamps value to max on enter keydown', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 5,
        min: 0,
        max: 50,
      },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(100)
    await input.trigger('keydown.enter')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([50])
  })

  it('displays icon and triggers reset on double click', async () => {
    const onReset = vi.fn()
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        icon: 'IconTest',
        onReset,
      },
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.exists()).toBe(true)

    await icon.trigger('dblclick')
    expect(onReset).toHaveBeenCalled()
  })

  it('does not call onReset when disabled', async () => {
    const onReset = vi.fn()
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        icon: 'IconTest',
        disabled: true,
        onReset,
      },
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    await icon.trigger('dblclick')
    expect(onReset).not.toHaveBeenCalled()
  })

  it('displays unit when set', () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        unit: 'px',
      },
    })

    const unitSpan = wrapper.find('.input-unit')
    expect(unitSpan.exists()).toBe(true)
    expect(unitSpan.text()).toBe('px')
  })

  it('applies disabled class to unit and icon when disabled', () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
        unit: 'px',
        icon: 'IconTest',
        disabled: true,
      },
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    const unitSpan = wrapper.find('.input-unit')

    expect(icon.classes()).toContain('disabled')
    expect(unitSpan.classes()).toContain('disabled')
  })

  it('updates value via exposed setValue()', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 10,
      },
    })

    // call exposed method
    wrapper.vm.setValue(42)
    await wrapper.vm.$nextTick()

    const input = wrapper.find('input[type="number"]')
    expect(input.element.value).toBe('42')
  })
})
