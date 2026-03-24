/**
 * @file: ToggleButton.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ToggleButton from '@/components/common/ToggleButton.vue'

const factory = (props = {}) => {
  setActivePinia(createPinia())

  return mount(ToggleButton, {
    props: {
      modelValue: false,
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

describe('ToggleButton.vue', () => {
  it('renders initial state based on modelValue', () => {
    const wrapper = factory({ modelValue: true })

    const slider = wrapper.find('.toggle-switch-slider')
    expect(slider.classes()).toContain('active')
  })

  it('toggles state and emits updates on click', async () => {
    const wrapper = factory({ modelValue: false })

    await wrapper.find('.toggle-switch-wrapper').trigger('click')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([true])
    expect(wrapper.emitted('update').at(-1)).toEqual([true])
  })

  it('toggles back on second click', async () => {
    const wrapper = factory({ modelValue: false })
    const el = wrapper.find('.toggle-switch-wrapper')

    await el.trigger('click') // false -> true
    await el.trigger('click') // true -> false

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([false])
  })

  it('does not emit when disabled', async () => {
    const wrapper = factory({ modelValue: false, disabled: true })

    await wrapper.find('.toggle-switch-wrapper').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('applies disabled class', () => {
    const wrapper = factory({ modelValue: true, disabled: true })

    const wrapperEl = wrapper.find('.toggle-switch-wrapper')
    expect(wrapperEl.classes()).toContain('toggle-disabled')
  })

  it('reacts to modelValue prop change', async () => {
    const wrapper = factory({ modelValue: false })

    await wrapper.setProps({ modelValue: true })

    const slider = wrapper.find('.toggle-switch-slider')
    expect(slider.classes()).toContain('active')
  })

  it('applies scale transform from props', () => {
    const wrapper = factory({ scale: 1.5 })

    const container = wrapper.find('.toggle-switch')
    expect(container.attributes('style')).toContain('scale(1.5)')
  })
})
