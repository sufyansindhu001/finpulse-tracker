import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'

// Auto-recover from stale deployment chunks across client sessions
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[Vite] Deployment chunk hash change detected; reloading latest build...', event);
    window.location.reload();
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  </StrictMode>,
)


