import React, { useState } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom";
import brandLogo from "../assets/images/logo-sm.png";
import successIcon from "../assets/images/success.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronLeft, faCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import { useParams } from "react-router";
import "../assets/css/style.css";


import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import { ToastContainer, toast, Bounce } from 'react-toastify';
import { apiService } from "../services/api.js";
// import { faChevronLeft, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import swal from 'sweetalert';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'



const AppSwal = withReactContent(Swal);

const Schema = Yup.object().shape({
  firstName: Yup.string().required("Required").min(2, "Too short!").required("Required"),
  lastName: Yup.string().required("Required").min(2, "Too short!").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Must Contain 8 Characters").max(50, "Too Long!").required("Required")
    .matches(/^(?=.*[a-z])/, "Must Contain One Lowercase Character")
    .matches(/^(?=.*[A-Z])/, "Must Contain One Uppercase Character")
    .matches(/^(?=.*[0-9])/, "Must Contain One Number Character")
    .matches(/^(?=.*[!@#\$%\^&\*])/, "Must Contain  One Special Case Character"),
  confirmPassword: Yup.string().min(6, "Too Short!").max(50, "Too Long!").required("Required")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});


const Signup = () => {
  let redir = useNavigate();
  const roleValue = useParams();

  let [show, setShow] = useState('password');
  let [show1, setShow1] = useState('password');

  return (
    <div className="row m-0 px-2 signup_wrapper animate__animated animate__fadeIn">
      <div className="col-12 col-md-4 main-card animate__animated animate__zoomIn">
        <div className="col-12 bg-card-2"></div>
        <div className="col-12 bg-card-3"></div>
        <div className="bg-card">
          <div>
            {/* <ToastContainer /> */}

          </div>
          <div className="row">
            <div className="col-3">
              <Link to="/welcome" className='text-dark'>
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
                <h3>Sign Up</h3>
                <p>Kindly provide us with your details to create new account</p>
                <Formik
                  initialValues={{
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "",

                  }}

                  validationSchema={Schema}
                  onSubmit={async (values) => {

                    let userdata = {
                      first_name: values.firstName,
                      last_name: values.lastName,
                      email: values.email,
                      role: roleValue.role,
                      password: values.confirmPassword
                    };

                    console.log(userdata);

                    try {
                      // Direct signup - let backend handle email uniqueness validation
                      const response = await apiService.signup(userdata);
                      console.log("Signup response:", response.data);

                      // Check if verification is required
                      if (response.data.requires_verification) {
                        AppSwal.fire({
                          title: "Account created successfully. Please verify your email.",
                          imageUrl: successIcon,
                          imageWidth: 80,
                          imageHeight: 80,
                          imageAlt: "Success",
                          showConfirmButton: false,
                          timer: 2000,
                          customClass: {
                            image: 'swal-custom-image'
                          }
                        });

                        // Redirect to verification page with email and verification type
                        setTimeout(() => {
                          redir("/verify", {
                            state: {
                              email: values.email,
                              verificationType: response.data.verification_type || "registration"
                            }
                          });
                        }, 2000);
                      }
                      else if (response.data.message === "success") {
                        swal("Registration Successful!", " ", "success", { button: false, timer: 1500 });
                        setTimeout(() => {
                          redir("../signin");
                        }, 1500);
                      }
                      else {
                        swal("Registration Failed!", response.data.error || "Something went wrong", "error");
                      }
                    } catch (error) {
                      console.error("Signup error:", error);

                      // Extract error message from different possible response formats
                      let errorMessage = "Network error occurred";
                      if (error.response?.data?.error) {
                        errorMessage = error.response.data.error;
                      } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                      } else if (error.message) {
                        errorMessage = error.message;
                      }

                      swal("Registration Failed!", errorMessage, "error");
                    }

                  }
                  }
                >
                  {({ errors, touched }) => (
                    <Form className="signup_form">
                      <div>
                        <label htmlFor="firstName" className="form-label mb-0">First Name:</label>
                        <Field name="firstName" className="form-control" />
                        {/* If this field has been touched, and it contains an error, display it */}
                        {touched.firstName && errors.firstName && (<div className="errors">{errors.firstName}</div>)}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="form-label mb-0">Last Name:</label>
                        <Field name="lastName" className="form-control" />
                        {touched.lastName && errors.lastName && (<div className="errors">{errors.lastName}</div>)}
                      </div>
                      <div>
                        <label htmlFor="email" className="form-label mb-0">Email:</label>
                        <Field name="email" className="form-control" />
                        {touched.email && errors.email && (<div className="errors">{errors.email}</div>)}
                      </div>
                      <div>
                        <label htmlFor="password" className="form-label mb-0">Create Password:</label>
                        <span className="visibility">
                          <Field type={show} name="password" id="password" className="form-control" />
                          <FontAwesomeIcon icon={show === "password" ? faEye : faEyeSlash} onClick={() => setShow(show === "password" ? "text" : "password")} className='eye-icon' />
                        </span>
                        {touched.password && errors.password && (<div className="errors">{errors.password}</div>)}
                      </div>
                      <div >
                        <label htmlFor="confrimPassword" className="form-label mb-0">Confirm Password:</label>
                        <span className="visibility">
                          <Field type={show1} name="confirmPassword" id="confirmPassword" className="form-control" />
                          <FontAwesomeIcon icon={show1 === "password" ? faEye : faEyeSlash} onClick={() => setShow1(show1 === "password" ? "text" : "password")} className='eye-icon' />
                        </span>
                        {touched.confirmPassword && errors.confirmPassword && (<div className="errors">{errors.confirmPassword}</div>)}
                      </div>
                      <button type="submit" name='submit' className="btn primary-btn w-100 mt-2">Sign Up</button>
                      <p className="mt-3">Already have an account? <Link to="/signin">Login</Link></p>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup