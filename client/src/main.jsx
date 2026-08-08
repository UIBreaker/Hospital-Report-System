import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initLoremShortcuts } from './utils/loremHelper'

// Enable 'lorem + Enter' dummy text generator across all forms & inputs
initLoremShortcuts()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

