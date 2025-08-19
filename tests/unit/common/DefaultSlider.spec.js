import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultSlider from '@/components/common/DefaultSlider.vue'
import { useDefaultSlider } from '@/composables/common/useDefaultSlider'

describe('DefaultSlider.vue', () => {
  it('renders the input range with correct default attributes', () => {
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 50,
      },
    })

    const input = wrapper.find('input[type="range"]')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('50')
    expect(input.attributes('min')).toBe('0')
    expect(input.attributes('max')).toBe('100')
    expect(input.attributes('step')).toBe('1')
    expect(input.attributes('disabled')).toBeUndefined()
  })

  it('renders with custom min, max, and step', () => {
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 10,
        min: 5,
        max: 15,
        step: 0.5,
      },
    })

    const input = wrapper.find('input[type="range"]')
    expect(input.attributes('min')).toBe('5')
    expect(input.attributes('max')).toBe('15')
    expect(input.attributes('step')).toBe('0.5')
  })

  it('renders value, description and unit when showValue is true', () => {
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 42,
        showValue: true,
        valueDescription: 'Contrast',
        valueUnit: '%',
      },
    })

    expect(wrapper.text()).toContain('Contrast:')
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('%')
  })

  it('hides value info when showValue is false', () => {
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 25,
        showValue: false,
        valueDescription: 'Brightness',
        valueUnit: '%',
      },
    })

    expect(wrapper.find('.slider-value-wrapper').exists()).toBe(false)
  })

  it('emits update:modelValue and update on input', async () => {
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 20,
      },
    })

    const input = wrapper.find('input[type="range"]')
    await input.setValue(90)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([90])
    expect(wrapper.emitted('update')[0]).toEqual([90])
  })

  it('emits commit after pointer down and release', async () => {
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 20,
      },
    })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('pointerdown')

    await window.dispatchEvent(new MouseEvent('pointerup'))

    expect(wrapper.emitted('commit')).toBeTruthy()
    expect(wrapper.emitted('commit')[0]).toEqual([20])
  })

  it('emits dblclick when input is double-clicked', async () => {
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 30,
      },
    })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('dblclick')

    expect(wrapper.emitted('dblclick')).toBeTruthy()
  })

  it('disables the slider when disabled is true', () => {
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 15,
        disabled: true,
      },
    })

    const input = wrapper.find('input[type="range"]')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('applies custom background color as CSS variable', () => {
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 40,
        backgroundColor: 'blue',
      },
    })

    const input = wrapper.find('input[type="range"]')
    expect(input.attributes('style')).toContain('--slider-bg: blue')
  })

  it('updates input value when modelValue prop changes (watch)', async () => {
    const wrapper = mount(DefaultSlider, {
      props: { modelValue: 25 },
    })

    const input = wrapper.find('input[type="range"]')
    expect(input.element.value).toBe('25')

    await wrapper.setProps({ modelValue: 75 })

    expect(input.element.value).toBe('75')
  })

  it('calls onReset on double click when not disabled', async () => {
    const onReset = vi.fn()
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 50,
        onReset,
        disabled: false,
      },
    })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('dblclick')

    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('does not call onReset when disabled', async () => {
    const onReset = vi.fn()
    const wrapper = mount(DefaultSlider, {
      props: {
        modelValue: 50,
        onReset,
        disabled: true,
      },
    })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('dblclick')

    expect(onReset).not.toHaveBeenCalled()
  })
})

describe('useDefaultSlider composable', () => {
  let emitMock, slider

  beforeEach(() => {
    emitMock = vi.fn()
    slider = useDefaultSlider({ modelValue: 50, disabled: false, onReset: vi.fn() }, emitMock)
  })

  it('onPointerDown sets isAdjusting to true and adds pointerup listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    slider.isAdjusting.value = false

    slider.onPointerDown()

    expect(slider.isAdjusting.value).toBe(true)
    expect(addSpy).toHaveBeenCalledWith('pointerup', slider.onUp, true)
    addSpy.mockRestore()
  })

  it('onPointerDown does nothing if already adjusting', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    slider.isAdjusting.value = true

    slider.onPointerDown()

    expect(slider.isAdjusting.value).toBe(true)
    expect(addSpy).not.toHaveBeenCalled()
    addSpy.mockRestore()
  })

  it('onUp emits commit and removes pointerup listener if adjusting', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    slider.isAdjusting.value = true
    slider.currentValue.value = 75

    slider.onUp()

    expect(slider.isAdjusting.value).toBe(false)
    expect(emitMock).toHaveBeenCalledWith('commit', 75)
    expect(removeSpy).toHaveBeenCalledWith('pointerup', slider.onUp, true)
    removeSpy.mockRestore()
  })

  it('onUp does nothing if not adjusting', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    slider.isAdjusting.value = false

    slider.onUp()

    expect(slider.isAdjusting.value).toBe(false)
    expect(emitMock).not.toHaveBeenCalled()
    expect(removeSpy).not.toHaveBeenCalled()
    removeSpy.mockRestore()
  })

  it('onDoubleClick calls onReset when not disabled', () => {
    const onResetMock = vi.fn()
    slider = useDefaultSlider({ modelValue: 50, disabled: false, onReset: onResetMock }, emitMock)

    slider.onDoubleClick()

    expect(onResetMock).toHaveBeenCalledTimes(1)
  })

  it('onDoubleClick does nothing when disabled', () => {
    const onResetMock = vi.fn()
    slider = useDefaultSlider({ modelValue: 50, disabled: true, onReset: onResetMock }, emitMock)

    slider.onDoubleClick()

    expect(onResetMock).not.toHaveBeenCalled()
  })
})
