import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import DebugConsole from './components/DebugConsole.jsx'
import logger from './utils/logger.js'

// Initialize logger
logger.info('Application started', { timestamp: new Date().toISOString() })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <DebugConsole />
    </ErrorBoundary>
  </StrictMode>,
)

// Offline shell is available after the first successful production visit.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
