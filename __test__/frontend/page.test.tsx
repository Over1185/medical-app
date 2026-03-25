import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/page'

/**
 * Verifica el render base del dashboard principal.
 */
test('Page', () => {
  render(<Page />)
  expect(screen.getByRole('heading', { level: 1, name: 'Citas Médicas' })).toBeDefined()
})