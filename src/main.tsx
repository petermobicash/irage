import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeLanguage } from './utils/i18n';
import { CloudflareCookieFix } from './utils/cloudflareCookieFix';

// Initialize language on app start
initializeLanguage();

// Apply Cloudflare cookie fix on app initialization
if (typeof window !== 'undefined') {
  const cookieFix = new CloudflareCookieFix();
  // Fix cookies quietly in background
  cookieFix.fixCloudflareCookies();
}

// Enhanced loading detection for FOUC prevention
let appLoaded = false;

function hideLoadingScreen() {
  if (appLoaded) return;
  
  appLoaded = true;
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => loadingScreen.remove(), 500);
  }
}

// Wait for both React app and CSS to be ready
function waitForStylesheets() {
  return new Promise<void>((resolve) => {
    const checkStyles = () => {
      // Check if Tailwind CSS is loaded by testing computed styles
      const testElement = document.createElement('div');
      testElement.className = 'bg-blue-500';
      testElement.style.display = 'none';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const backgroundColor = computedStyle.backgroundColor;
      document.body.removeChild(testElement);
      
      // If background color is set (not transparent), CSS is loaded
      if (backgroundColor && backgroundColor !== 'transparent' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        resolve();
      } else {
        // Still waiting, check again in 50ms
        setTimeout(checkStyles, 50);
      }
    };
    
    // Start checking immediately
    checkStyles();
  });
}

// Initialize app loading process
async function initializeApp() {
  try {
    // Apply cookie fixes first
    const cookieFix = new CloudflareCookieFix();
    await cookieFix.fixCloudflareCookies();
    
    // Wait for styles to be ready before hiding loading screen
    await waitForStylesheets();
    
    // Also wait a bit for React to fully mount
    setTimeout(hideLoadingScreen, 800);
    
  } catch (error) {
    console.warn('App initialization had issues:', error);
    // Fallback: hide loading screen after 3 seconds regardless
    setTimeout(hideLoadingScreen, 3000);
  }
}

// Start the initialization
initializeApp();

// Create and render the React app
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
