import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInput from '@/components/common/TextInput.vue'

// Stub ItemTip
vi.mock('@/components/common/ItemTip.vue', () => ({
  default: {
    name: 'ItemTip',
    template: '<div class="item-tip"><slot /></div>',
    props: ['text', 'position'],
  },
}))

describe('TextInput.vue', () => {
  it('renders the initial modelValue', () => {
    const wrapper = mount(TextInput, { props: { modelValue: 'hello' } })
    const input = wrapper.find('input[type="text"]')
    expect(input.element.value).toBe('hello')
  })

  it('emits update:modelValue on blur', async () => {
    const wrapper = mount(TextInput, { props: { modelValue: 'a' } })
    const input = wrapper.find('input[type="text"]')

    await input.setValue('blurred')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['blurred'])
  })

  it('emits update:modelValue on Enter key', async () => {
    const wrapper = mount(TextInput, { props: { modelValue: 'start' } })
    const input = wrapper.find('input[type="text"]')

    await input.setValue('enter')
    await input.trigger('keydown.enter')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['enter'])
  })

  it('emits on each input when updateOnChange is true', async () => {
    const wrapper = mount(TextInput, {
      props: { modelValue: '', updateOnChange: true },
    })
    const input = wrapper.find('input[type="text"]')

    await input.setValue('a')
    await input.setValue('ab')

    // two emits from onInput
    expect(wrapper.emitted('update:modelValue').length).toBe(2)
    expect(wrapper.emitted('update:modelValue')[1]).toEqual(['ab'])
  })

  it('does NOT emit on input when updateOnChange is false', async () => {
    const wrapper = mount(TextInput, { props: { modelValue: '', updateOnChange: false } })
    const input = wrapper.find('input[type="text"]')

    await input.setValue('typing')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('applies disabled attribute and style', () => {
    const wrapper = mount(TextInput, { props: { modelValue: '', disabled: true } })
    const input = wrapper.find('input[type="text"]')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.classes()).toContain('text-input')
  })

  it('renders placeholder text', () => {
    const wrapper = mount(TextInput, {
      props: { modelValue: '', placeholder: 'Type here…' },
    })
    const input = wrapper.find('input[type="text"]')
    expect(input.attributes('placeholder')).toBe('Type here…')
  })

  it('exposes setValue and updates the displayed value', async () => {
    const wrapper = mount(TextInput, { props: { modelValue: 'init' } })
    wrapper.vm.setValue('changed')
    await wrapper.vm.$nextTick()

    const input = wrapper.find('input[type="text"]')
    expect(input.element.value).toBe('changed')
  })

  it('focuses the input when focus() is called', async () => {
    const wrapper = mount(TextInput, { props: { modelValue: '' } })
    const input = wrapper.find('input[type="text"]')

    // Spy on native focus method
    const focusSpy = vi.spyOn(input.element, 'focus')
    wrapper.vm.focus()
    await wrapper.vm.$nextTick()

    expect(focusSpy).toHaveBeenCalled()
  })

  it('updates internal inputValue when modelValue prop changes (watch)', async () => {
    const wrapper = mount(TextInput, { props: { modelValue: 'first' } })
    const input = wrapper.find('input[type="text"]')
    expect(input.element.value).toBe('first')

    // Change prop
    await wrapper.setProps({ modelValue: 'second' })

    expect(input.element.value).toBe('second')
  })
})
