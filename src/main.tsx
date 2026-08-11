import './index.css';
import { App } from './js/app.js';

// Expose App globally for inline onclick handlers if needed
(window as any).App = App;

let initialized = false;
function bootApp() {
  if (initialized) return;
  initialized = true;
  App.init();
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  bootApp();
} else {
  document.addEventListener("DOMContentLoaded", bootApp);
}

