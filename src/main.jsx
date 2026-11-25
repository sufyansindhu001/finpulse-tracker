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

// In this SSG-to-SPA architecture, static HTML inside #root is pre-rendered at build time
// to serve complete semantic markup, meta tags, and schema to Googlebot and web crawlers.
// On the client, routes are dynamically code-split with React.lazy; mounting cleanly via
// createRoot ensures reliable SPA lifecycle management without React #418 DOM tree reconciliation errors.
if (rootElement) {
  createRoot(rootElement).render(app);
}


