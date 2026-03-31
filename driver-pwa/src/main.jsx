import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Skip service worker in mobile builds — Capacitor WebView doesn't support it
if (import.meta.env.MODE !== 'mobile') {
  registerSW({
    onNeedRefresh() { console.log('New content available, please refresh.') },
    onOfflineReady() { console.log('App ready to work offline') },
  });
}

createRoot(document.getElementById('root')).render(<App />)
