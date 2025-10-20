// src/hooks/useOptimizedJobs.js
// Phase 2.3: Optimized hook for fetching jobs with caching

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { queryKeys } from '../utils/queryClient';

/**
 * Hook to fetch all jobs with optimized caching
 * Phase 2.3: Uses optimized /jobs/all/ endpoint
 */
export const useAllJobs = () => {
  return useQuery({
    queryKey: queryKeys.jobs.all(),
    queryFn: async () => {
      const response = await apiService.get('/jobs/all/');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch job details with optimized caching
 * Phase 2.3: Uses optimized /jobs/{id}/ endpoint with select_related
 */
export const useJobDetail = (jobId) => {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: async () => {
      const response = await apiService.get(`/jobs/${jobId}/`);
      return response.data;
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch client jobs with optimized caching
 * Phase 2.3: Uses optimized /clientjobs/{user_id}/ endpoint
 */
export const useClientJobs = (userId) => {
  return useQuery({
    queryKey: queryKeys.jobs.clientJobs(userId),
    queryFn: async () => {
      const response = await apiService.get(`/jobs/clients/clientjobs/${userId}/`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch saved jobs with optimized caching
 * Phase 2.3: Uses optimized /jobs/saved/ endpoint
 */
export const useSavedJobs = () => {
  return useQuery({
    queryKey: queryKeys.jobs.saved(),
    queryFn: async () => {
      const response = await apiService.get('/jobs/saved/');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch best applicants for a job with optimized caching
 * Phase 2.3: Uses optimized /jobs/{id}/best-applicants/ endpoint
 */
export const useBestApplicants = (jobId) => {
  return useQuery({
    queryKey: queryKeys.jobs.bestApplicants(jobId),
    queryFn: async () => {
      const response = await apiService.get(`/jobs/${jobId}/best-applicants/`);
      return response.data;
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export default {
  useAllJobs,
  useJobDetail,
  useClientJobs,
  useSavedJobs,
  useBestApplicants,
};

