/**
 * @file: TextInput.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TextInput from '@/components/common/TextInput.vue'

const factory = (props = {}) => {
  setActivePinia(createPinia())

  return mount(TextInput, {
    props: {
      modelValue: '',
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

describe('TextInput.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the initial modelValue', () => {
    const wrapper = factory({ modelValue: 'hello' })
    expect(wrapper.find('input').element.value).toBe('hello')
  })

  it('emits update:modelValue and update on blur', async () => {
    const wrapper = factory({ modelValue: 'a' })
    const input = wrapper.find('input')

    await input.setValue('blurred')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['blurred'])
    expect(wrapper.emitted('update').at(-1)).toEqual(['blurred'])
  })

  it('emits update:modelValue and update on Enter key', async () => {
    const wrapper = factory({ modelValue: 'start' })
    const input = wrapper.find('input')

    await input.setValue('enter')
    await input.trigger('keydown.enter')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['enter'])
    expect(wrapper.emitted('update').at(-1)).toEqual(['enter'])
  })

  it('calls onEnter prop when Enter is pressed', async () => {
    const onEnter = vi.fn()
    const wrapper = factory({ modelValue: '', onEnter })
    const input = wrapper.find('input')

    await input.setValue('value')
    await input.trigger('keydown.enter')

    expect(onEnter).toHaveBeenCalledWith('value')
  })

  it('calls onBlur prop on blur', async () => {
    const onBlur = vi.fn()
    const wrapper = factory({ modelValue: '', onBlur })
    const input = wrapper.find('input')

    await input.setValue('value')
    await input.trigger('blur')

    expect(onBlur).toHaveBeenCalledWith('value')
  })

  it('emits on each input when updateOnChange is true', async () => {
    const wrapper = factory({ updateOnChange: true })
    const input = wrapper.find('input')

    await input.setValue('a')
    await input.setValue('ab')

    expect(wrapper.emitted('update:modelValue').length).toBe(2)
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['ab'])
  })

  it('does NOT emit on input when updateOnChange is false', async () => {
    const wrapper = factory({ updateOnChange: false })
    const input = wrapper.find('input')

    await input.setValue('typing')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('applies disabled attribute', () => {
    const wrapper = factory({ disabled: true })
    const input = wrapper.find('input')

    expect(input.attributes('disabled')).toBeDefined()
  })

  it('renders placeholder text', () => {
    const wrapper = factory({ placeholder: 'Type here…' })
    const input = wrapper.find('input')

    expect(input.attributes('placeholder')).toBe('Type here…')
  })

  it('respects maxLength attribute', () => {
    const wrapper = factory({ maxLength: 5 })
    const input = wrapper.find('input')

    expect(input.attributes('maxlength')).toBe('5')
  })

  it('updates value via setValue()', async () => {
    const wrapper = factory({ modelValue: 'init' })

    wrapper.vm.setValue('changed')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('input').element.value).toBe('changed')
  })

  it('focuses the input when focus() is called', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')

    const focusSpy = vi.spyOn(input.element, 'focus')

    wrapper.vm.focus()
    await wrapper.vm.$nextTick()

    expect(focusSpy).toHaveBeenCalled()
  })

  it('updates inputValue when modelValue prop changes', async () => {
    const wrapper = factory({ modelValue: 'first' })

    await wrapper.setProps({ modelValue: 'second' })

    expect(wrapper.find('input').element.value).toBe('second')
  })
})
