import { createRoot } from 'react-dom/client'
import React, { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';  // ENABLED - Required for Flashscreen styling
import 'bootstrap-icons/font/bootstrap-icons.css';

// Lazy load pages for code splitting
const Flashscreen = React.lazy(() => import('./pages/Flashscreen.jsx'));
const Welcome = React.lazy(() => import('./pages/Welcome.jsx'));
const AppSignup = React.lazy(() => import('./pages/AppSignup.jsx'));
const ClientSignup = React.lazy(() => import('./pages/ClientSignup.jsx'));
const Signin = React.lazy(() => import('./pages/Signin.jsx'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword.jsx'));
const CreatePassword = React.lazy(() => import('./pages/CreatePassword.jsx'));
const VerificationScreen = React.lazy(() => import('./pages/VerificationScreen.jsx'));
const ThirdParty = React.lazy(() => import('./pages/ThirdParty.jsx'));
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'));
const Home = React.lazy(() => import('./pages/Home.jsx'));
const Jobs = React.lazy(() => import('./pages/Jobs.jsx'));
const JobDetails = React.lazy(() => import('./pages/JobDetails.jsx'));
const Settings = React.lazy(() => import('./pages/Settings.jsx'));

import { GoogleOAuthProvider } from '@react-oauth/google';
import { RecoilRoot } from "recoil";
import { QueryClientProvider } from '@tanstack/react-query';
// Phase 2.3: Import optimized QueryClient configuration
import createQueryClient from './utils/queryClient.js';
import { performanceMonitor } from './utils/performanceMonitor.js';

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>Loading...</div>
  </div>
);

// Phase 2.3: Create optimized QueryClient with caching configuration
const queryClient = createQueryClient();

// Phase 2.3: Record page load time when app starts
window.addEventListener('load', () => {
  performanceMonitor.recordPageLoadTime();
});

const router = createBrowserRouter([
  {
    path: "/jobdetails/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RecoilRoot><JobDetails /></RecoilRoot>
      </Suspense>
    )
  },
  {
    path: "/jobs",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RecoilRoot><Jobs /></RecoilRoot>
      </Suspense>
    )
  },
  {
    path: "/jobs/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RecoilRoot><Jobs /></RecoilRoot>
      </Suspense>
    )
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RecoilRoot><Dashboard /></RecoilRoot>
      </Suspense>
    )
  },
  {
    path: "/home",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RecoilRoot><Home /></RecoilRoot>
      </Suspense>
    )
  },
  {
    path: "/settings",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RecoilRoot><Settings /></RecoilRoot>
      </Suspense>
    )
  },
  {
    path: "/signupwith/:role",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ThirdParty />
      </Suspense>
    )
  },
  {
    path: "/verify",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VerificationScreen />
      </Suspense>
    )
  },
  {
    path: "/createpassword",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CreatePassword />
      </Suspense>
    )
  },
  {
    path: "/forgotpassword",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ForgotPassword />
      </Suspense>
    )
  },
  {
    path: "/signin",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RecoilRoot><Signin /></RecoilRoot>
      </Suspense>
    )
  },
  {
    path: "/csignup/:role",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ClientSignup />
      </Suspense>
    )
  },
  {
    path: "/asignup/:role",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AppSignup />
      </Suspense>
    )
  },
  {
    path: "/welcome",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Welcome />
      </Suspense>
    )
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Flashscreen />
      </Suspense>
    )
  },
]);


createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </GoogleOAuthProvider>
)
