import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AddDues from '../src/components/AddDues'
import '@testing-library/jest-dom/extend-expect'

describe('<AddDues />', () => {
  it('should display text', () => {
    render(
      <BrowserRouter>
        <AddDues />
      </BrowserRouter>
    )
    expect(screen.getByText('Pyydä')).toBeVisible()
  })
})
