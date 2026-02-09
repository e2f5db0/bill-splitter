import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Pay from '../src/components/Pay'
import '@testing-library/jest-dom/extend-expect'

describe('<Pay />', () => {
  it('should display text', () => {
    render(
      <BrowserRouter>
        <Pay />
      </BrowserRouter>
    )
    expect(screen.getByText('Velat yhteensä:')).toBeVisible()
  })
})