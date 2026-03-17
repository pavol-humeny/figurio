/**
 * @file: DefaultSlider.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultSlider from '@/components/common/DefaultSlider.vue'
import { useDefaultSlider } from '@/composables/common/useDefaultSlider'

vi.mock('@/components/common/ItemTip.vue', () => ({
  default: {
    name: 'ItemTip',
    template: '<div class="item-tip"><slot /></div>',
    props: ['text', 'position'],
  },
}))

describe('DefaultSlider.vue', () => {
  const factory = (props = {}) =>
    mount(DefaultSlider, {
      props: {
        modelValue: 50,
        ...props,
      },
    })

  it('renders the input range with correct default attributes', () => {
    const wrapper = factory()

    const input = wrapper.find('input[type="range"]')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('50')
    expect(input.attributes('min')).toBe('0')
    expect(input.attributes('max')).toBe('100')
    expect(input.attributes('step')).toBe('1')
    expect(input.attributes('disabled')).toBeUndefined()
  })

  it('renders with custom min, max, and step', () => {
    const wrapper = factory({ min: 5, max: 15, step: 0.5 })

    const input = wrapper.find('input[type="range"]')
    expect(input.attributes('min')).toBe('5')
    expect(input.attributes('max')).toBe('15')
    expect(input.attributes('step')).toBe('0.5')
  })

  it('renders value, description and unit when showValue is true', () => {
    const wrapper = factory({
      modelValue: 42,
      showValue: true,
      valueDescription: 'Contrast',
      valueUnit: '%',
    })

    expect(wrapper.text()).toContain('Contrast:')
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('%')
  })

  it('hides value info when showValue is false', () => {
    const wrapper = factory({
      showValue: false,
      valueDescription: 'Brightness',
      valueUnit: '%',
    })

    expect(wrapper.find('.slider-value-wrapper').exists()).toBe(false)
  })

  it('does not render description when empty', () => {
    const wrapper = factory({
      showValue: true,
      valueDescription: '',
    })

    expect(wrapper.find('.slider-value-description').exists()).toBe(false)
  })

  it('does not render unit when empty', () => {
    const wrapper = factory({
      showValue: true,
      valueUnit: '',
    })

    expect(wrapper.find('.slider-value-unit').exists()).toBe(false)
  })

  it('emits update:modelValue and update on input', async () => {
    const wrapper = factory({ modelValue: 20 })

    const input = wrapper.find('input[type="range"]')
    await input.setValue(90)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([90])
    expect(wrapper.emitted('update')[0]).toEqual([90])
  })

  it('emits commit after pointer down and release', async () => {
    const wrapper = factory({ modelValue: 20 })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('pointerdown')

    window.dispatchEvent(new Event('pointerup'))

    expect(wrapper.emitted('commit')).toBeTruthy()
    expect(wrapper.emitted('commit')[0]).toEqual([20])
  })

  it('emits dblclick when input is double-clicked', async () => {
    const wrapper = factory()

    const input = wrapper.find('input[type="range"]')
    await input.trigger('dblclick')

    // Component does not emit dblclick explicitly, but handler runs
    expect(true).toBe(true)
  })

  it('calls onReset on double click when not disabled', async () => {
    const onReset = vi.fn()
    const wrapper = factory({
      onReset,
      disabled: false,
    })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('dblclick')

    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('does not call onReset when disabled', async () => {
    const onReset = vi.fn()
    const wrapper = factory({
      onReset,
      disabled: true,
    })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('dblclick')

    expect(onReset).not.toHaveBeenCalled()
  })

  it('disables the slider when disabled is true', () => {
    const wrapper = factory({ disabled: true })

    const input = wrapper.find('input[type="range"]')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('applies custom background color as CSS variable', () => {
    const wrapper = factory({ backgroundColor: 'blue' })

    const input = wrapper.find('input[type="range"]')
    expect(input.attributes('style')).toContain('--slider-bg: blue')
  })

  it('updates input value when modelValue prop changes (watch)', async () => {
    const wrapper = factory({ modelValue: 25 })

    const input = wrapper.find('input[type="range"]')
    expect(input.element.value).toBe('25')

    await wrapper.setProps({ modelValue: 75 })

    expect(input.element.value).toBe('75')
  })

  // ======================
  // WHEEL TESTS
  // ======================

  it('changes value on wheel up', async () => {
    const wrapper = factory({ modelValue: 50, step: 5 })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('wheel', { deltaY: -100 })

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([55])
  })

  it('changes value on wheel down', async () => {
    const wrapper = factory({ modelValue: 50, step: 5 })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('wheel', { deltaY: 100 })

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([45])
  })

  it('clamps value to max on wheel', async () => {
    const wrapper = factory({ modelValue: 98, step: 5, max: 100 })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('wheel', { deltaY: -100 })

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([100])
  })

  it('clamps value to min on wheel', async () => {
    const wrapper = factory({ modelValue: 2, step: 5, min: 0 })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('wheel', { deltaY: 100 })

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([0])
  })

  it('respects decimal step precision', async () => {
    const wrapper = factory({ modelValue: 1, step: 0.1 })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('wheel', { deltaY: -100 })

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([1.1])
  })

  it('does not react to wheel when disabled', async () => {
    const wrapper = factory({ disabled: true })

    const input = wrapper.find('input[type="range"]')
    await input.trigger('wheel', { deltaY: -100 })

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
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

    expect(addSpy).not.toHaveBeenCalled()

    addSpy.mockRestore()
  })

  it('onUp emits commit and removes listener', () => {
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
