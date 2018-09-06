import React from 'react'
import { render } from 'react-testing-library'
import { fireEvent } from 'react-testing-library'
import Login from '../Login'

describe('<Login/> component', () => {
  test('renders inputs and labels', () => {
    const { getByLabelText, getByPlaceholderText } = render(<Login />)
    const emailNode = getByLabelText('Email')
    const pwNode = getByLabelText('Password')
    expect(emailNode).toBeInTheDocument()
    expect(pwNode).toBeInTheDocument()

    const emailByPlaceholder = getByPlaceholderText('Email')
    const pwByPlaceholder = getByPlaceholderText('Password')

    expect(emailByPlaceholder).toBeInTheDocument()
    expect(emailNode).toBe(emailByPlaceholder)
    expect(pwByPlaceholder).toBeInTheDocument()
    expect(pwNode).toBe(pwByPlaceholder)
  })

  test('submits email and password', () => {
    const { getByLabelText, getByText } = render(<Login />)
    const emailNode = getByLabelText('Email')
    const pwNode = getByLabelText('Password')

    emailNode.textContent = 'fire@google.com'
    pwNode.textContent = '123456'

    const submit = getByText('Log In')
    expect(submit).toBeInTheDocument()

    fireEvent(
      submit,
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    )
  })
})
