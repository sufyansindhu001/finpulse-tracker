import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
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

const rootElement = document.getElementById('root');
const app = (
  <StrictMode>
    <GlobalErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  </StrictMode>
);

if (rootElement && rootElement.hasChildNodes()) {
  try {
    hydrateRoot(rootElement, app);
  } catch (err) {
    console.warn('[Hydration] Hydration fallback to client render:', err);
    createRoot(rootElement).render(app);
  }
} else if (rootElement) {
  createRoot(rootElement).render(app);
}


