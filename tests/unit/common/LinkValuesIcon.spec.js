/**
 * @file: LinkValuesIcon.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LinkValuesIcon from '@/components/common/LinkValuesIcon.vue'

describe('LinkValuesIcon.vue', () => {
  it('renders the linked icon when modelValue is true', () => {
    const wrapper = mount(LinkValuesIcon, {
      props: {
        modelValue: true,
      },
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.exists()).toBe(true)
    expect(icon.props('name')).toBe('IconLinkValues')
  })

  it('renders the unlinked icon when modelValue is false', () => {
    const wrapper = mount(LinkValuesIcon, {
      props: {
        modelValue: false,
      },
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.props('name')).toBe('IconUnLinkValues')
  })

  it('emits update:modelValue with toggled value on click', async () => {
    const wrapper = mount(LinkValuesIcon, {
      props: {
        modelValue: false,
      },
    })

    await wrapper.findComponent({ name: 'BaseIcon' }).trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([true])
  })

  it('does not emit when disabled is true', async () => {
    const wrapper = mount(LinkValuesIcon, {
      props: {
        modelValue: false,
        disabled: true,
      },
    })

    await wrapper.findComponent({ name: 'BaseIcon' }).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('applies disabled class when disabled', () => {
    const wrapper = mount(LinkValuesIcon, {
      props: {
        modelValue: true,
        disabled: true,
      },
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.classes()).toContain('disabled')
  })

  it('shows tipLinked when linked', () => {
    const wrapper = mount(LinkValuesIcon, {
      props: {
        modelValue: true,
        tipLinked: 'Linked',
        tipUnlinked: 'Unlinked',
      },
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.props('tip')).toBe('Linked')
  })

  it('shows tipUnlinked when not linked', () => {
    const wrapper = mount(LinkValuesIcon, {
      props: {
        modelValue: false,
        tipLinked: 'Linked',
        tipUnlinked: 'Unlinked',
      },
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.props('tip')).toBe('Unlinked')
  })

  it('reacts to modelValue change externally', async () => {
    const wrapper = mount(LinkValuesIcon, {
      props: {
        modelValue: true,
      },
    })

    await wrapper.setProps({ modelValue: false })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.props('name')).toBe('IconUnLinkValues')
  })
})
