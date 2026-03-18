/**
 * @file: LevelSelector.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LevelSelector from '@/components/common/LevelSelector.vue'

const mountComponent = (props = {}) =>
  mount(LevelSelector, {
    props: {
      levels: [1, 2, 3],
      modelValue: 2,
      ...props,
    },
    global: {
      stubs: {
        ItemTip: {
          name: 'ItemTip',
          template: '<div class="item-tip"><slot /></div>',
          props: ['text', 'position'],
        },
      },
    },
  })

describe('LevelSelector.vue', () => {
  it('renders all levels', () => {
    const wrapper = mountComponent()

    const dots = wrapper.findAll('.dot')
    expect(dots.length).toBe(3)
    expect(dots[0].text()).toBe('1')
    expect(dots[1].text()).toBe('2')
    expect(dots[2].text()).toBe('3')
  })

  it('marks selected level as active', () => {
    const wrapper = mountComponent({
      modelValue: 2,
    })

    const dots = wrapper.findAll('.dot')
    expect(dots[1].classes()).toContain('active')
  })

  it('emits update:modelValue and update on click', async () => {
    const wrapper = mountComponent()

    const dots = wrapper.findAll('.dot')
    await dots[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([1])

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')[0]).toEqual([1])
  })

  it('does not emit when disabled', async () => {
    const wrapper = mountComponent({
      disabled: true,
    })

    const dots = wrapper.findAll('.dot')
    await dots[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.emitted('update')).toBeFalsy()
  })

  it('applies disabled class', () => {
    const wrapper = mountComponent({
      disabled: true,
    })

    const wrapperDiv = wrapper.find('.level-wrapper')
    expect(wrapperDiv.classes()).toContain('disabled')
  })

  it('passes tip and position to ItemTip', () => {
    const wrapper = mountComponent({
      tip: 'Test tip',
      position: 'top',
    })

    const tip = wrapper.findComponent({ name: 'ItemTip' })

    expect(tip.exists()).toBe(true)
    expect(tip.props('text')).toBe('Test tip')
    expect(tip.props('position')).toBe('top')
  })
})
