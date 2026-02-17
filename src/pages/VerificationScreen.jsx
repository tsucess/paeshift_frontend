import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import brandLogo from "../assets/images/logo-sm.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { toastContainerProps } from '../utils/toastConfig';
import { getApiUrl } from '../config';
import apiClient from '../services/api';
import logger from '../utils/logger';




const VerificationScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get email and verification type from URL params or state
    const [email, setEmail] = useState("");
    const [verificationType, setVerificationType] = useState("signup"); // Default to signup
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(() => {
        // Initialize from localStorage if available
        const savedTime = localStorage.getItem('otpCountdownTime');
        const savedTimestamp = localStorage.getItem('otpCountdownTimestamp');

        if (savedTime && savedTimestamp) {
            const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
            const remaining = Math.max(0, parseInt(savedTime) - elapsed);
            return remaining;
        }
        return 0; // Start with 0 so resend is available immediately
    });
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [isVerifying, setIsVerifying] = useState(false); // Prevent duplicate verification calls
    const [verificationSuccess, setVerificationSuccess] = useState(false); // Prevent re-submission after success

    // Get email and verification type from location state or query params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        const typeParam = params.get('type');

        // Set email from params or state
        if (emailParam) {
            setEmail(emailParam);
        } else if (location.state?.email) {
            setEmail(location.state.email);
        }

        // Set verification type from params or state
        if (typeParam) {
            setVerificationType(typeParam);
        } else if (location.state?.verificationType) {
            setVerificationType(location.state.verificationType);
        }
    }, [location]);

    // Auto-submit when all OTP fields are filled
    useEffect(() => {
        const otpCode = otp.join("");
        const allFilled = otp.every((digit) => digit !== "");

        // Don't auto-submit if verification already succeeded
        if (verificationSuccess) {
            logger.info("Verification already successful, skipping auto-submit");
            return;
        }

        if (allFilled && otpCode.length === 6 && !isVerifying) {
            logger.info("Auto-submitting OTP:", otpCode);
            // Wait a moment to ensure state is fully updated
            const timer = setTimeout(() => {
                handleValidation({ preventDefault: () => {} });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [otp, isVerifying, verificationSuccess]);

    // Countdown timer for resend OTP - with localStorage persistence
    useEffect(() => {
        if (timeLeft <= 0) {
            // Clear localStorage when timer reaches 0
            localStorage.removeItem('otpCountdownTime');
            localStorage.removeItem('otpCountdownTimestamp');
            return;
        }

        // Save current time to localStorage
        localStorage.setItem('otpCountdownTime', timeLeft.toString());
        localStorage.setItem('otpCountdownTimestamp', Date.now().toString());

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    localStorage.removeItem('otpCountdownTime');
                    localStorage.removeItem('otpCountdownTimestamp');
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    // Dynamic notification
    const notify = (val) =>
        toast.success(val, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
        });

    // Dynamic notification
    const errorNotify = (val) =>
        toast.error(val, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
        });

    function handleInput(e, index) {
        const value = e.target.value;

        // Only allow numeric input
        if (value && isNaN(value)) return false;

        // Update OTP array
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input field
        if (value && e.target.nextSibling) {
            e.target.nextSibling.focus();
        }
        // Note: Auto-submit is now handled by useEffect when all fields are filled
    }

    // Handle backspace key to go to previous input
    function handleKeyDown(e, index) {
        if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
            e.preventDefault();
            e.target.previousSibling.focus();
        }
    }

    // Resend OTP function
    async function resendOTP() {
        if (timeLeft > 0) return; // Prevent resend if countdown is active

        if (!email) {
            errorNotify("Email is required to resend OTP");
            return;
        }

        setIsLoading(true);

        try {
            const apiUrl = getApiUrl('accountsapp/otp/request');
            logger.info("📤 Resending OTP to:", email);
            logger.info("📍 API URL:", apiUrl);
            logger.info("📝 Verification Type:", verificationType);

            const response = await apiClient.post(apiUrl, {
                email: email,
                type: verificationType
            });

            logger.info("✅ Resend OTP Response:", response.status, response.data);

            if (response.status === 200 && response.data.message) {
                notify("OTP has been resent to your email");
                setTimeLeft(60); // Reset countdown timer
            } else {
                errorNotify(response.data.message || "Failed to resend OTP");
            }
        } catch (error) {
            logger.error("❌ Resend OTP error:", error);
            logger.error("📋 Error response:", error.response?.data);
            logger.error("📋 Error status:", error.response?.status);
            logger.error("📋 Error message:", error.message);

            const errorMessage = error.response?.data?.message ||
                                error.response?.data?.error ||
                                error.message ||
                                "An error occurred while resending OTP";
            errorNotify(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleValidation(e) {
        e.preventDefault();

        // Prevent duplicate verification calls
        if (isVerifying) {
            logger.info("Verification already in progress, skipping duplicate call");
            return;
        }

        const otpCode = otp.join("");
        logger.info(`OTP Code: "${otpCode}", Length: ${otpCode.length}, OTP Array:`, otp);

        // Check if all 6 digits are filled
        if (otpCode.length !== 6 || otp.some(digit => digit === "")) {
            errorNotify("Please enter all 6 digits of the OTP");
            return;
        }

        if (!email) {
            errorNotify("Email is required for verification");
            return;
        }

        setIsLoading(true);
        setIsVerifying(true);

        try {
            logger.info(`Verifying OTP for ${email} with type ${verificationType}`);

            // Use different endpoints based on verification type
            let endpoint = 'accountsapp/otp/verify'; // Default endpoint

            // For registration, use the dedicated endpoint that activates the account
            if (verificationType === 'registration' || verificationType === 'signup') {
                endpoint = 'accountsapp/verify-registration';
            }

            const response = await apiClient.post(getApiUrl(endpoint), {
                email: email,
                code: otpCode,
                type: verificationType
            });

            logger.info("OTP verification response:", response.data);

            // Check if OTP verification was successful
            if (response.data.message && response.data.message.includes("successfully")) {
                // Mark verification as successful to prevent re-submission
                setVerificationSuccess(true);
                // Clear OTP fields to prevent auto-submit from triggering again
                setOtp(new Array(6).fill(""));

                // Handle different verification types
                switch (verificationType) {
                    case "registration":
                    case "signup":
                        // For registration, redirect to signin page
                        notify("Account activated successfully! Please login to continue.");
                        setTimeout(() => {
                            navigate("/signin");
                        }, 1500);
                        return;

                    case "login":
                        // Store token if provided
                        if (response.data.access_token) {
                            localStorage.setItem("access_token", response.data.access_token);
                            logger.info("Access token stored successfully");
                        } else if (response.data.token) {
                            localStorage.setItem("access_token", response.data.token);
                            logger.info("Token stored as access_token");
                        } else {
                            logger.warn("No token received from server");
                        }

                        if (response.data.user_id) {
                            localStorage.setItem("user_id", response.data.user_id);
                            logger.info("User ID stored successfully:", response.data.user_id);
                        }

                        if (response.data.role) {
                            localStorage.setItem("user_role", response.data.role);
                            logger.info("User role stored successfully:", response.data.role);
                        }

                        // For login, redirect to dashboard
                        notify("Login successful! Redirecting to dashboard...");
                        setTimeout(() => {
                            navigate("/dashboard");
                        }, 1500);
                        break;

                    case "password_reset":
                        // Redirect to create new password page
                        notify("OTP verified successfully. You can now reset your password.");
                        setTimeout(() => {
                            navigate("/create-password", {
                                state: {
                                    email: email,
                                    reset_token: response.data.reset_token
                                }
                            });
                        }, 1500);
                        break;

                    default:
                        // Generic success, redirect to home
                        notify("Verification successful! Redirecting...");
                        setTimeout(() => {
                            navigate("/");
                        }, 1500);
                }
            } else {
                errorNotify(response.data.message || "OTP verification failed");
            }
        } catch (error) {
            logger.error("OTP verification error:", error);
            const errorMessage = error.response?.data?.message ||
                                error.response?.data?.error ||
                                "An error occurred during verification";
            errorNotify(errorMessage);
        } finally {
            setIsLoading(false);
            setIsVerifying(false);
        }
    }


    return (
        <div className="row m-0 px-2 otp_wrapper animate__animated animate__fadeIn">
            <div className="col-12 col-md-4 main-card animate__animated animate__zoomIn">
                <div className="col-12 bg-card-2"></div>
                <div className="col-12 bg-card-3"></div>
                <div className="bg-card">
                    <div>
                        <ToastContainer {...toastContainerProps} />
                    </div>
                    <div className="row">
                        <div className="col-3">
                            <button
                                onClick={() => navigate(-1)}
                                className='text-dark btn btn-link p-0'
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                        </div>
                        <div className="col-6 text-center">
                            <img src={brandLogo} className="brand-logo ms-2" alt="Paeshift logo" />
                        </div>
                        <div className="col-3"></div>
                    </div>
                    <div className="row content">
                        <div className="col-12 px-0">
                            <div className="title">
                                <h3>OTP verification</h3>
                                <p>
                                    {verificationType === "signup" && "Verify your account by entering the OTP sent to your email."}
                                    {verificationType === "login" && "Enter the OTP sent to your email to complete login."}
                                    {verificationType === "password_reset" && "Enter the OTP sent to your email to reset your password."}
                                    {!["signup", "login", "password_reset"].includes(verificationType) && "Enter the OTP sent to your email."}
                                </p>
                                {email && <p className="text-primary">{email}</p>}
                            </div>
                            <form className="otp_form" onSubmit={handleValidation}>

                                <div className="mb-2 otp_area">
                                    {
                                        otp.map((data, i) => {
                                            return (
                                                <input
                                                    type="text"
                                                    maxLength={1}
                                                    className="form-control"
                                                    name="otp"
                                                    value={data}
                                                    onChange={(e) => handleInput(e, i)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
                                                            e.preventDefault();
                                                            e.target.previousSibling.focus();
                                                        }
                                                    }}
                                                    key={i}
                                                    disabled={isLoading}
                                                />
                                            )
                                        })
                                    }
                                </div>
                                <p className="mt-3">
                                    Didn't get Code?
                                    {timeLeft > 0 ? (
                                        <span> Resend OTP in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                                    ) : (
                                        <a href="#" onClick={(e) => { e.preventDefault(); resendOTP(); }}> Resend OTP now</a>
                                    )}
                                </p>

                                <button
                                    type="submit"
                                    name='submit'
                                    className="btn primary-btn w-100 mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerificationScreen
