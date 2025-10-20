/**
 * Centralized logging utility
 * Provides controlled logging that can be disabled in production
 */

const isDevelopment = import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.DEV;
const isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';

class Logger {
  constructor() {
    this.isDev = isDevelopment;
    this.isDebug = isDebugEnabled;
  }

  /**
   * Log info messages (only in development)
   */
  info(...args) {
    if (this.isDev) {
      console.log('[INFO]', ...args);
    }
  }

  /**
   * Log debug messages (only when debug is enabled)
   */
  debug(...args) {
    if (this.isDev && this.isDebug) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Log warnings (always shown)
   */
  warn(...args) {
    console.warn('[WARN]', ...args);
  }

  /**
   * Log errors (always shown)
   */
  error(...args) {
    console.error('[ERROR]', ...args);
  }

  /**
   * Log API responses (only in development)
   */
  apiResponse(endpoint, response) {
    if (this.isDev) {
      console.group(`[API] ${endpoint}`);
      console.log('Response:', response);
      console.groupEnd();
    }
  }

  /**
   * Log API errors (always shown)
   */
  apiError(endpoint, error) {
    console.group(`[API ERROR] ${endpoint}`);
    console.error('Error:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.groupEnd();
  }

  /**
   * Log user actions (only in development)
   */
  userAction(action, data = {}) {
    if (this.isDev) {
      console.log(`[USER ACTION] ${action}`, data);
    }
  }

  /**
   * Performance logging
   */
  time(label) {
    if (this.isDev) {
      console.time(`[PERF] ${label}`);
    }
  }

  timeEnd(label) {
    if (this.isDev) {
      console.timeEnd(`[PERF] ${label}`);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
