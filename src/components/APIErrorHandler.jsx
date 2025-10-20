import React, { useState, useCallback } from 'react';

/**
 * API Error Handler Hook
 * 
 * Provides utilities for handling API errors with user-friendly messages
 */
export const useAPIErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((err, defaultMessage = 'An error occurred') => {
    console.error('API Error:', err);

    let errorMessage = defaultMessage;
    let errorCode = 'UNKNOWN_ERROR';
    let statusCode = 500;

    // Handle Axios error
    if (err.response) {
      statusCode = err.response.status;
      const data = err.response.data;

      // Extract error message from response
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.error) {
        errorMessage = data.error;
        errorCode = data.error_code || errorCode;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      }

      // Handle specific status codes
      if (statusCode === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        errorCode = 'AUTHENTICATION_ERROR';
        // Clear auth and redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/signin';
      } else if (statusCode === 403) {
        errorMessage = 'You do not have permission to perform this action.';
        errorCode = 'AUTHORIZATION_ERROR';
      } else if (statusCode === 404) {
        errorMessage = 'The requested resource was not found.';
        errorCode = 'NOT_FOUND';
      } else if (statusCode === 409) {
        errorMessage = 'This resource already exists or there is a conflict.';
        errorCode = 'CONFLICT_ERROR';
      } else if (statusCode === 429) {
        errorMessage = 'Too many requests. Please try again later.';
        errorCode = 'RATE_LIMIT_ERROR';
      } else if (statusCode >= 500) {
        errorMessage = 'Server error. Please try again later.';
        errorCode = 'SERVER_ERROR';
      }
    } else if (err.request) {
      errorMessage = 'No response from server. Please check your connection.';
      errorCode = 'NETWORK_ERROR';
    } else if (err.message) {
      errorMessage = err.message;
    }

    setError({
      message: errorMessage,
      code: errorCode,
      statusCode,
      originalError: err,
    });

    return {
      message: errorMessage,
      code: errorCode,
      statusCode,
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isLoading,
    setIsLoading,
    handleError,
    clearError,
  };
};

/**
 * API Error Display Component
 * 
 * Displays error messages with appropriate styling and actions
 */
export const APIErrorDisplay = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  const getAlertClass = (statusCode) => {
    if (statusCode >= 500) return 'alert-danger';
    if (statusCode >= 400) return 'alert-warning';
    return 'alert-info';
  };

  const getIcon = (statusCode) => {
    if (statusCode >= 500) return '❌';
    if (statusCode >= 400) return '⚠️';
    return 'ℹ️';
  };

  return (
    <div className={`alert ${getAlertClass(error.statusCode)} alert-dismissible fade show`} role="alert">
      <div className="d-flex align-items-start">
        <span className="me-2" style={{ fontSize: '1.2rem' }}>
          {getIcon(error.statusCode)}
        </span>
        <div className="flex-grow-1">
          <h5 className="alert-heading">Error</h5>
          <p className="mb-0">{error.message}</p>
          {process.env.NODE_ENV === 'development' && error.code && (
            <small className="text-muted d-block mt-1">
              Code: {error.code} | Status: {error.statusCode}
            </small>
          )}
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={onDismiss}
          aria-label="Close"
        />
      </div>
      {onRetry && (
        <div className="mt-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onRetry}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * API Error Toast Component
 * 
 * Displays error as a toast notification
 */
export const APIErrorToast = ({ error, onClose }) => {
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onClose]);

  if (!error) return null;

  return (
    <div
      className="toast show position-fixed bottom-0 end-0 m-3"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast-header bg-danger text-white">
        <strong className="me-auto">Error</strong>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
          aria-label="Close"
        />
      </div>
      <div className="toast-body">
        {error.message}
      </div>
    </div>
  );
};

/**
 * Async API Call Wrapper
 * 
 * Wraps API calls with error handling and loading state
 */
export const withAPIErrorHandling = async (apiCall, errorHandler) => {
  try {
    errorHandler.setIsLoading(true);
    errorHandler.clearError();
    const result = await apiCall();
    errorHandler.setIsLoading(false);
    return result;
  } catch (err) {
    errorHandler.handleError(err);
    errorHandler.setIsLoading(false);
    throw err;
  }
};

export default useAPIErrorHandler;

