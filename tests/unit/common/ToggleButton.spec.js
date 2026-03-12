/**
 * @file: ToggleButton.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ToggleButton from '@/components/common/ToggleButton.vue'

vi.mock('@/components/common/ItemTip.vue', () => ({
  default: {
    name: 'ItemTip',
    template: '<div class="item-tip"><slot /></div>',
    props: ['text', 'position'],
  },
}))

describe('ToggleButton.vue', () => {
  it('renders initial state based on modelValue', () => {
    const wrapper = mount(ToggleButton, {
      props: { modelValue: true },
    })

    const slider = wrapper.find('.toggle-switch-slider')
    expect(slider.classes()).toContain('active')
  })

  it('toggles state and emits updates on click', async () => {
    const wrapper = mount(ToggleButton, {
      props: { modelValue: false },
    })

    await wrapper.find('.toggle-switch-wrapper').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([true])
    expect(wrapper.emitted('update')[0]).toEqual([true])
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(ToggleButton, {
      props: { modelValue: false, disabled: true },
    })

    await wrapper.find('.toggle-switch-wrapper').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('applies disabled class and disables interaction', () => {
    const wrapper = mount(ToggleButton, {
      props: { modelValue: true, disabled: true },
    })

    const wrapperEl = wrapper.find('.toggle-switch-wrapper')
    expect(wrapperEl.classes()).toContain('toggle-disabled')
  })

  it('reacts to modelValue prop change', async () => {
    const wrapper = mount(ToggleButton, {
      props: { modelValue: false },
    })

    await wrapper.setProps({ modelValue: true })
    const slider = wrapper.find('.toggle-switch-slider')
    expect(slider.classes()).toContain('active')
  })

  it('applies scale transform from props', () => {
    const wrapper = mount(ToggleButton, {
      props: { modelValue: false, scale: 1.5 },
    })

    const container = wrapper.find('.toggle-switch')
    expect(container.attributes('style')).toContain('scale(1.5)')
  })
})
