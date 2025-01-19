import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { NotificationProvider } from './context/NotificationContext';
import { initializeAdmin } from './lib/initAdmin';

// Initialize admin user
initializeAdmin().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>,
)
