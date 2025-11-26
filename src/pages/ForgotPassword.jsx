import React, { useState } from 'react'
import {Link, useNavigate } from "react-router-dom";
import brandLogo from "../assets/images/logo-sm.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronLeft, faCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer } from 'react-toastify';
import { showSuccessToast, showErrorToast, toastContainerProps } from '../utils/toastConfig';
import Axios from "axios";


const ForgotPassword = () => {
    let redir = useNavigate();
    const [values, setValues] = useState({
        email: "",

    });

    let [show, setShow] = useState('password');
    let [password, setPassword] = useState('');
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,6}$/;

    // Dynamic notification
    const notify = (val) => {
        return showSuccessToast(val);
    };

    // Dynamic notification
    const errorNotify = (val) => {
        return showErrorToast(val);
    };



    function handleInput(e) {
        const newData = { ...values, [e.target.name]: e.target.value }
        // const newData = [ ...values,  e.target.value ]
        setValues(newData);
    }

    async function handleValidation(e) {
        e.preventDefault();
        let userdata = {
            email: values.email,
        };

        if (userdata.email === "") {
            errorNotify("Email is Required");
            return;
        }
        else if (!email_pattern.test(userdata.email)) {
            errorNotify("Invalid email address");
            return;
        }

        try {
            // Show loading state
            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = 'Sending...';
            submitButton.disabled = true;

            // Send password reset request
            const response = await Axios.post(`${import.meta.env.VITE_API_BASE_URL }/accountsapp/request-password-reset`, {
                email: values.email
            });

            // Reset button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;

            if (response.data.message) {
                notify("Password reset instructions sent to your email");

                // Redirect to verification page after a delay
                setTimeout(() => {
                    redir("/verify", {
                        state: {
                            email: values.email,
                            verificationType: "password_reset"
                        }
                    });
                }, 2000);
            } else {
                errorNotify(response.data.error || "Failed to send password reset email");
            }
        } catch (error) {
            console.error("Password reset error:", error);

            // Reset button state
            const submitButton = e.target.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.innerHTML = 'Continue';
                submitButton.disabled = false;
            }

            if (error.response?.data?.error) {
                errorNotify(error.response.data.error);
            } else if (error.response?.status === 404) {
                errorNotify("Email not found. Please check your email or create a new account.");
            } else {
                errorNotify("Failed to send password reset email. Please try again later.");
            }
        }
    }


    return (
        <div className="row m-0 px-2 forgot_wrapper animate__animated animate__fadeIn">
            <div className="col-12 col-md-4 main-card animate__animated animate__zoomIn">
                <div className="col-12 bg-card-2"></div>
                <div className="col-12 bg-card-3"></div>
                <div className="bg-card">
                    <div>
                        <ToastContainer {...toastContainerProps} />
                    </div>
                    <div className="row">
                        <div className="col-3">
                            <Link to="/signin" className='text-dark'>
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
                                <h3>Forgot Password</h3>
                                <p>To reset your password, Please enter your registered email address</p>
                            </div>
                            <form className="forgot_form" onSubmit={handleValidation}>
                                <div className="mb-2">
                                    <label htmlFor="email" className="form-label mb-0">Email</label>
                                    <input type="email" className="form-control" name="email" id="email" placeholder="Enter your email address" onChange={handleInput} />
                                </div>
                                <button type="submit" name='submit' className="btn primary-btn w-100 mt-2">Continue</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword