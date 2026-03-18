/**
 * @file: ExplainItem.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExplainItem from '@/components/common/ExplainItem.vue'

const mountComponent = (props = {}) =>
  mount(ExplainItem, {
    props: {
      text: 'Test text',
      title: 'Test title',
      ...props,
    },
    global: {
      stubs: {
        ItemTip: {
          name: 'ItemTip',
          template: '<div class="item-tip"><slot /></div>',
          props: ['title', 'shortcut', 'text', 'position', 'advance', 'delay'],
        },
        BaseIcon: {
          name: 'BaseIcon',
          template: '<div class="base-icon"></div>',
          props: ['name', 'size', 'color'],
        },
      },
    },
  })

describe('ExplainItem.vue', () => {
  it('renders wrapper', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.explain-item-wrapper').exists()).toBe(true)
  })

  it('passes correct props to ItemTip', () => {
    const wrapper = mountComponent({
      text: 'Hello',
      title: 'Title',
      shortcut: 'CTRL + S',
      textPosition: 'top',
    })

    const tip = wrapper.findComponent({ name: 'ItemTip' })

    expect(tip.exists()).toBe(true)
    expect(tip.props('text')).toBe('Hello')
    expect(tip.props('title')).toBe('Title')
    expect(tip.props('shortcut')).toBe('CTRL + S')
    expect(tip.props('position')).toBe('top')

    // FIX
    expect(tip.props()).toHaveProperty('advance')

    expect(tip.props('delay')).toBe(0)
  })

  it('renders BaseIcon inside ItemTip', () => {
    const wrapper = mountComponent()

    const icon = wrapper.findComponent({ name: 'BaseIcon' })

    expect(icon.exists()).toBe(true)
    expect(icon.props('name')).toBe('IconExplain')
    expect(icon.props('size')).toBe(18)
  })

  it('applies left position style by default', () => {
    const wrapper = mountComponent()

    const style = wrapper.find('.explain-item-wrapper').attributes('style')
    expect(style).toContain('left: 0')
    expect(style).toContain('top: 0')
  })

  it('applies right position style when position="right"', () => {
    const wrapper = mountComponent({
      position: 'right',
    })

    const style = wrapper.find('.explain-item-wrapper').attributes('style')
    expect(style).toContain('right: 0')
    expect(style).toContain('top: 0')
  })

  it('uses default values correctly', () => {
    const wrapper = mountComponent()

    const tip = wrapper.findComponent({ name: 'ItemTip' })

    expect(tip.exists()).toBe(true)
    expect(tip.props('shortcut')).toBe('')
    expect(tip.props('position')).toBe('bottom')
  })
})
