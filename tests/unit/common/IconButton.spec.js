/**
 * @file: IconButton.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconButton from '@/components/common/IconButton.vue'

// Simple stubs
const globalStubs = {
  ItemTip: {
    name: 'ItemTip',
    template: '<div><slot /></div>',
    props: ['text', 'position'],
  },
  BaseIcon: {
    name: 'BaseIcon',
    template: '<div />',
    props: ['name', 'size', 'color'],
  },
}

describe('IconButton.vue', () => {
  const factory = (props = {}) =>
    mount(IconButton, {
      props: {
        icon: 'TestIcon',
        ...props,
      },
      global: {
        stubs: globalStubs,
      },
    })

  it('renders button', () => {
    const wrapper = factory()
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('renders BaseIcon with correct props', () => {
    const wrapper = factory({
      size: 24,
      color: '#123456',
    })

    const baseIcon = wrapper.findComponent({ name: 'BaseIcon' })

    expect(baseIcon.exists()).toBe(true)
    expect(baseIcon.props('name')).toBe('TestIcon')
    expect(baseIcon.props('size')).toBe(24)
    expect(baseIcon.props('color')).toBe('#123456')
  })

  it('uses default props correctly', () => {
    const wrapper = factory()

    const baseIcon = wrapper.findComponent({ name: 'BaseIcon' })
    const itemTip = wrapper.findComponent({ name: 'ItemTip' })

    expect(baseIcon.props('size')).toBe(20)
    expect(baseIcon.props('color')).toBe('var(--primary-c)')

    expect(itemTip.props('text')).toBe('')
    expect(itemTip.props('position')).toBe('bottom')
  })

  it('emits click event on button click', async () => {
    const wrapper = factory()

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('still emits click even when disabled (current behavior)', async () => {
    const wrapper = factory({ disabled: true })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('applies active class', () => {
    const wrapper = factory({ active: true })

    expect(wrapper.find('button').classes()).toContain('active')
  })

  it('applies disabled class', () => {
    const wrapper = factory({ disabled: true })

    expect(wrapper.find('button').classes()).toContain('disabled')
  })

  it('does not apply active/disabled classes by default', () => {
    const wrapper = factory()

    const classes = wrapper.find('button').classes()

    expect(classes).not.toContain('active')
    expect(classes).not.toContain('disabled')
  })

  it('applies default scale (1)', () => {
    const wrapper = factory()

    const itemTip = wrapper.findComponent({ name: 'ItemTip' })
    expect(itemTip.attributes('style')).toContain('scale(1)')
  })

  it('applies custom scale', () => {
    const wrapper = factory({ scale: 1.5 })

    const itemTip = wrapper.findComponent({ name: 'ItemTip' })
    expect(itemTip.attributes('style')).toContain('scale(1.5)')
  })

  it('passes tip and position to ItemTip', () => {
    const wrapper = factory({
      tip: 'Tooltip text',
      position: 'top',
    })

    const itemTip = wrapper.findComponent({ name: 'ItemTip' })

    expect(itemTip.props('text')).toBe('Tooltip text')
    expect(itemTip.props('position')).toBe('top')
  })

  it('wraps button inside ItemTip', () => {
    const wrapper = factory()

    const itemTip = wrapper.findComponent({ name: 'ItemTip' })
    const button = itemTip.find('button')

    expect(button.exists()).toBe(true)
  })
})
