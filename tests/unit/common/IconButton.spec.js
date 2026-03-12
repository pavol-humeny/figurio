/**
 * @file: IconButton.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconButton from '@/components/common/IconButton.vue'

describe('IconButton.vue', () => {
  it('renders BaseIcon with correct props', () => {
    const wrapper = mount(IconButton, {
      props: {
        icon: 'TestIcon',
        size: 24,
        color: '#123456',
      },
    })

    const baseIcon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(baseIcon.exists()).toBe(true)
    expect(baseIcon.props('name')).toBe('TestIcon')
    expect(baseIcon.props('size')).toBe(24)
    expect(baseIcon.props('color')).toBe('#123456')
  })

  it('emits click event on button click', async () => {
    const wrapper = mount(IconButton, {
      props: {
        icon: 'TestIcon',
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('applies active and disabled classes correctly', () => {
    const wrapper = mount(IconButton, {
      props: {
        icon: 'TestIcon',
        active: true,
        disabled: true,
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('active')
    expect(button.classes()).toContain('disabled')
  })

  it('applies default scale when not set', () => {
    const wrapper = mount(IconButton, {
      props: {
        icon: 'TestIcon',
      },
    })

    const tooltipWrapper = wrapper.findComponent({ name: 'ItemTip' })
    expect(tooltipWrapper.attributes('style')).toContain('scale(1)')
  })

  it('applies custom scale via style', () => {
    const wrapper = mount(IconButton, {
      props: {
        icon: 'TestIcon',
        scale: 1.5,
      },
    })

    const tooltipWrapper = wrapper.findComponent({ name: 'ItemTip' })
    expect(tooltipWrapper.attributes('style')).toContain('scale(1.5)')
  })

  it('passes tip and position to ItemTip', () => {
    const wrapper = mount(IconButton, {
      props: {
        icon: 'TestIcon',
        tip: 'Tooltip text',
        position: 'top',
      },
    })

    const itemTip = wrapper.findComponent({ name: 'ItemTip' })
    expect(itemTip.props('text')).toBe('Tooltip text')
    expect(itemTip.props('position')).toBe('top')
  })
})
