import { createRoot } from 'react-dom/client'
/*  */import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';  // ENABLED - Required for Flashscreen styling
import 'bootstrap-icons/font/bootstrap-icons.css';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal);


import Flashscreen from './pages/Flashscreen.jsx';
import Welcome from './pages/Welcome.jsx';
import AppSignup from './pages/AppSignup.jsx';
import ClientSignup from './pages/ClientSignup.jsx';
import Signin from './pages/Signin.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import CreatePassword from './pages/CreatePassword.jsx';
import VerificationScreen from './pages/VerificationScreen.jsx';
import ThirdParty from './pages/ThirdParty.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';

import { GoogleOAuthProvider } from '@react-oauth/google';
import Jobs from './pages/Jobs.jsx';
import JobDetails from './pages/JobDetails.jsx';
import Settings from './pages/Settings.jsx';
import { RecoilRoot } from "recoil";
import { QueryClientProvider } from '@tanstack/react-query';
// Phase 2.3: Import optimized QueryClient configuration
import createQueryClient from './utils/queryClient.js';
import { performanceMonitor } from './utils/performanceMonitor.js';

// Phase 2.3: Create optimized QueryClient with caching configuration
const queryClient = createQueryClient();

// Phase 2.3: Record page load time when app starts
window.addEventListener('load', () => {
  performanceMonitor.recordPageLoadTime();
});

const router = createBrowserRouter([
  {
    // id:id++,
      path: "/jobdetails/:id",
      element:  <RecoilRoot><JobDetails /></RecoilRoot>
    },
  {
    // id:id++,
      path: "/jobs",
      element:  <RecoilRoot><Jobs /></RecoilRoot>
    },
  {
    // Handle trailing slash variant
      path: "/jobs/",
      element:  <RecoilRoot><Jobs /></RecoilRoot>
    },
  {
    // id:id++,
      path: "/dashboard",
      element:  <RecoilRoot><Dashboard /></RecoilRoot>,
     
    },
  {
    // id:id++,
      path: "/home",
      element:  <RecoilRoot><Home /> </RecoilRoot>,
     
    },
  {
    path: "/settings",
    element: <RecoilRoot><Settings /></RecoilRoot>

  },
  {
    path: "/signupwith/:role",
    element: <ThirdParty />

  },
  {
    path: "/verify",
    element: <VerificationScreen />

  },
  {
    path: "/createpassword",
    element: <CreatePassword />

  },
  {
    path: "/forgotpassword",
    element: <ForgotPassword />

  },
  {
    path: "/signin",
    element:  <RecoilRoot><Signin /></RecoilRoot>

  },
  {
    path: "/csignup/:role",
    element: <ClientSignup />

  },
  {
    path: "/asignup/:role",
    element: <AppSignup />

  },
  {
    path: "/welcome",
    element: <Welcome />

  },
  {
    path: "/",
    element: <Flashscreen />

  },
]);


createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </GoogleOAuthProvider>
)
