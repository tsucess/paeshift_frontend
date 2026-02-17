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



// API Endpoints - Build complete URLs using getApiUrl helper to handle trailing slashes
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: getApiUrl('accountsapp/login-simple'),
  SIGNUP: getApiUrl('accountsapp/signup'),
  LOGOUT: getApiUrl('accountsapp/logout'),
  VERIFY_EMAIL: getApiUrl('accountsapp/verify-email'),
  FORGOT_PASSWORD: getApiUrl('accountsapp/forgot-password'),
  RESET_PASSWORD: getApiUrl('accountsapp/reset-password'),

  // Jobs
  JOBS_ALL: getApiUrl('jobs/all/'),
  JOBS_CREATE: getApiUrl('jobs/create/'),
  JOBS_DETAIL: (id) => getApiUrl(`jobs/${id}/`),
  JOBS_APPLY: (id) => getApiUrl(`jobs/${id}/apply/`),
  JOBS_SAVE: getApiUrl('jobs/save/'),
  JOBS_SAVED: getApiUrl('jobs/saved/'),

  // Users
  ALL_USERS: getApiUrl('jobs/all-users/'),
  USER_PROFILE: getApiUrl('accountsapp/profile/'),
  UPDATE_PROFILE: getApiUrl('accountsapp/profile/update/'),

  // Applications
  APPLICATIONS: getApiUrl('jobs/applications/'),
  APPLICATION_STATUS: (id) => getApiUrl(`jobs/applications/${id}/status/`),

  // Payments
  PAYMENTS: getApiUrl('payment/'),
  PAYMENT_METHODS: getApiUrl('payment/methods/'),

  // Notifications
  NOTIFICATIONS: getApiUrl('notifications/'),
  MARK_READ: (id) => getApiUrl(`notifications/${id}/read/`),
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
