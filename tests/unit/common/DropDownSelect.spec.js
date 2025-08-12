// DropdownSelect.spec.js – comprehensive unit tests for DropdownSelectWithIcon component
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DropdownSelect from '@/components/common/DropdownSelect.vue'

const defaultOptions = [
  { label: 'First', value: 'first' },
  { label: 'Second', value: 'second' },
]

const factory = (props = {}) => {
  return mount(DropdownSelect, {
    props: {
      modelValue: 'first',
      options: defaultOptions,
      ...props,
    },
  })
}

describe('DropdownSelectWithIcon.vue', () => {
  it('renders options properly', () => {
    const wrapper = factory()
    const options = wrapper.findAll('option')
    expect(options.length).toBe(2)
    expect(options[0].text()).toBe('First')
    expect(options[1].text()).toBe('Second')
  })

  it('binds initial modelValue correctly', () => {
    const wrapper = factory({ modelValue: 'second' })
    expect(wrapper.find('select').element.value).toBe('second')
  })

  it('emits update:modelValue and update on change', async () => {
    const wrapper = factory()
    await wrapper.find('select').setValue('second')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['second'])
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')[0]).toEqual(['second'])
  })

  it('calls onReset function on icon double click', async () => {
    const onResetMock = vi.fn()
    const wrapper = factory({ icon: 'IconTest', onReset: onResetMock })

    await wrapper.find('.input-icon-left').trigger('dblclick')
    expect(onResetMock).toHaveBeenCalled()
  })

  it('does not render icon if icon prop is empty', () => {
    const wrapper = factory({ icon: '' })
    expect(wrapper.find('.input-icon-left').exists()).toBe(false)
  })

  it('renders icon if icon prop is set', () => {
    const wrapper = factory({ icon: 'IconTest' })
    expect(wrapper.find('.input-icon-left').exists()).toBe(true)
  })

  it('renders dropdown arrow icon on the right', () => {
    const wrapper = factory()
    expect(wrapper.find('.input-icon-right').exists()).toBe(true)
  })

  it('disables the select input when disabled is true', () => {
    const wrapper = factory({ disabled: true })
    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })

  it('calls setValue exposed method correctly', async () => {
    const wrapper = factory()
    await wrapper.vm.setValue('second')
    expect(wrapper.find('select').element.value).toBe('second')
  })

  it('updates selectedValue when modelValue prop changes (watch)', async () => {
    const wrapper = factory({ modelValue: 'first' })
    expect(wrapper.vm.selectedValue).toBe('first')

    await wrapper.setProps({ modelValue: 'second' })
    expect(wrapper.vm.selectedValue).toBe('second')
  })
})
