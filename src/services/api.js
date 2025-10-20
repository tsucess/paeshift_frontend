// src/services/api.js
// Centralized API service for making HTTP requests
// Phase 2.3: Enhanced with performance monitoring and caching

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config.js';

// ============================================================================
// PERFORMANCE MONITORING & CACHING UTILITIES (Phase 2.3)
// ============================================================================

// Performance metrics tracking
const performanceMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  slowRequests: [],
  averageResponseTime: 0,
  totalResponseTime: 0,
};

// Request cache for deduplication
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

// Performance monitoring function
const trackPerformance = (url, duration, isCacheHit = false) => {
  performanceMetrics.totalRequests++;
  performanceMetrics.totalResponseTime += duration;
  performanceMetrics.averageResponseTime = performanceMetrics.totalResponseTime / performanceMetrics.totalRequests;

  if (isCacheHit) {
    performanceMetrics.cacheHits++;
  } else {
    performanceMetrics.cacheMisses++;
  }

  // Track slow requests (>500ms)
  if (duration > 500) {
    performanceMetrics.slowRequests.push({
      url,
      duration,
      timestamp: new Date().toISOString(),
    });
    console.warn(`⚠️ Slow API request: ${url} took ${duration.toFixed(2)}ms`);
  }

  // Log performance metrics every 10 requests
  if (performanceMetrics.totalRequests % 10 === 0) {
    const cacheHitRate = ((performanceMetrics.cacheHits / performanceMetrics.totalRequests) * 100).toFixed(2);
    console.log(`📊 Performance Metrics: Avg Response: ${performanceMetrics.averageResponseTime.toFixed(2)}ms, Cache Hit Rate: ${cacheHitRate}%`);
  }
};

// Get performance metrics
export const getPerformanceMetrics = () => ({
  ...performanceMetrics,
  cacheHitRate: ((performanceMetrics.cacheHits / performanceMetrics.totalRequests) * 100).toFixed(2),
});

// Clear performance metrics
export const clearPerformanceMetrics = () => {
  performanceMetrics.totalRequests = 0;
  performanceMetrics.cacheHits = 0;
  performanceMetrics.cacheMisses = 0;
  performanceMetrics.slowRequests = [];
  performanceMetrics.averageResponseTime = 0;
  performanceMetrics.totalResponseTime = 0;
};

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and performance monitoring (Phase 2.3)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    // const token = localStorage.getItem('paeshift_auth');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Phase 2.3: Add performance monitoring
    config.metadata = { startTime: performance.now() };

    // Phase 2.3: Check request cache for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}`;
      const cachedData = requestCache.get(cacheKey);

      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        // Return cached data without making the request
        config.cached = true;
        config.cachedData = cachedData.data;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Response interceptor to handle common errors, token refresh, and performance tracking (Phase 2.3)
apiClient.interceptors.response.use(
  (response) => {
    // Phase 2.3: Track performance metrics
    if (response.config.metadata) {
      const duration = performance.now() - response.config.metadata.startTime;
      const isCacheHit = response.config.cached || false;
      trackPerformance(response.config.url, duration, isCacheHit);

      // Cache successful GET responses
      if (response.config.method === 'get' && response.status === 200) {
        const cacheKey = `${response.config.url}`;
        requestCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
      }
    }

    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle token expiration with refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        // Try to refresh the token
        return axios.post(`${API_BASE_URL}/accountsapp/token/refresh/`, {
          refresh: refreshToken
        })
          .then(response => {
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
            originalRequest.headers.Authorization = `Bearer ${access}`;
            processQueue(null, access);
            return apiClient(originalRequest);
          })
          .catch(err => {
            processQueue(err, null);
            // If refresh fails, clear storage and redirect to login
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/signin';
            return Promise.reject(err);
          });
      } else {
        // No refresh token available, clear storage and redirect to login
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/signin';
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      // Check if it's an authentication error vs business logic error
      const errorDetail = error.response?.data?.detail || '';

      // Only log out for actual authentication errors, not business logic errors
      const isAuthError = errorDetail.toLowerCase().includes('token') ||
                         errorDetail.toLowerCase().includes('authentication') ||
                         errorDetail === 'Authentication credentials were not provided.' ||
                         errorDetail === 'Unauthorized' ||  // Generic unauthorized without context
                         !errorDetail; // Empty detail usually means auth failure

      // Don't log out for specific business logic errors
      const isBusinessLogicError = errorDetail.includes('Only the job client can') ||
                                  errorDetail.includes('Cannot start shift') ||
                                  errorDetail.includes('No applicants have been accepted');

      // Don't log out for business logic errors like "Only the job client can start the shift"
      if (isAuthError && !isBusinessLogicError) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Generic HTTP methods
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),

  // Authentication
  login: (credentials) => apiClient.post('/accountsapp/login-simple', credentials),
  signup: (userData) => apiClient.post('/accountsapp/signup', userData),
  logout: () => apiClient.post('/accountsapp/logout'),
  verifyEmail: (data) => apiClient.post('/accountsapp/verify-email', data),
  forgotPassword: (email) => apiClient.post('/accountsapp/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/accountsapp/reset-password', data),

  // Jobs
  getAllJobs: () => apiClient.get('/jobs/all/'),
  createJob: (jobData) => apiClient.post('/jobs/create/', jobData),
  getJobDetail: (id) => apiClient.get(`/jobs/${id}/`),
  applyToJob: (id, applicationData) => apiClient.post(`/jobs/${id}/apply/`, applicationData),
  saveJob: (jobData) => apiClient.post('/jobs/save/', jobData),
  getSavedJobs: () => apiClient.get('/jobs/saved/'),

  // Users
  getAllUsers: () => apiClient.get('/jobs/all-users/'),
  getUserProfile: () => apiClient.get('/accountsapp/profile/'),
  updateProfile: (profileData) => apiClient.put('/accountsapp/profile/update/', profileData),

  // Applications
  getApplications: () => apiClient.get('/jobs/applications/'),
  updateApplicationStatus: (id, status) => apiClient.patch(`/jobs/applications/${id}/status/`, { status }),

  // Payments
  getPayments: () => apiClient.get('/payment/'),
  getPaymentMethods: () => apiClient.get('/payment/methods/'),

  // Notifications
  getNotifications: () => apiClient.get('/notifications/'),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read/`),

  // Generic methods for custom requests
  get: (url) => apiClient.get(url),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url) => apiClient.delete(url),

  // Phase 2.3: Cache management functions
  clearCache: () => requestCache.clear(),
  invalidateCache: (pattern) => {
    if (!pattern) {
      requestCache.clear();
      return;
    }
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
      }
    }
  },
  getCacheSize: () => requestCache.size,
  getPerformanceMetrics,
  clearPerformanceMetrics,
};

export default apiService;
