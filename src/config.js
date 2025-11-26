// src/config.js
// Centralized configuration for environment variables and constants

// For Vite projects, use import.meta.env
// Updated 2025-07-31: Configure for local development with PostgreSQL primary and SQLite fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get API URL - use this in all components
export const getApiUrl = (endpoint = '') => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};



// API Endpoints - Build complete URLs
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/accountsapp/login-simple`,
  SIGNUP: `${API_BASE_URL}/accountsapp/signup`,
  LOGOUT: `${API_BASE_URL}/accountsapp/logout`,
  VERIFY_EMAIL: `${API_BASE_URL}/accountsapp/verify-email`,
  FORGOT_PASSWORD: `${API_BASE_URL}/accountsapp/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/accountsapp/reset-password`,

  // Jobs
  JOBS_ALL: `${API_BASE_URL}/jobs/all/`,
  JOBS_CREATE: `${API_BASE_URL}/jobs/create/`,
  JOBS_DETAIL: (id) => `${API_BASE_URL}/jobs/${id}/`,
  JOBS_APPLY: (id) => `${API_BASE_URL}/jobs/${id}/apply/`,
  JOBS_SAVE: `${API_BASE_URL}/jobs/save/`,
  JOBS_SAVED: `${API_BASE_URL}/jobs/saved/`,

  // Users
  ALL_USERS: `${API_BASE_URL}/jobs/all-users/`,
  USER_PROFILE: `${API_BASE_URL}/accountsapp/profile/`,
  UPDATE_PROFILE: `${API_BASE_URL}/accountsapp/profile/update/`,

  // Applications
  APPLICATIONS: `${API_BASE_URL}/jobs/applications/`,
  APPLICATION_STATUS: (id) => `${API_BASE_URL}/jobs/applications/${id}/status/`,

  // Payments
  PAYMENTS: `${API_BASE_URL}/payment/`,
  PAYMENT_METHODS: `${API_BASE_URL}/payment/methods/`,

  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications/`,
  MARK_READ: (id) => `${API_BASE_URL}/notifications/${id}/read/`,
};

// Add other constants here as needed
export const NOTIFY = {
  SHIFT_STARTED: "Shift started successfully!",
  SHIFT_ENDED: "Shift ended successfully!",
  JOB_SAVED: "Job saved successfully!",
  JOB_APPLIED: "Job Applied successfully!",
  APPLICANT_ARRIVAL: "I'm the Job location!",
};

// Add more config values as your app grows
