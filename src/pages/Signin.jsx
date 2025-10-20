import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import brandLogo from "../assets/images/logo-sm.png";
import successIcon from "../assets/images/success.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {
  LoginSocialFacebook,
  LoginSocialApple,
} from 'reactjs-social-login';

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from "axios";
import "animate.css";
import { useGoogleLogin } from '@react-oauth/google';

// Import social media icons
import igoogle from "../assets/images/icon-google.png";
import ifacebook from "../assets/images/icon-facebook.png";
import iapple from "../assets/images/icon-apple.png";

// SweetAlert2 setup
// const AppSwal = withReactContent(Swal);

// API_BASE_URL should be defined in your environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Centralized API endpoints
export const API_ENDPOINTS = {
  SOCIAL_AUTH: `${API_BASE_URL}/accountsapp/social/google`,
  LOGIN: `${API_BASE_URL}/accountsapp/login-simple`,
  ALL_USERS: `${API_BASE_URL}/jobs/all-users`,
  CONNECT_SOCIAL: `${API_BASE_URL}/accountsapp/social/connect-social`,
  CHECK_SOCIAL_ACCOUNT: `${API_BASE_URL}/accountsapp/social/check-social-account`,
  DIRECT_SOCIAL_LOGIN: `${API_BASE_URL}/accountsapp/social/direct-social-login`
};

// REDIRECT URL for social login components
const REDIRECT_URI = window.location.href;

// Yup validation schema
const Schema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

// Helper: Store user info in localStorage
const storeUserInfo = (user, fallbackEmail = "", fallbackRole = "client", fallbackFirstName = "", fallbackLastName = "") => {
  if (!user && !fallbackEmail) return;
  const email = user?.email || fallbackEmail;
  const role = user?.role || fallbackRole;
  const user_id = user?.user_id || user?.id;
  const first_name = user?.first_name || fallbackFirstName || (email ? email.split('@')[0] : "");
  const last_name = user?.last_name || fallbackLastName || "";
  const displayName = `${first_name} ${last_name}`.trim();
  if (user?.access_token) localStorage.setItem("access_token", user.access_token);
  if (user?.refresh_token) localStorage.setItem("refresh_token", user.refresh_token);
  if (user_id) localStorage.setItem("user_id", user_id);
  if (role) localStorage.setItem("user_role", role);
  if (email) localStorage.setItem("user_email", email);
  localStorage.setItem("user_name", displayName || (email ? email.split('@')[0] : ""));
  localStorage.setItem("first_name", first_name);
  localStorage.setItem("last_name", last_name);
  localStorage.setItem("has_google_account", "true");
};

// Helper: Show SweetAlert2 success dialog
const showSuccessSwal = (title, text) => {
  Swal.fire({
    title,
    text,
    imageUrl: successIcon,
    imageWidth: 80,
    imageHeight: 80,
    imageAlt: "Success",
    showConfirmButton: false,
    timer: 1500,
    customClass: {
      image: 'swal-custom-image',
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      htmlContainer: 'swal-custom-html',
    },
    background: '#FFFFFF',
  });
};
// Custom SweetAlert2 styles
// You can move this to a CSS/SCSS file if preferred
const swalCustomStyles = document.createElement('style');
swalCustomStyles.innerHTML = `
  .swal-custom-popup {
    border-radius: 24px !important;
    padding: 24px !important;
    background-color: #FFFFFF !important;
  }
`;
if (!document.getElementById('swal-custom-styles')) {
  swalCustomStyles.id = 'swal-custom-styles';
  document.head.appendChild(swalCustomStyles);
}

const Signin = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState("password");
  const [loading, setLoading] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState("");

  // Default role for login - update as needed for your business logic
  // TODO: If you want to support multiple roles, consider making this dynamic (e.g., from a dropdown or context)
  const role = "client"; // Change this if your logic requires a different default

  // Check for pre-filled email and other flags from sessionStorage (set by ThirdParty.jsx)
  React.useEffect(() => {
    const storedEmail = sessionStorage.getItem("prefill_email");
    const tryGoogleLogin = sessionStorage.getItem("try_google_login");
    const googleSignupRole = sessionStorage.getItem("google_signup_role");

    // If we have a role from the signup page, use it
    if (googleSignupRole) {
      console.log("Using role from signup page:", googleSignupRole);
      // Store it in localStorage so it's available for the Google auth flow
      localStorage.setItem("user_role", googleSignupRole);
      // Clear it after using
      sessionStorage.removeItem("google_signup_role");
    }

    if (storedEmail) {
      setPrefilledEmail(storedEmail);
      // Clear it after using
      sessionStorage.removeItem("prefill_email");

      // If we should try Google login directly
      if (tryGoogleLogin === "true") {
        sessionStorage.removeItem("try_google_login");
        // Small delay to ensure everything is loaded
        setTimeout(() => {
          login(); // Trigger Google login automatically
        }, 500);
      }
    }
  }, []);

  // Simple callback for social login start
  const onLoginStart = useCallback(() => {
    setLoading(true);
  }, []);

  /**
   * Helper function to handle successful login and redirect
   */
  const handleSuccessfulLogin = (userData, googleEmail) => {
    // Add null check to prevent "Cannot read properties of undefined" error
    if (!userData) {
      console.error("userData is undefined in handleSuccessfulLogin");
      Swal.fire({
        title: "Login Error",
        text: "Something went wrong during login. Please try again.",
        icon: "error"
      });
      setLoading(false);
      return;
    }

    const {
      access_token,
      refresh_token,
      user_id,
      role: userRole,
      email,
      first_name = '',
      last_name = ''
    } = userData;


    // Store all relevant data
    storeUserInfo({ access_token, refresh_token, user_id, role: userRole, email, first_name, last_name }, googleEmail, role);
    showSuccessSwal("Google Login Successful!", "You have been logged in with your Google account.");

    // Redirect based on role
    setTimeout(() => {
      if ((userRole || role) === "client") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    }, 1500);
  };

  /**
   * Handles Google authentication for login
   */
  const handleGoogleAuth = async (tokenResponse) => {
    setLoading(true);
    try {
      console.log("Google token response:", tokenResponse);

      // 1. Get user info from Google
      let userInfoResponse;
      try {
        userInfoResponse = await axios.get(
          API_ENDPOINTS.GOOGLE_USER_INFO,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        console.log("Google user info:", userInfoResponse.data);
      } catch (googleError) {
        console.error("Error fetching Google user info:", googleError);
        Swal.fire({
          title: "Authentication Error",
          text: "Could not fetch your Google profile information. Please try again.",
          icon: "error"
        });
        setLoading(false);
        return;
      }

      // Get the email and name from Google user info
      const email = userInfoResponse?.data?.email;
      const firstName = userInfoResponse?.data?.given_name || '';
      const lastName = userInfoResponse?.data?.family_name || '';
      const fullName = userInfoResponse?.data?.name || `${firstName} ${lastName}`.trim();

      console.log("Google user info:", {
        email,
        firstName,
        lastName,
        fullName
      });

      if (!email) {
        Swal.fire({
          title: "Authentication Error",
          text: "Could not get your email from Google. Please try again.",
          icon: "error"
        });
        setLoading(false);
        return;
      }

      // Show loading indicator
      Swal.fire({
        title: "Logging in...",
        text: "Please wait while we log you in with Google.",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false
      });

      // 2. Check if the user exists in the system first
      try {
        console.log("Checking if user exists:", email);
        const checkUserResponse = await axios.get(API_ENDPOINTS.ALL_USERS);
        const usersArray = checkUserResponse.data.users || checkUserResponse.data;
        const userExists = usersArray.some(user => user.email === email);

        if (userExists) {
          console.log("User exists in the system, proceeding with authentication");

          // Find the user object to get their role and other details
          const userObject = usersArray.find(user => user.email === email);

          // Add a check to ensure userObject is defined
          if (!userObject) {
            console.error("User exists but userObject is undefined");
            Swal.fire({
              title: "Authentication Error",
              text: "Could not retrieve your user information. Please try again or use password login.",
              icon: "error"
            });
            setLoading(false);
            return;
          }

          // Try direct login with the email from Google
          try {
            console.log("Attempting direct login with Google account");

            const directLoginPayload = {
              email: email,
              provider: "google",
              role: userObject?.role,
              direct_login: true
            };

            try {
              const directLoginResponse = await axios.post(
                API_ENDPOINTS.DIRECT_SOCIAL_LOGIN,
                directLoginPayload,
                { timeout: 10000 }
              );

              if (directLoginResponse.data.message === "success") {
                console.log("Direct login successful");
                handleSuccessfulLogin(directLoginResponse.data, email);
                return;
              }
            } catch (directLoginError) {
              console.log("Direct login failed:", directLoginError.response?.status, directLoginError.response?.data?.error || directLoginError.message);

              // If endpoint not found or there's a server error, try the regular social auth endpoint
              if (directLoginError.response?.status === 404 ||
                directLoginError.response?.status === 422 ||
                directLoginError.response?.status === 500) {
                console.log("Backend error:", directLoginError.response?.status, directLoginError.response?.data);
                console.log("Falling back to regular social auth...");

                // Try regular social auth without showing the dialog
                try {
                  const socialPayload = {
                    provider: "google",
                    access_token: tokenResponse.access_token,
                    role: userObject?.role 
                  };

                  const result = await axios.post(
                    API_ENDPOINTS.SOCIAL_AUTH,
                    socialPayload,
                    {
                      timeout: 10000,
                      headers: { 'Content-Type': 'application/json' }
                    }
                  );

                  if (result.data.message === "success") {
                    handleSuccessfulLogin(result.data, email);
                    return;
                  }
                } catch (socialAuthError) {
                  console.log("Social auth also failed:", socialAuthError.response?.status, socialAuthError.response?.data?.error || socialAuthError.message);
                }

                // If both methods fail, offer to connect Google account or proceed to dashboard
                Swal.fire({
                  title: "Account Found",
                  text: "We found your account with this email. Would you like to connect your Google account or proceed to the dashboard?",
                  icon: "info",
                  showDenyButton: true,
                  showCancelButton: true,
                  confirmButtonText: "Connect Google Account",
                  denyButtonText: "Go to Dashboard",
                  cancelButtonText: "Cancel"
                }).then((result) => {
                  if (result.isConfirmed) {
                    // Store a flag to indicate we want to connect the Google account after login
                    sessionStorage.setItem("connect_google_after_login", "true");
                    sessionStorage.setItem("google_token", tokenResponse.access_token);

                    // Pre-fill the email field
                    const emailField = document.querySelector('input[name="email"]');
                    if (emailField) {
                      emailField.value = email;
                      emailField.dispatchEvent(new Event('input', { bubbles: true }));
                      // Focus on password field
                      document.querySelector('input[name="password"]')?.focus();

                      // Show a message to the user

                      Swal.fire({
                        title: "Connect Google Account",
                        text: "Please login with your password first, then we'll connect your Google account.",
                        icon: "info"
                      });
                    }
                  } else if (result.isDenied) {

                    // Store basic user info in localStorage
                    storeUserInfo(userObject, email, userObject?.role, firstName, lastName);
                    // Store the actual access token from backend response
                    if (response.data.access_token) {
                      localStorage.setItem("access_token", response.data.access_token);
                      console.log("✅ Access token stored successfully from social login (Line 377)");
                    } else {
                      console.warn("⚠️ No access token in response from backend");
                    }
                    showSuccessSwal("Login Successful!", "You'll be redirected to the dashboard.");

                    // Redirect based on role
                    setTimeout(() => {
                      if ((userObject?.role) === "client") {
                        navigate("/dashboard");
                      } else {
                        navigate("/home");
                      }
                    }, 1500);
                    return;
                  }
                });
                setLoading(false);
                return;
              }
            }

            // Try regular social auth as fallback
            try {
              const socialPayload = {
                provider: "google",
                access_token: tokenResponse.access_token,
                role: userObject?.role
              };

              console.log("Trying social auth with payload:", socialPayload);

              const result = await axios.post(
                API_ENDPOINTS.SOCIAL_AUTH,
                socialPayload,
                {
                  timeout: 10000,
                  headers: { 'Content-Type': 'application/json' }
                }
              );

              if (result.data.message === "success") {
                handleSuccessfulLogin(result.data, email);
                return;
              }
            } catch (socialAuthError) {
              console.log("Social auth failed:", socialAuthError.response?.status, socialAuthError.response?.data?.error || socialAuthError.message);

              // If endpoint not found or there's a server error, offer to proceed to dashboard
              if (socialAuthError.response?.status === 404 ||
                socialAuthError.response?.status === 422 ||
                socialAuthError.response?.status === 500) {
                console.log("Backend error:", socialAuthError.response?.status, socialAuthError.response?.data);

                // Offer to connect Google account or proceed to dashboard

                Swal.fire({
                  title: "Account Found",
                  text: "We found your account with this email. Would you like to connect your Google account or proceed to the dashboard?",
                  icon: "info",
                  showDenyButton: true,
                  showCancelButton: true,
                  confirmButtonText: "Connect Google Account",
                  denyButtonText: "Go to Dashboard",
                  cancelButtonText: "Cancel"
                }).then((result) => {
                  if (result.isConfirmed) {
                    // Store a flag to indicate we want to connect the Google account after login
                    sessionStorage.setItem("connect_google_after_login", "true");
                    sessionStorage.setItem("google_token", tokenResponse.access_token);

                    // Pre-fill the email field
                    const emailField = document.querySelector('input[name="email"]');
                    if (emailField) {
                      emailField.value = email;
                      emailField.dispatchEvent(new Event('input', { bubbles: true }));
                      // Focus on password field
                      document.querySelector('input[name="password"]')?.focus();

                      // Show a message to the user
                      Swal.fire({
                        title: "Connect Google Account",
                        text: "Please login with your password first, then we'll connect your Google account.",
                        icon: "info"

                      });
                    }
                  } else if (result.isDenied) {

                    // Store basic user info in localStorage
                    storeUserInfo(userObject, email, userObject?.role, firstName, lastName);
                    // Store the actual access token from backend response
                    if (response.data.access_token) {
                      localStorage.setItem("access_token", response.data.access_token);
                      console.log("✅ Access token stored successfully from social login (Line 466)");
                    } else {
                      console.warn("⚠️ No access token in response from backend");
                    }
                    showSuccessSwal("Login Successful!", "You'll be redirected to the dashboard.");

                    // Redirect based on role
                    setTimeout(() => {
                      if ((userObject?.role) === "client") {
                        navigate("/dashboard");
                      } else {
                        navigate("/home");
                      }
                    }, 1500);
                    return;
                  }
                });
                setLoading(false);
                return;
              }

              // If we get here, both direct login and social auth failed
              // Offer to connect Google account or proceed to dashboard
              Swal.fire({
                title: "Account Found",
                text: "We found your account, but it's not connected to Google. What would you like to do?",
                icon: "info",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Connect Google Account",
                denyButtonText: "Go to Dashboard",
                cancelButtonText: "Cancel"
              }).then((result) => {
                if (result.isConfirmed) {
                  // Store a flag to indicate we want to connect the Google account after login
                  sessionStorage.setItem("connect_google_after_login", "true");
                  sessionStorage.setItem("google_token", tokenResponse.access_token);

                  // Pre-fill the email field
                  const emailField = document.querySelector('input[name="email"]');
                  if (emailField) {
                    emailField.value = email;
                    emailField.dispatchEvent(new Event('input', { bubbles: true }));
                    // Focus on password field
                    document.querySelector('input[name="password"]')?.focus();

                    // Show a message to the user
                    Swal.fire({
                      title: "Connect Google Account",
                      text: "Please login with your password first, then we'll connect your Google account.",
                      icon: "info"
                    });
                  }
                } else if (result.isDenied) {

                  // Store basic user info in localStorage
                  storeUserInfo(userObject, email, userObject?.role, firstName, lastName);
                  // Store the actual access token from backend response
                  if (response.data.access_token) {
                    localStorage.setItem("access_token", response.data.access_token);
                    console.log("✅ Access token stored successfully from social login (Line 521)");
                  } else {
                    console.warn("⚠️ No access token in response from backend");
                  }
                  showSuccessSwal("Login Successful!", "You'll be redirected to the dashboard.");

                  // Redirect based on role
                  setTimeout(() => {
                    if ((userObject?.role) === "client") {
                      navigate("/dashboard");
                    } else {
                      navigate("/home");
                    }
                  }, 1500);
                }
              });
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error("Error in authentication flow:", error);
            // Offer to proceed to dashboard with existing user info
            Swal.fire({
              title: "Account Found",
              text: "We found your account with this email. Would you like to proceed to the dashboard?",
              icon: "info",
              showCancelButton: true,
              confirmButtonText: "Go to Dashboard",
              cancelButtonText: "Cancel"
            }).then((result) => {
              if (result.isConfirmed) {

                // Store basic user info in localStorage
                storeUserInfo(userObject, email, userObject?.role, firstName, lastName);
                // Store the actual access token from backend response
                if (response.data.access_token) {
                  localStorage.setItem("access_token", response.data.access_token);
                  console.log("✅ Access token stored successfully from social login (Line 553)");
                } else {
                  console.warn("⚠️ No access token in response from backend");
                }
                showSuccessSwal("Login Successful!", "You'll be redirected to the dashboard.");

                // Redirect based on role
                setTimeout(() => {
                  if ((userObject?.role) === "client") {
                    navigate("/dashboard");
                  } else {
                    navigate("/home");
                  }
                }, 1500);
              }
            });
            setLoading(false);
            return;
          }
        } else {
          // User doesn't exist, offer to sign up
          console.log("User does not exist in the system, will need to sign up");
          // Show a message that the user doesn't exist and offer to sign up
          Swal.fire({
            title: "Account Not Found",
            text: "We couldn't find an account with this email. Would you like to sign up?",
            icon: "info",
            buttons: {
              cancel: "Cancel",
              signup: "Sign Up Now"
            }
          }).then((value) => {
            if (value === "signup") {
              // Store the email for the signup process
              sessionStorage.setItem("prefill_signup_email", email);
              navigate("/welcome");
            }
          });
          setLoading(false);
          return;
        }
      } catch (checkError) {
        console.error("Error checking if user exists:", checkError);
        // Continue with normal flow if we can't check
      }

      // 3. As a final fallback, just offer to proceed to dashboard
      // Since we've already verified the user exists in the system
      Swal.fire({
        title: "Authentication Issue",
        text: "We're having trouble with the authentication service. Would you like to proceed to the dashboard anyway?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Go to Dashboard",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          // Store basic user info in localStorage
          localStorage.setItem("user_email", email);
          localStorage.setItem("user_role", userObject?.role);
          if (userObject?.id) localStorage.setItem("user_id", userObject.id);

          // Store name information - prioritize user object, then Google info, then fallback
          if (userObject && userObject.first_name && userObject.last_name) {
            localStorage.setItem("user_name", `${userObject.first_name} ${userObject.last_name}`);
            localStorage.setItem("first_name", userObject.first_name);
            localStorage.setItem("last_name", userObject.last_name);
          } else if (firstName || lastName) {
            localStorage.setItem("user_name", `${firstName} ${lastName}`.trim() || fullName || email.split('@')[0]);
            localStorage.setItem("first_name", firstName || email.split('@')[0]);
            localStorage.setItem("last_name", lastName || '');
          } else {
            localStorage.setItem("user_name", email.split('@')[0]); // Use part of email as name if not available
            localStorage.setItem("first_name", email.split('@')[0]);
            localStorage.setItem("last_name", '');
          }

          // Store the actual access token from backend response
          if (response.data.access_token) {
            localStorage.setItem("access_token", response.data.access_token);
            console.log("✅ Access token stored successfully from Google login (Line 628)");
          } else {
            console.warn("⚠️ No access token in response from backend");
          }
          localStorage.setItem("has_google_account", "true");

          Swal.fire({
            title: "Login Successful!",
            text: "You'll be redirected to the dashboard.",
            imageUrl: successIcon,
            imageWidth: 80,
            imageHeight: 80,
            imageAlt: "Success",
            showConfirmButton: false,
            timer: 1500,
            customClass: {
              image: 'swal-custom-image'
            }
          });


          // Redirect based on role
          setTimeout(() => {
            if ((userObject?.role) === "client") {
              navigate("/dashboard");
            } else {
              navigate("/home");
            }
          }, 1500);
        }
      });

      setLoading(false);
      return;
    } catch (error) {
      // Handle login error with more detailed information
      console.error("Google login error:", error);
      console.error("Error response:", error.response?.data);

      // Show a helpful error message
      Swal.fire({
        title: "Authentication Failed",
        text: "Could not authenticate with Google. Please try again or use password login.",
        icon: "error",
        button: "OK"
      });

      setLoading(false);
    } finally {
      setLoading(false);
    }
  };





  // Initialize Google login hook
  const login = useGoogleLogin({
    onSuccess: handleGoogleAuth,
    onError: () => {
      Swal.fire({
        title: "Authentication Failed",
        text: "error"
      });
      setLoading(false);
    }
  });

  // Called when the form is submitted
  const handleLogin = async (values) => {
    const userData = {
      email: values.email,
      password: values.password,
    };

    try {
      console.log("Attempting login with:", { email: values.email });

      const response = await axios.post(API_ENDPOINTS.LOGIN, userData);
      console.log("Login response:", response.data);

      // Check if verification is required
      if (response.data.requires_verification) {
        console.log("Verification required:", response.data.verification_type);

        // Redirect to verification page with email and verification type
        navigate("/verify", {
          state: {
            email: values.email,
            verificationType: response.data.verification_type
          }
        });
        return;
      }

      // If success
      if (response.status === 200 && response.data.message) {
        console.log(response.data);
        const { access_token, refresh_token, user_id, role, first_name, last_name, email } = response.data;


        // Store tokens and user info securely
        storeUserInfo({ access_token, refresh_token, user_id, role, first_name, last_name, email });

        console.log("Login successful, stored user data:", {
          user_id, role, first_name, last_name
        });

        // Check if we need to connect a Google account
        const connectGoogle = sessionStorage.getItem("connect_google_after_login");
        const googleToken = sessionStorage.getItem("google_token");

        if (connectGoogle === "true" && googleToken) {
          // Clear the session storage
          sessionStorage.removeItem("connect_google_after_login");
          sessionStorage.removeItem("google_token");

          try {
            // Create payload for connecting Google account
            const connectPayload = {
              provider: "google",
              access_token: googleToken,
              role: role,
              connect_to_user_id: user_id
            };

            console.log("Connecting Google account with payload:", connectPayload);

            // Call the API to connect the Google account
            const connectResponse = await axios.post(API_ENDPOINTS.CONNECT_SOCIAL, connectPayload, {
              headers: {
                Authorization: `Bearer ${access_token}`
              }
            });

            if (connectResponse.data.message === "success") {
              Swal.fire({
                title: "Account Connected!",
                text: "Your Google account has been connected successfully.",
                icon: "success",
                button: false,
                timer: 2000
              });
            } else {
              Swal.fire({
                title: "Connection Failed",
                text: "Could not connect your Google account. Please try again later.",
                icon: "error"
              });
            }
          } catch (connectError) {
            console.error("Error connecting Google account:", connectError);
            Swal.fire({
              title: "Connection Failed",
              text: "Could not connect your Google account. Please try again later.",
              icon: "error"
            });
          }

          // Redirect after a delay
          setTimeout(() => {
            if (role === "client") {
              navigate("/dashboard");
            } else {
              navigate("/home");
            }
          }, 2500);
        } else {


          showSuccessSwal("Login Successful!", "You have been logged in with your email and password.");


          // Redirect to dashboard or home
          setTimeout(() => {
            if (role === "client") {
              navigate("/dashboard");
            } else {
              navigate("/home");
            }
          }, 1500);
        }
      }
      // If Django returns {error: "..."}
      else if (response.data.error) {
        Swal.fire({
          title: "Login Failed!",
          text: response.data.error,
          icon: "error"
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      // Log detailed error information
      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error("Error request:", error.request);
      }

      // If server or network error
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;

        // Check for specific error messages
        if (errorMessage.includes("Invalid credentials")) {
          Swal.fire({
            title: "Login Failed!",
            text: "Invalid email or password. Try Again!",
            icon: "warning",
            cancelButtonText: "Try Again"
          });
        } else if (errorMessage.includes("not verified") || errorMessage.includes("not active")) {
          Swal.fire({
            title: "Account Not Verified!",
            text: "Your account needs verification. Would you like to resend the verification code?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Resend Code",
            cancelButtonText: "Cancel"
          }).then((result) => {
            if (result.isConfirmed) {
              // Call resend verification API
              axios.post(`${API_BASE_URL}/accountsapp/otp/request`, {
                email: values.email,
                type: "registration"
              })
                .then(response => {
                  if (response.data.success) {
                    Swal.fire({
                      title: "Verification Code Sent!",
                      text: "Please check your email for the verification code.",
                      icon: "success"
                    });
                    // Redirect to verification page
                    setTimeout(() => {
                      navigate("/verify", {
                        state: {
                          email: values.email,
                          verificationType: "registration"
                        }
                      });
                    }, 2000);
                  } else {
                    Swal.fire({
                      title: "Error",
                      text: response.data.message || "Failed to send verification code.",
                      icon: "error"
                    });
                  }
                })
                .catch(err => {
                  console.error("Error resending verification code:", err);
                  Swal.fire({
                    title: "Error",
                    text: "Failed to send verification code. Please try again later.",
                    icon: "error"
                  });
                });
            }
          });
        } else {
          Swal.fire({
            title: "Login Failed!",
            text: errorMessage,
            icon: "error"
          });
        }
      } else if (error.response?.status === 500) {
        Swal.fire({
          title: "Server Error",
          text: "The server encountered an error. Please try again later or contact support.",
          icon: "error"
        });
      } else if (error.response?.status === 401) {
        Swal.fire({
          title: "Login Failed!",
          text: "Invalid email or password. Try Again",
          icon: "warning",
          cancelButtonText: "Try Again"
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to forgot password page
            navigate("/forgotpassword", { state: { email: values.email } });
          } else if (result.isDenied) {
            // Redirect to signup page
            navigate("/welcome");
          }
        });
      } else {
        Swal.fire({
          title: "Login Failed!",
          text: "Something went wrong. Please try again.",
          icon: "error"
        });
      }
    }
  };

  return (
    <div className="row m-0 px-2 thirdparty_wrapper animate__animated animate__fadeIn">
      <div className="col-12 col-md-4 main-card animate__animated animate__zoomIn">
        <div className="col-12 bg-card-2"></div>
        <div className="col-12 bg-card-3"></div>
        <div className="bg-card">
          <div className="row">
            <div className="col-3">
              <Link to="/welcome" className="text-dark">
                <FontAwesomeIcon icon={faChevronLeft} />
              </Link>
            </div>
            <div className="col-6 text-center">
              <img src={brandLogo} className="brand-logo ms-2" alt="Paeshift logo" />
            </div>
            <div className="col-3"></div>
          </div>
          <div className="row content">
            <div className="col-12">
              <div className="title">
                <h3>Welcome Back</h3>
                <p>Login with your Email and password</p>
              </div>

              <Formik
                initialValues={{ email: prefilledEmail || "", password: "" }}
                validationSchema={Schema}
                onSubmit={(values) => handleLogin(values)}
                enableReinitialize={true}
              >
                {({ errors, touched }) => (
                  <Form className="signin_form">
                    <div className="mb-2">
                      <label htmlFor="email" className="form-label mb-0">
                        Email:
                      </label>
                      <Field name="email" className="form-control" />
                      {touched.email && errors.email && (
                        <div className="errors">{errors.email}</div>
                      )}
                    </div>

                    <div className="mb-2">
                      <label htmlFor="password" className="form-label mb-0">
                        Enter Password:
                      </label>
                      <span className="visibility">
                        <Field
                          type={show}
                          name="password"
                          id="password"
                          className="form-control"
                          placeholder="Enter your password"
                        />
                        <FontAwesomeIcon
                          icon={show === "password" ? faEye : faEyeSlash}
                          onClick={() =>
                            setShow(show === "password" ? "text" : "password")
                          }
                          className="eye-icon"
                        />
                      </span>
                      {touched.password && errors.password && (
                        <div className="errors">{errors.password}</div>
                      )}
                    </div>

                    <p className="mt-3">
                      <Link to="/forgotpassword">Forgot Password?</Link>
                    </p>

                    <button type="submit" className="btn primary-btn w-100 mt-2">
                      Login
                    </button>

                    <div className="social-login-divider mt-4 mb-3" style={{
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'center',
                      color: '#666',
                      margin: '15px 0'
                    }}>
                      <div style={{ flex: '1', height: '1px', backgroundColor: '#ddd' }}></div>
                      <span style={{ padding: '0 10px', fontSize: '14px' }}>Or login with</span>
                      <div style={{ flex: '1', height: '1px', backgroundColor: '#ddd' }}></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="social-login-buttons">
                      {/* Google login */}
                      <button
                        className="btn primary-btn-outline mb-3 btn-login w-100"
                        onClick={() => login()}
                        disabled={loading}
                        type="button"
                      >
                        <img src={igoogle} alt="Google" className="me-2" />
                        Login with Google
                      </button>

                      {/* Facebook login */}
                      <LoginSocialFacebook
                        isOnlyGetToken
                        appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                        onLoginStart={onLoginStart}
                        onResolve={() => {
                          // Facebook login not fully implemented yet
                          Swal.fire({
                            title: "Coming Soon",
                            text: "Facebook login will be available soon!", icon: "info"
                          });
                        }}
                        onReject={() => {
                          Swal.fire({
                            title: "Authentication Failed",
                            text: "Could not authenticate with Facebook.", icon: "error"
                          });
                        }}
                      >
                        <button className="btn primary-btn-outline mb-3 btn-login w-100" type="button">
                          <img src={ifacebook} alt="Facebook" className="me-2" />
                          Login with Facebook
                        </button>
                      </LoginSocialFacebook>

                      {/* Apple login - only show if client ID is configured */}
                      {import.meta.env.VITE_APPLE_CLIENT_ID && (
                        <LoginSocialApple
                          client_id={import.meta.env.VITE_APPLE_CLIENT_ID}
                          scope={'name email'}
                          redirect_uri={REDIRECT_URI}
                          onLoginStart={onLoginStart}
                          onResolve={() => {
                            // Apple login not fully implemented yet
                            Swal.fire({
                              title: "Coming Soon", text: "Apple login will be available soon!", icon: "info"
                            });
                          }}
                          onReject={() => {
                            Swal.fire({
                              title: "Authentication Failed", text: "Could not authenticate with Apple.", icon: "error"
                            });
                          }}
                        >
                          <button className="btn primary-btn-outline mb-3 btn-login w-100" type="button">
                            <img src={iapple} alt="Apple" className="me-2" />
                            Login with Apple
                          </button>
                        </LoginSocialApple>
                      )}
                    </div>

                    <p className="mt-3">
                      Don't have an account? <Link to="/welcome">Create Account</Link>
                    </p>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
