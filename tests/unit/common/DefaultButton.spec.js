/**
 * @file: DefaultButton.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultButton from '@/components/common/DefaultButton.vue'

// Mock ItemTip
vi.mock('@/components/common/ItemTip.vue', () => ({
  default: {
    name: 'ItemTip',
    template: '<div class="item-tip"><slot /></div>',
    props: ['text', 'position'],
  },
}))

describe('DefaultButton.vue', () => {
  const factory = (props = {}) =>
    mount(DefaultButton, {
      props: {
        text: 'Test',
        ...props,
      },
    })

  it('renders button with text', () => {
    const wrapper = factory({ text: 'Save' })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Save')
  })

  it('applies onlyText styling', () => {
    const wrapper = factory({ onlyText: true })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('button-text')
    expect(button.classes()).not.toContain('button-default')
  })

  it('applies default styling when onlyText is false', () => {
    const wrapper = factory({ onlyText: false })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('button-default')
    expect(button.classes()).not.toContain('button-text')
  })

  it('applies disabled class', () => {
    const wrapper = factory({ disabled: true })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('disabled')
  })

  it('applies main style', () => {
    const wrapper = factory({ main: true })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('button-main')
  })

  it('applies error style', () => {
    const wrapper = factory({ error: true })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('button-error')
  })

  it('combines multiple classes correctly', () => {
    const wrapper = factory({
      onlyText: true,
      main: true,
      disabled: true,
    })

    const button = wrapper.find('button')

    expect(button.classes()).toContain('button-text')
    expect(button.classes()).toContain('button-main')
    expect(button.classes()).toContain('disabled')
    expect(button.classes()).not.toContain('button-default')
  })

  it('emits click event', async () => {
    const wrapper = factory()

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('emits click even when disabled (current behavior)', async () => {
    const wrapper = factory({ disabled: true })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('passes tooltip props to ItemTip', () => {
    const wrapper = factory({
      tip: 'Tooltip text',
      position: 'top',
    })

    const tip = wrapper.findComponent({ name: 'ItemTip' })

    expect(tip.exists()).toBe(true)
    expect(tip.props('text')).toBe('Tooltip text')
    expect(tip.props('position')).toBe('top')
  })

  it('uses default tooltip values', () => {
    const wrapper = factory()

    const tip = wrapper.findComponent({ name: 'ItemTip' })

    expect(tip.props('text')).toBe('')
    expect(tip.props('position')).toBe('bottom')
  })
})
