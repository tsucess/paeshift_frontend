# Paeshift Frontend - Comprehensive Codebase Study

## Project Overview
**Paeshift** is a React 18 + Vite-based web application for a gig economy platform connecting job applicants with clients. It supports two user roles: **Applicants** (job seekers) and **Clients** (job posters).

### Tech Stack
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.1
- **Routing**: React Router v7.0.2
- **State Management**: Recoil 0.7.7
- **Data Fetching**: TanStack React Query 5.81.2
- **HTTP Client**: Axios 1.7.9
- **UI Framework**: Bootstrap 5.3.7
- **Form Handling**: Formik 2.4.6 + Yup 1.6.1
- **Date Handling**: date-fns 4.1.0
- **Icons**: FontAwesome 6.7.2
- **Notifications**: React Toastify 11.0.2
- **Maps**: Google Maps API, react-google-maps
- **Authentication**: JWT (jwt-decode), Google OAuth

## Project Structure

```
paeshift-frontend/
├── src/
│   ├── assets/          # Images, CSS
│   ├── auth/            # Auth utilities (getCurrentUser, timeToSeconds, etc.)
│   ├── components/      # 40+ reusable components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components (Home, Dashboard, Jobs, Settings, etc.)
│   ├── services/        # API service layer
│   ├── store/           # State management (currently empty)
│   ├── utils/           # Utilities (queryClient, toastConfig, logger, etc.)
│   ├── config.js        # Centralized configuration
│   └── main.jsx         # App entry point
├── package.json
├── vite.config.js
└── index.html
```

## Core Architecture

### 1. Entry Point (main.jsx)
- Lazy-loads all pages for code splitting
- Wraps app with providers: GoogleOAuthProvider, QueryClientProvider, RouterProvider
- Implements performance monitoring on page load
- Uses Suspense with LoadingFallback for lazy components

### 2. Routing (React Router v7)
**Main Routes:**
- `/` - Flashscreen (splash screen)
- `/welcome` - Welcome page
- `/signin`, `/asignup/:role`, `/csignup/:role` - Auth pages
- `/home` - Applicant home (job listings)
- `/jobs` - Jobs page
- `/jobdetails/:id` - Job details
- `/dashboard` - Client dashboard
- `/settings` - User settings
- `/verify`, `/forgotpassword`, `/createpassword` - Auth flows

### 3. Configuration (config.js)
- **getApiBaseUrl()** - Runtime API base URL from env vars
- **getApiUrl(endpoint)** - Helper to build complete API URLs
- **API_ENDPOINTS** - Centralized endpoint definitions
- **NOTIFY** - Notification message constants

### 4. API Service Layer (services/api.js)
**Features:**
- Axios instance with interceptors
- Request/response caching (5-second duration)
- Performance metrics tracking
- Token refresh logic (401 handling)
- Auth token injection in headers
- Endpoint-specific timeout thresholds
- Cache hit rate monitoring

**Key Methods:**
- `apiService.get/post/put/patch/delete()`
- `apiService.login/signup/logout()`
- `apiService.getAllJobs/getJobDetail/applyToJob()`
- `apiService.getNotifications/markNotificationRead()`

### 5. State Management
**Recoil** (minimal usage - mostly localStorage)
**React Query** - Primary data fetching with caching
**localStorage** - Auth tokens, user_id, user_role, preferences

### 6. Query Client Configuration (utils/queryClient.js)
- **staleTime**: 5 minutes
- **cacheTime**: 10 minutes
- **retry**: 1 attempt
- **refetchOnWindowFocus**: false
- **refetchOnMount**: false
- Query key factory for consistent cache keys
- Cache invalidation strategies

## Component Architecture

### Page Components (src/pages/)
1. **Home.jsx** - Applicant home with job listings
2. **Dashboard.jsx** - Client dashboard for job management
3. **Jobs.jsx** - Jobs listing page
4. **JobDetails.jsx** - Single job detail view
5. **Settings.jsx** - User profile & settings
6. **Signin/Signup** - Authentication pages
7. **VerificationScreen** - Email verification
8. **ForgotPassword/CreatePassword** - Password recovery

### Main Components (src/components/)
**Layout:**
- Sidebar - Navigation sidebar
- Layout/Sidebar - Alternative sidebar

**Modals (40+ modal components):**
- **Notificationmodal** - Notifications display
- **Walletmodal** - Wallet/balance display
- **Postmodal** - Create job posting
- **Applicantmodal** - View applicants
- **Feedbackmodal/EmpFeedbackmodal** - Feedback submission
- **PaymentDetailsmodal** - Payment info
- **AccountModal** - Bank account details
- **StartshiftConfirmmodal/Success** - Shift start flow
- **EndshiftConfirmmodal/Success** - Shift end flow
- **CancelshiftConfirmmodal/Success** - Shift cancellation
- **AcceptJobmodal/Confirmmodal** - Job acceptance
- **DeclineJobmodal** - Job decline
- **JobPreviewmodal** - Job preview
- **Jobrequestmodal** - Job requests
- **WithdrawModal** - Withdrawal requests
- **ShareLocationModal** - Location sharing
- **CallModal** - Call worker

**Data Components:**
- JobsData - Job data display
- Pagination - Pagination control
- ApplicantProfile - Applicant profile view
- Profile - User profile modal

### Custom Hooks (src/hooks/)
- **useOptimizedJobs** - Fetch jobs with caching
- **useJobDetail** - Fetch single job
- **useClientJobs** - Fetch client's jobs
- **useSavedJobs** - Fetch saved jobs
- **useBestApplicants** - Fetch best applicants
- **useGeolocation** - Geolocation handling
- **useGoogleMapsLoaded** - Google Maps loading

### Auth Utilities (src/auth/)
- **getCurrentUser.js** - Fetch current user profile
- **timeToSeconds.js** - Convert time to seconds
- **ConvertHoursToTime.jsx** - Convert hours to time format
- **CountdownTimer.jsx** - Countdown timer component

### Utilities (src/utils/)
- **queryClient.js** - React Query configuration
- **toastConfig.js** - Toast notification config
- **performanceMonitor.js** - Performance tracking
- **logger.js** - Logging utility
- **secureStorage.js** - Secure storage wrapper
- **SweetAlert.jsx** - Alert dialogs

## Key Features

### Authentication Flow
1. User signs up/logs in
2. Backend returns access_token & refresh_token
3. Tokens stored in localStorage
4. API interceptor adds Bearer token to requests
5. 401 errors trigger token refresh
6. Failed refresh redirects to /signin

### Notification System
- Real-time notification modal
- Mark notifications as read
- Filter by read/unread/all
- Group by date (Today, Yesterday, etc.)
- Polling disabled (parent handles)

### Job Management
- Browse all jobs (applicants)
- Post jobs (clients)
- Apply to jobs
- Save jobs
- View applicants
- Accept/decline applicants
- Start/end shifts
- Provide feedback

### Wallet & Payments
- View wallet balance
- Transaction history
- Withdraw funds
- Payment methods
- Invoice history

### Settings
- Edit profile
- Change password
- Notification preferences
- Bank account details
- Saved jobs
- Ratings & reviews

## Performance Optimizations

1. **Code Splitting** - Lazy-loaded pages
2. **Caching** - React Query + request cache
3. **Memoization** - useMemo, useCallback
4. **Performance Monitoring** - Track API response times
5. **Request Deduplication** - 5-second cache
6. **Conditional Rendering** - Avoid unnecessary renders

## Known Issues & Patterns

1. **Infinite Re-render Loop** - Fixed in Notificationmodal (useMemo + useEffect separation)
2. **Missing Dependency Arrays** - Some useEffect hooks lack proper dependencies
3. **Direct localStorage Access** - Scattered throughout components
4. **Duplicate Sidebar** - Two sidebar implementations (sidebar/ and layout/)
5. **Modal Management** - Bootstrap modals mixed with React state

## Environment Variables Required
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Development Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run preview` - Preview production build
- `npm run jserver` - JSON server (mock API)

