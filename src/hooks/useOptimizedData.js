// src/hooks/useOptimizedData.js
// Phase 2.3: Optimized hooks for fetching user, payment, and review data

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { queryKeys } from '../utils/queryClient';

// ============================================================================
// USER & PROFILE HOOKS
// ============================================================================

/**
 * Hook to fetch user profile with optimized caching
 * Phase 2.3: Uses optimized /get-profile/{user_id}/ endpoint
 */
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: queryKeys.users.profileDetail(userId),
    queryFn: async () => {
      const response = await apiService.get(`/accountsapp/get-profile/${userId}/`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 120, // 2 hours
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch account details with optimized caching
 * Phase 2.3: Uses optimized /get-account-details/ endpoint
 */
export const useAccountDetails = (userId) => {
  return useQuery({
    queryKey: queryKeys.users.accountDetails(),
    queryFn: async () => {
      const response = await apiService.get(`/accountsapp/get-account-details?user_id=${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch all users with optimized caching
 * Phase 2.3: Uses optimized /jobs/all-users/ endpoint
 */
export const useAllUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: async () => {
      const response = await apiService.get('/jobs/all-users/');
      return response.data.users;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 120, // 2 hours
    refetchOnWindowFocus: false,
  });
};

// ============================================================================
// PAYMENT HOOKS
// ============================================================================

/**
 * Hook to fetch user payments with optimized caching
 * Phase 2.3: Uses optimized /users/{user_id}/payments/ endpoint
 */
export const useUserPayments = (userId) => {
  return useQuery({
    queryKey: queryKeys.payments.userPayments(userId),
    queryFn: async () => {
      const response = await apiService.get(`/users/${userId}/payments/`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch payment methods with optimized caching
 * Phase 2.3: Uses optimized /payment/methods/ endpoint
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: queryKeys.payments.methods(),
    queryFn: async () => {
      const response = await apiService.get('/payment/methods/');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 120, // 2 hours
    refetchOnWindowFocus: false,
  });
};

// ============================================================================
// REVIEW & RATING HOOKS
// ============================================================================

/**
 * Hook to fetch reviews for a user with optimized caching
 * Phase 2.3: Uses optimized /reviews/{user_id}/ endpoint
 */
export const useUserReviews = (userId) => {
  return useQuery({
    queryKey: queryKeys.reviews.userReviews(userId),
    queryFn: async () => {
      const response = await apiService.get(`/reviews/${userId}/`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch reviews by a reviewer with optimized caching
 * Phase 2.3: Uses optimized /ratings/reviewer_{user_id}/ endpoint
 */
export const useReviewerReviews = (userId) => {
  return useQuery({
    queryKey: queryKeys.reviews.reviewerReviews(userId),
    queryFn: async () => {
      const response = await apiService.get(`/ratings/reviewer_${userId}/`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
};

// ============================================================================
// APPLICATION HOOKS
// ============================================================================

/**
 * Hook to fetch applications with optimized caching
 * Phase 2.3: Uses optimized /jobs/applications/ endpoint
 */
export const useApplications = () => {
  return useQuery({
    queryKey: queryKeys.applications.all(),
    queryFn: async () => {
      const response = await apiService.get('/jobs/applications/');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// ============================================================================
// NOTIFICATION HOOKS
// ============================================================================

/**
 * Hook to fetch notifications with optimized caching
 * Phase 2.3: Uses optimized /notifications/ endpoint
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.all(),
    queryFn: async () => {
      const response = await apiService.get('/notifications/');
      return response.data;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export default {
  useUserProfile,
  useAccountDetails,
  useAllUsers,
  useUserPayments,
  usePaymentMethods,
  useUserReviews,
  useReviewerReviews,
  useApplications,
  useNotifications,
};

