import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultButton from '@/components/common/DefaultButton.vue'

// Mock for ItemTip
vi.mock('@/components/ItemTip.vue', () => ({
  default: {
    name: 'ItemTip',
    template: '<div class="item-tip"><slot /></div>',
    props: ['text', 'position'],
  },
}))

describe('DefaultButton.vue', () => {
  it('renders button with provided text', () => {
    const wrapper = mount(DefaultButton, {
      props: {
        text: 'Save',
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Save')
  })

  it('adds "button-text" class when onlyText is true', () => {
    const wrapper = mount(DefaultButton, {
      props: {
        text: 'Text only',
        onlyText: true,
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('button-text')
    expect(button.classes()).not.toContain('button-default')
  })

  it('adds "button-default" class when onlyText is false', () => {
    const wrapper = mount(DefaultButton, {
      props: {
        text: 'Default button',
        onlyText: false,
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('button-default')
    expect(button.classes()).not.toContain('button-text')
  })

  it('adds "disabled" class when disabled prop is true', () => {
    const wrapper = mount(DefaultButton, {
      props: {
        text: 'Disabled',
        disabled: true,
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('disabled')
  })

  it('emits click event when button is clicked', async () => {
    const wrapper = mount(DefaultButton, {
      props: {
        text: 'Click',
      },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click').length).toBe(1)
  })

  it('passes tooltip props to ItemTip', () => {
    const wrapper = mount(DefaultButton, {
      props: {
        text: 'Help',
        tip: 'Tooltip text',
        position: 'top',
      },
    })

    const tipWrapper = wrapper.findComponent({ name: 'ItemTip' })
    expect(tipWrapper.exists()).toBe(true)
    expect(tipWrapper.props('text')).toBe('Tooltip text')
    expect(tipWrapper.props('position')).toBe('top')
  })
})
