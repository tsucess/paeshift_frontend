// src/utils/queryClient.js
// Phase 2.3: React Query configuration with optimized caching

import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure QueryClient with optimized caching settings
 * Phase 2.3: Implements caching strategy for different endpoint types
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: How long data is considered fresh
        staleTime: 1000 * 60 * 5, // 5 minutes for most queries
        
        // Cache time: How long unused data is kept in cache
        cacheTime: 1000 * 60 * 10, // 10 minutes
        
        // Retry failed requests once
        retry: 1,
        
        // Don't refetch on window focus
        refetchOnWindowFocus: false,
        
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
        
        // Don't refetch on reconnect if data is fresh
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  });
};

/**
 * Query key factory for consistent cache key generation
 * Phase 2.3: Organized query keys for different endpoints
 */
export const queryKeys = {
  // Jobs
  jobs: {
    all: () => ['jobs', 'all'],
    detail: (id) => ['jobs', 'detail', id],
    saved: () => ['jobs', 'saved'],
    clientJobs: (userId) => ['jobs', 'client', userId],
    bestApplicants: (jobId) => ['jobs', jobId, 'best-applicants'],
  },
  
  // Users & Profiles
  users: {
    all: () => ['users', 'all'],
    profile: () => ['users', 'profile'],
    profileDetail: (userId) => ['users', 'profile', userId],
    accountDetails: () => ['users', 'account-details'],
  },
  
  // Payments
  payments: {
    all: () => ['payments', 'all'],
    userPayments: (userId) => ['payments', 'user', userId],
    methods: () => ['payments', 'methods'],
  },
  
  // Reviews & Ratings
  reviews: {
    all: () => ['reviews', 'all'],
    userReviews: (userId) => ['reviews', 'user', userId],
    reviewerReviews: (userId) => ['reviews', 'reviewer', userId],
  },
  
  // Applications
  applications: {
    all: () => ['applications', 'all'],
    jobApplications: (jobId) => ['applications', 'job', jobId],
  },
  
  // Notifications
  notifications: {
    all: () => ['notifications', 'all'],
  },
};

/**
 * Cache invalidation strategies
 * Phase 2.3: Functions to invalidate specific cache entries
 */
export const cacheInvalidation = {
  // Invalidate all jobs cache
  invalidateAllJobs: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
  },
  
  // Invalidate specific job detail
  invalidateJobDetail: (queryClient, jobId) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
  },
  
  // Invalidate user profile
  invalidateProfile: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
  },
  
  // Invalidate payments
  invalidatePayments: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all() });
  },
  
  // Invalidate reviews
  invalidateReviews: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() });
  },
  
  // Invalidate all cache
  invalidateAll: (queryClient) => {
    queryClient.invalidateQueries();
  },
};

/**
 * LocalStorage caching utilities
 * Phase 2.3: Persistent caching for user data
 */
export const localStorageCache = {
  // Cache keys
  KEYS: {
    USER_PROFILE: 'paeshift_user_profile',
    USER_PREFERENCES: 'paeshift_user_preferences',
    SAVED_JOBS: 'paeshift_saved_jobs',
    RECENT_SEARCHES: 'paeshift_recent_searches',
  },
  
  // Set cache with TTL
  set: (key, value, ttlMinutes = 60) => {
    const data = {
      value,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  // Get cache if not expired
  get: (key) => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    try {
      const parsed = JSON.parse(data);
      const isExpired = Date.now() - parsed.timestamp > parsed.ttl;
      
      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsed.value;
    } catch (error) {
      console.error('Error parsing cache:', error);
      localStorage.removeItem(key);
      return null;
    }
  },
  
  // Remove cache
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  // Clear all cache
  clear: () => {
    Object.values(localStorageCache.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

export default createQueryClient;

