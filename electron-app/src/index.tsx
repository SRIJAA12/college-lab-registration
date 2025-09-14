import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Error boundary for the entire application
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h3>Something went wrong</h3>
            <p className="text-muted">The application encountered an error and needs to be restarted.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);

// Log application start - ✅ FIXED: Use properly typed window.electronAPI
console.log('College Lab Registration System started');
console.log('Environment:', process.env.NODE_ENV);
console.log('Electron API available:', !!window.electronAPI); // ✅ No more casting needed!

// Additional system information logging if in development
if (process.env.NODE_ENV === 'development' && window.electronAPI) {
  console.log('Development mode - additional system info:');
  console.log('Platform:', window.electronAPI.platform);
  console.log('Is Electron:', window.electronAPI.isElectron);
  console.log('Is Dev:', window.electronAPI.isDev);
}
