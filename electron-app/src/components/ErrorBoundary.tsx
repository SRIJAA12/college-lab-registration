import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleRestart = async () => {
    // Use properly typed window.electronAPI (no casting needed)
    const electronAPI = window.electronAPI;
    if (electronAPI) {
      try {
        await electronAPI.restartApp();
      } catch (error) {
        console.error('Failed to restart app:', error);
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card shadow">
                  <div className="card-body text-center p-5">
                    <i className="fas fa-exclamation-triangle fa-4x text-warning mb-4"></i>
                    <h2 className="card-title text-dark mb-3">Application Error</h2>
                    <p className="text-muted mb-4">
                      The application encountered an unexpected error. This might be due to a 
                      network issue or a temporary problem.
                    </p>
                    
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                      <div className="alert alert-danger text-start mb-4">
                        <h6>Error Details:</h6>
                        <code>{this.state.error.message}</code>
                        {this.state.errorInfo && (
                          <details className="mt-2">
                            <summary>Stack Trace</summary>
                            <pre style={{ fontSize: '12px' }}>
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                    
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={this.handleReload}
                      >
                        <i className="fas fa-redo me-2"></i>
                        Reload Application
                      </button>
                      
                      {/* Use properly typed window.electronAPI (no casting needed) */}
                      {window.electronAPI && (
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={this.handleRestart}
                        >
                          <i className="fas fa-power-off me-2"></i>
                          Restart Application
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <small className="text-muted">
                        If the problem persists, please contact your system administrator.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
