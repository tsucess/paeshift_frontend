import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to external error tracking service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    
    const errorData = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('Error logged:', errorData);
    
    // Send to backend for logging
    try {
      fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(err => console.error('Failed to log error:', err));
    } catch (err) {
      console.error('Error logging failed:', err);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">⚠️ Something went wrong</h4>
                <p>
                  We're sorry, but something unexpected happened. 
                  Please try again or contact support if the problem persists.
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-3">
                    <details style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                      <summary>Error Details (Development Only)</summary>
                      <p className="mt-2">
                        <strong>Error:</strong> {this.state.error?.toString()}
                      </p>
                      <p>
                        <strong>Stack:</strong>
                        <br />
                        {this.state.error?.stack}
                      </p>
                      <p>
                        <strong>Component Stack:</strong>
                        <br />
                        {this.state.errorInfo?.componentStack}
                      </p>
                    </details>
                  </div>
                )}

                <div className="mt-3">
                  <button
                    className="btn btn-primary me-2"
                    onClick={this.handleReset}
                  >
                    Try Again
                  </button>
                  <button
                    className="btn btn-secondary me-2"
                    onClick={this.handleReload}
                  >
                    Reload Page
                  </button>
                  <a href="/" className="btn btn-outline-primary">
                    Go Home
                  </a>
                </div>

                {this.state.errorCount > 3 && (
                  <div className="alert alert-warning mt-3">
                    <small>
                      Multiple errors detected. Please clear your browser cache or 
                      contact support at support@paeshift.com
                    </small>
                  </div>
                )}
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

