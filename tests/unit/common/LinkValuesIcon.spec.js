/**
 * @file: LinkValuesIcon.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LinkValuesIcon from '@/components/common/LinkValuesIcon.vue'

const mountIcon = (props = {}) =>
  mount(LinkValuesIcon, {
    props,
    global: {
      stubs: {
        BaseIcon: {
          name: 'BaseIcon',
          props: ['name', 'size', 'color', 'tip', 'position'],
          template: `<div class="base-icon" @click="$emit('click')"></div>`,
        },
      },
    },
  })

describe('LinkValuesIcon.vue', () => {
  it('renders linked icon when modelValue is true', () => {
    const wrapper = mountIcon({ modelValue: true })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.props('name')).toBe('IconLinkValues')
  })

  it('renders unlinked icon when modelValue is false', () => {
    const wrapper = mountIcon({ modelValue: false })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.props('name')).toBe('IconUnLinkValues')
  })

  it('emits update:modelValue with toggled value on click', async () => {
    const wrapper = mountIcon({ modelValue: false })

    await wrapper.findComponent({ name: 'BaseIcon' }).trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events[0]).toEqual([true])
  })

  it('toggles back on second click', async () => {
    const wrapper = mountIcon({ modelValue: false })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })

    await icon.trigger('click')
    await icon.trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events[1]).toEqual([false])
  })

  it('does not emit when disabled', async () => {
    const wrapper = mountIcon({
      modelValue: false,
      disabled: true,
    })

    await wrapper.findComponent({ name: 'BaseIcon' }).trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('applies disabled class', () => {
    const wrapper = mountIcon({
      modelValue: true,
      disabled: true,
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.classes()).toContain('disabled')
  })

  it('passes tipLinked when linked', () => {
    const wrapper = mountIcon({
      modelValue: true,
      tipLinked: 'Linked',
      tipUnlinked: 'Unlinked',
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.props('tip')).toBe('Linked')
  })

  it('passes tipUnlinked when not linked', () => {
    const wrapper = mountIcon({
      modelValue: false,
      tipLinked: 'Linked',
      tipUnlinked: 'Unlinked',
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.props('tip')).toBe('Unlinked')
  })

  it('reacts to external modelValue change', async () => {
    const wrapper = mountIcon({ modelValue: true })

    await wrapper.setProps({ modelValue: false })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })
    expect(icon.props('name')).toBe('IconUnLinkValues')
  })

  it('passes size, color and position props', () => {
    const wrapper = mountIcon({
      modelValue: true,
      size: 40,
      color: 'red',
      position: 'top',
    })

    const icon = wrapper.findComponent({ name: 'BaseIcon' })

    expect(icon.props('size')).toBe(40)
    expect(icon.props('color')).toBe('red')
    expect(icon.props('position')).toBe('top')
  })
})
