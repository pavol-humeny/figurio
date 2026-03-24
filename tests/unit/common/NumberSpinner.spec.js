/**
 * @file: NumberSpinner.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NumberSpinner from '@/components/common/NumberSpinner.vue'

const factory = (props = {}) => {
  setActivePinia(createPinia())

  return mount(NumberSpinner, {
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
        BaseIcon: true,
      },
    },
  })
}

describe('NumberSpinner.vue', () => {
  it('renders initial value', () => {
    const wrapper = factory({ modelValue: 7 })
    expect(wrapper.find('input').element.value).toBe('7')
  })

  it('increments value correctly', () => {
    const wrapper = factory({ modelValue: 5, step: 2 })

    wrapper.vm.increment()

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([7])
  })

  it('decrements value correctly', () => {
    const wrapper = factory({ modelValue: 5, step: 2 })

    wrapper.vm.decrement()

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([3])
  })

  it('clamps to max and still emits', () => {
    const wrapper = factory({ modelValue: 10, max: 10 })

    wrapper.vm.increment()

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([10])
  })

  it('clamps to min and still emits', () => {
    const wrapper = factory({ modelValue: 0, min: 0 })

    wrapper.vm.decrement()

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([0])
  })

  it('handles manual input and commit', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')

    await input.setValue('8')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([8])
  })

  it('clamps input to max on commit', async () => {
    const wrapper = factory({ max: 10 })
    const input = wrapper.find('input')

    await input.setValue('999')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([10])
  })

  it('clamps input to min on commit', async () => {
    const wrapper = factory({ min: 2 })
    const input = wrapper.find('input')

    await input.setValue('-100')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([2])
  })

  it('handles wheel increment and decrement', async () => {
    const wrapper = factory({ modelValue: 5 })
    const el = wrapper.find('.number-spinner-wrapper')

    await el.trigger('mouseenter') // 🔥 REQUIRED

    await el.trigger('wheel', { deltaY: -1 })
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([6])

    await el.trigger('wheel', { deltaY: 1 })
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([5])
  })

  it('updates value via setValue()', async () => {
    const wrapper = factory()

    wrapper.vm.setValue(42)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('input').element.value).toBe('42')
  })

  it('applies disabled attribute', () => {
    const wrapper = factory({ disabled: true })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('renders icon when provided', () => {
    const wrapper = factory({ icon: 'IconTest' })
    expect(wrapper.findComponent({ name: 'BaseIcon' }).exists()).toBe(true)
  })

  it('updates when modelValue prop changes', async () => {
    const wrapper = factory({ modelValue: 5 })

    await wrapper.setProps({ modelValue: 9 })

    expect(wrapper.find('input').element.value).toBe('9')
  })
})
