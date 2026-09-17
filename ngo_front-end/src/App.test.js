import { render, screen } from '@testing-library/react'
import App from './App'
import ContextAppProvider from './ContextAPI'

jest.mock('axios', () => ({
  create: () => ({ interceptors: { request: { use: jest.fn() } } }),
}))

test('renders the water restoration homepage', () => {
  window.scrollTo = jest.fn()
  const { unmount } = render(
    <ContextAppProvider>
      <App />
    </ContextAppProvider>
  )

  expect(screen.getByRole('heading', { name: /reviving water/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /support our mission/i })).toBeInTheDocument()
  unmount()
})
