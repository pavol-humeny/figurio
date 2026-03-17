import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { reactive, nextTick } from 'vue'

import ColorPicker from '@/components/common/ColorPicker.vue'

vi.mock('@vueuse/core', () => ({
  useEyeDropper: () => ({
    isSupported: true,
    open: vi.fn().mockResolvedValue({ sRGBHex: '#123456' }),
  }),
}))

let mockEditorStore

vi.mock('@/stores/editorStore', () => ({
  useEditorStore: () => mockEditorStore,
}))

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  fillRect: vi.fn(),
}))

describe('ColorPicker.vue', () => {
  beforeEach(() => {
    mockEditorStore = reactive({
      recentColors: ['#ff0000'],
      addRecentColor: vi.fn(),
      removeRecentColor: vi.fn(),
    })
  })

  const mountComponent = (props = {}) =>
    mount(ColorPicker, {
      props: {
        modelValue: '#ff0000',
        ...props,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          BaseIcon: true,
          ItemTip: { template: '<div><slot /></div>' },
          Teleport: true,
        },
        mocks: {
          $t: (key) => key,
        },
      },
    })

  it('renders with correct initial color', () => {
    const wrapper = mountComponent()

    const input = wrapper.find('input.hex-input-visible')
    expect(input.element.value).toBe('#ff0000')
  })

  it('emits update:modelValue on input change', async () => {
    const wrapper = mountComponent()

    const input = wrapper.find('input.hex-input-visible')

    await input.setValue('#00ff00')
    await input.trigger('input')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('reacts to modelValue prop change', async () => {
    const wrapper = mountComponent({
      modelValue: '#0000ff',
    })

    await wrapper.setProps({ modelValue: '#ff00ff' })
    await nextTick()

    expect(wrapper.vm.colorValue).toBe('#ff00ff')
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mountComponent({ disabled: true })

    const input = wrapper.find('input.hex-input-visible')
    expect(input.classes()).toContain('disabled')
  })

  it('setValue updates internal value', async () => {
    const wrapper = mountComponent({
      modelValue: '#000000',
    })

    await wrapper.vm.setValue('#111111')
    await nextTick()

    expect(wrapper.vm.colorValue).toBe('#111111')
  })

  it('toggle opens and closes picker', async () => {
    const wrapper = mountComponent()

    const preview = wrapper.find('.color-preview')
    expect(preview.exists()).toBe(true)

    await preview.trigger('click')
    expect(wrapper.vm.isVisible).toBe(true)

    await preview.trigger('click')
    expect(wrapper.vm.isVisible).toBe(false)
  })

  it('does not open when disabled', async () => {
    const wrapper = mountComponent({ disabled: true })

    const preview = wrapper.find('.color-preview')

    await preview.trigger('click')
    expect(wrapper.vm.isVisible).toBe(false)
  })

  it('selectRecentColor emits events', async () => {
    const wrapper = mountComponent()

    await wrapper.vm.selectRecentColor('#ff0000')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('pickColor uses eye dropper', async () => {
    const wrapper = mountComponent()

    await wrapper.vm.pickColor()

    expect(wrapper.vm.hexValue).toBe('#123456')
  })

  it('removeRecentColor calls store', async () => {
    const wrapper = mountComponent()

    await wrapper.vm.removeRecentColor('#ff0000')

    expect(mockEditorStore.removeRecentColor).toHaveBeenCalledWith('#ff0000')
  })
})
