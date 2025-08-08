import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorPicker from '@/components/common/ColorPicker.vue'

describe('ColorPicker.vue', () => {
  it('renders with correct initial color', () => {
    const wrapper = mount(ColorPicker, {
      props: {
        modelValue: '#ff0000',
      },
    })
    const input = wrapper.find('input[type="color"]')
    expect(input.element.value).toBe('#ff0000')
  })

  it('emits update:modelValue and update on input change', async () => {
    const wrapper = mount(ColorPicker, {
      props: {
        modelValue: '#ff0000',
      },
    })

    const input = wrapper.find('input[type="color"]')
    await input.setValue('#00ff00') // triggers v-model
    await input.trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['#00ff00'])
    expect(wrapper.emitted('update')[0]).toEqual(['#00ff00'])
  })

  it('reacts to modelValue prop change', async () => {
    const wrapper = mount(ColorPicker, {
      props: {
        modelValue: '#0000ff',
      },
    })

    await wrapper.setProps({ modelValue: '#ff00ff' })
    const input = wrapper.find('input[type="color"]')
    expect(input.element.value).toBe('#ff00ff')
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(ColorPicker, {
      props: {
        modelValue: '#ffffff',
        disabled: true,
      },
    })

    const input = wrapper.find('input[type="color"]')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('setValue() updates internal color value', async () => {
    const wrapper = mount(ColorPicker, {
      props: {
        modelValue: '#000000',
      },
    })

    await wrapper.vm.setValue('#111111')
    const input = wrapper.find('input[type="color"]')
    expect(input.element.value).toBe('#111111')
  })
})
