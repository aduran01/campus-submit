import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/variables.css'
import './styles/global.css'
import { hashPassword } from './services/authService'

/**
 * Development convenience: expose the password-hashing helper on `window` so
 * the demo credentials in `src/config/credentials.ts` can be changed without
 * installing any extra tooling. Open the browser DevTools console and run:
 *
 *   await window.__hashPassword('your-new-password')
 *
 * then paste the resulting hex string into credentials.ts. `import.meta.env.DEV`
 * is statically replaced at build time, so this block — and the helper it
 * attaches — is stripped out of production builds entirely.
 */
if (import.meta.env.DEV) {
  ;(window as unknown as { __hashPassword: typeof hashPassword }).__hashPassword = hashPassword
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
