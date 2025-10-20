/**
 * Centralized Toast Configuration
 * This file provides consistent toast notification settings across the application
 */

import { toast, Bounce } from 'react-toastify';

// Default toast configuration
export const defaultToastConfig = {
  position: "top-center",
  autoClose: 4000, // 4 seconds - reasonable time to read
  hideProgressBar: false,
  closeOnClick: true, // Allow users to close by clicking
  pauseOnHover: true, // Pause when hovering
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Bounce,
};

// Quick toast configuration (for simple confirmations)
export const quickToastConfig = {
  ...defaultToastConfig,
  autoClose: 2000, // 2 seconds for quick messages
};

// Long toast configuration (for important messages)
export const longToastConfig = {
  ...defaultToastConfig,
  autoClose: 6000, // 6 seconds for important messages
};

// Error toast configuration (stays longer)
export const errorToastConfig = {
  ...defaultToastConfig,
  autoClose: 5000, // 5 seconds for errors
  closeOnClick: true, // Always allow closing errors
};

// Success toast configuration
export const successToastConfig = {
  ...defaultToastConfig,
  autoClose: 3000, // 3 seconds for success messages
};

// Centralized toast functions
export const showSuccessToast = (message) => {
  if (!message) return;
  return toast.success(message, successToastConfig);
};

export const showErrorToast = (message) => {
  if (!message) return;
  return toast.error(message, errorToastConfig);
};

export const showInfoToast = (message) => {
  if (!message) return;
  return toast.info(message, defaultToastConfig);
};

export const showWarningToast = (message) => {
  if (!message) return;
  return toast.warning(message, defaultToastConfig);
};

export const showQuickToast = (message, type = 'success') => {
  if (!message) return;
  return toast[type](message, quickToastConfig);
};

export const showLongToast = (message, type = 'info') => {
  if (!message) return;
  return toast[type](message, longToastConfig);
};

// ToastContainer default props for consistent rendering
export const toastContainerProps = {
  position: "top-center",
  autoClose: 4000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "light",
  transition: Bounce,
  limit: 3, // Maximum 3 toasts at once
};
