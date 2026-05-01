import { expect, it, describe, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import TextInput from './TextInput'


describe('TextInput component', () => {
  it('renders input with correct id, type, and label', () => {
    const { container } = render(
      <TextInput type="text" id="name" label="Name" />
    )

    expect(screen.getByText('Name')).toBeInTheDocument()

    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.id).toBe('name')
    expect(input.type).toBe('text')
  })

  it('updates internal value and calls onChange when uncontrolled', () => {
    const onChange = vi.fn()
    const { container } = render(
      <TextInput type="text" id="username" label="Username" onChange={onChange} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'john' } })

    expect(onChange).toHaveBeenCalledWith('john')
    expect(input.value).toBe('john')
  })

  it('keeps controlled input value when value prop is provided', () => {
    const onChange = vi.fn()
    const { container } = render(
      <TextInput type="text" id="controlled" label="Controlled" value="fixed" onChange={onChange} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('fixed')

    fireEvent.change(input, { target: { value: 'updated' } })
    expect(onChange).toHaveBeenCalledWith('updated')
    expect(input.value).toBe('fixed')
  })

  it('shows floating label when input is focused', () => {
    const { container } = render(
      <TextInput type="text" id="focus-test" label="Focus" />
    )

    const input = container.querySelector('input') as HTMLInputElement
    const label = container.querySelector('span') as HTMLSpanElement

    fireEvent.focus(input)
    expect(label.className).toContain('-top-3.5')
  })

  it('renders password toggle button for password type and changes input type when clicked', () => {
    const { container } = render(
      <TextInput type="password" id="password" label="Password" />
    )

    const input = container.querySelector('input') as HTMLInputElement
    const button = screen.getByRole('button')

    expect(input.type).toBe('password')
    fireEvent.click(button)
    expect(input.type).toBe('text')

    fireEvent.click(button)
    expect(input.type).toBe('password')
  })

  it('displays error text and applies error styling', () => {
    const { container } = render(
      <TextInput type="text" id="error" label="Email" error="Invalid email" />
    )

    expect(screen.getByText('Invalid email')).toBeInTheDocument()

    const wrapper = container.firstElementChild?.querySelector('div') as HTMLDivElement
    expect(wrapper.className).toContain('border-red-500')
  })
})