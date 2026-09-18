import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './styles/variables.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* HashRouter (not BrowserRouter): this app is hosted on GitHub Pages, a
        static host with no server-side rewrites — HashRouter needs no
        server config and never 404s on a refreshed or shared deep link. */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
