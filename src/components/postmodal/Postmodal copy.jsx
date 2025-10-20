import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, useField, useFormikContext } from "formik";
import * as Yup from "yup";
import Axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import "./Postmodal.css";
// import PostJobSuccessmodal from "../postjobsuccessmodal/PostJobSuccessmodal";
import PaymentMethodmodal from "../paymentmethodmodal/PaymentMethodmodal";
import * as bootstrap from 'bootstrap';
import { API_BASE_URL } from "../../config"; // Import API_BASE_URL

// Validation schema for form fields
const Schema = Yup.object().shape({
  jobtitle: Yup.string().min(2, "Too short!").required("Required"),
  jobLocation: Yup.string().min(2, "Too short!").required("Required"), // <-- UNCOMMENT THIS
  jobIndustry: Yup.string().required("Required"),
  jobSubCategory: Yup.string().required("Required"),
  jobRate: Yup.number().min(2000, "Minimum rate is 2000").required("Required"),
  noOfApplicants: Yup.number().min(1, "Must be at least 1").required("Required"),
  jobType: Yup.string().required("Required"),
  shiftType: Yup.string().required("Required"),
  jobDate: Yup.string().required("Required"),
  startTime: Yup.string().required("Required"),
  endTime: Yup.string().required("Required"),
});


const libraries = ['places']; // Only load the places library

const GooglePlacesField = ({ name, autoRef }) => {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();

  useEffect(() => {
    const el = autoRef.current;
    // if (!el) return;
    const handler = (e) => {
      // const place = e.detail;
      const place = e.getPlaces();
      if (place && place.formatted_address) {
        setFieldValue(name, place.formatted_address);
        setFieldTouched(name, true);
        // Log the value whenever it changes
        console.log("jobLocation changed:", place.formatted_address);
      }
    };
    el.addEventListener("gmp-placeautocomplete-placeview", handler);
    return () => el.removeEventListener("gmp-placeautocomplete-placeview", handler);
  }, [autoRef, name, setFieldValue, setFieldTouched]);

  return (
    <>
      <gmp-place-autocomplete
        ref={autoRef}
        id={name}
        name="jobLocation"
        className="form-control"
        placeholder="Location"
        componentrestrictions='{"country": ["ng"]}'
      ></gmp-place-autocomplete>
      {meta.touched && meta.error && (
        <div className="errors">{meta.error}</div>
      )}
    </>
  );
};

const Postmodal = ({ setOutJobData }) => {
  const [industries, setIndustries] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const autoRef = useRef(null); // <-- Move ref here

  const currentUserId = localStorage.getItem("user_id");



  // Fetch job industries and subcategories on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await Axios.get(`${API_BASE_URL}/jobs/job-industries/`);
        setIndustries(response.data);
      } catch (error) {
        console.error("Error fetching industries:", error);
      }
    };

    const fetchSubcategories = async () => {
      try {
        const response = await Axios.get(`${API_BASE_URL}/jobs/job-subcategories/`);
        setSubcategories(response.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchIndustries();
    fetchSubcategories();
  }, []);



  // Filter subcategories based on the selected industry
  const filteredSubcategories = subcategories.filter(
    (sub) => String(sub.industry_id) === selectedIndustry
  );

  return (
    <div
      className="modal fade come-from-modal right"
      id="postModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              Create Job Request
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body mb-0 pb-0">
            <div className="title">
              <span>1/2</span>
              <h3>Let’s start with main details</h3>
              <p>This will help your job posts stand out to the right applicants.</p>
            </div>
            <Formik
              initialValues={{
                jobtitle: "",
                jobLocation: "",
                jobIndustry: "",
                jobSubCategory: "",
                jobRate: "",
                noOfApplicants: "",
                jobType: "",
                shiftType: "",
                jobDate: "",
                startTime: "",
                endTime: "",
              }}
              validationSchema={Schema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                console.log("onSubmit called"); // Add this


                // Map form fields to backend payload
                // Calculate total amount: jobRate * duration (in hours) * applicants_needed
                const jobRate = parseFloat(values.jobRate) || 0;
                const applicants = Math.max(1, Number(values.noOfApplicants)) || 1;
                // Parse jobDuration (e.g., "2 hrs 30 min", "1 hr", "45 min")
                let hours = 0;
                let minutes = 0;
                if (values.jobDuration && typeof values.jobDuration === 'string') {
                  const hrMatch = values.jobDuration.match(/(\d+)\s*hr/);
                  const minMatch = values.jobDuration.match(/(\d+)\s*min/);
                  if (hrMatch) hours = parseInt(hrMatch[1], 10);
                  if (minMatch) minutes = parseInt(minMatch[1], 10);
                }
                const durationInHours = hours + minutes / 60;
                const totalAmount = (jobRate * durationInHours * applicants).toFixed(2);



                const jobData = {
                  user_id: currentUserId, // Ensure the client_id is included from the form data
                  title: values.jobtitle,
                  location: values.jobLocation,
                  industry: values.jobIndustry, // Sending the industry name as expected by the backend
                  subcategory: values.jobSubCategory, // Sending the subcategory name as expected by the backend
                  rate: totalAmount,
                  applicants_needed: applicants, // Ensure at least 1 applicant
                  job_type: values.jobType,
                  shift_type: values.shiftType,
                  date: values.jobDate, // Expected as 'YYYY-MM-DD'
                  start_time: values.startTime, // Expected as 'HH:MM'
                  end_time: values.endTime, // Expected as 'HH:MM'
                  duration: values.jobDuration || "--",
                  payment_status: "Pending", // Fixed value
                  // total_amount: totalAmount,
                  // pay_later: values.payLater, // Include the pay_later flag
                };

                console.log("Job data:", jobData); // Existing log

                // First, store the job data for the payment modal
                // setOutJobData(jobData);

                try {
                  // First create the job
                  const response = await Axios.post(`${API_BASE_URL}/jobs/jobs/create-job`, jobData, {
                    headers: {
                      'Content-Type': 'application/json',
                    }
                  });
                  console.log("After Job created successfully", response.data);
                  console.log(response);

                  if (response.data.success) {
                    // Store the job data with the job_id from the response for payment
                    const jobWithId = {
                      ...jobData,
                      id: response.data.id,
                      rate: parseFloat(values.jobRate).toFixed(2), // Ensure rate is included for payment
                      total_amount: response.data.total_amount || parseFloat(values.jobRate).toFixed(2),
                      service_fee: response.data.service_fee || (parseFloat(values.jobRate) * 0.1).toFixed(2)
                    };
                    setOutJobData(jobWithId);

                    // Check if payment is required immediately

                    // Show success message and proceed to payment
                    // alert("Job created successfully! Proceed to payment.");

                    // Open the payment modal
                    const paymentModal = new bootstrap.Modal(document.getElementById('paymentMethodModal'));
                    paymentModal.show();

                  }
                } catch (error) {
                  console.error("Job creation error:", error);
                  alert(
                    "Job Creation Failed: " +
                    (error.response?.data?.error || "An unexpected error occurred.")
                  );
                 
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ errors, touched, isSubmitting, handleChange, setFieldValue, values }) => {
                // Listen for the custom event and update Formik
                useEffect(() => {
                  const handler = (e) => {
                    setFieldValue("jobLocation", e.detail);
                  };
                  window.addEventListener("location-selected", handler);
                  return () => window.removeEventListener("location-selected", handler);
                }, [setFieldValue]);

                return (
                  <Form className="post_form" id="post_form">
                    <div className="row form_row">
                      {/* Job Title */}
                      <div className="col-12 col-md-6 mb-2">
                        <label htmlFor="jobtitle" className="form-label mb-0">
                          Write a title for your Job
                        </label>
                        <Field
                          name="jobtitle"
                          className="form-control"
                          placeholder="30 letters Max"
                        />
                        {touched.jobtitle && errors.jobtitle && (
                          <div className="errors">{errors.jobtitle}</div>
                        )}
                      </div>
                      {/* Job Location with Google Places Autocomplete */}
                      <div className="col-12 col-md-6 mb-2 ">
                        <label htmlFor="jobLocation" className="form-label mb-0">
                          Where will the job take place?
                        </label>
                        <GooglePlacesField name="jobLocation" autoRef={autoRef} />
                      </div>
                      {/* Job Industry (dynamic) */}
                      <div className="col-12 mb-2">
                        <label htmlFor="jobIndustry" className="form-label mb-0">
                          Job Industry
                        </label>
                        <Field name="jobIndustry">
                          {({ field, form }) => (
                            <select
                              {...field}
                              id="jobIndustry"
                              className="form-control"
                              onChange={(e) => {
                                form.handleChange(e);
                                setSelectedIndustry(e.target.value);
                                // Reset subcategory when industry changes
                                form.setFieldValue("jobSubCategory", "");
                              }}
                            >
                              <option value="">Select Job industry</option>
                              {industries.map((industry) => (
                                <option key={industry.id} value={industry.id}>
                                  {industry.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </Field>
                        {touched.jobIndustry && errors.jobIndustry && (
                          <div className="errors">{errors.jobIndustry}</div>
                        )}
                      </div>
                      {/* Job Subcategory (filtered by selected industry) */}
                      <div className="col-12 mb-2">
                        <label htmlFor="jobSubCategory" className="form-label mb-0">
                          Sub Category
                        </label>
                        <Field name="jobSubCategory">
                          {({ field }) => (
                            <select {...field} id="jobSubCategory" className="form-control">
                              <option value="">Select Subcategory</option>
                              {filteredSubcategories.map((subcategory) => (
                                <option key={subcategory.id} value={subcategory.name}>
                                  {subcategory.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </Field>
                        {touched.jobSubCategory && errors.jobSubCategory && (
                          <div className="errors">{errors.jobSubCategory}</div>
                        )}
                      </div>
                      {/* Job Rate and Applicants Needed */}
                      <div className="row m-0 mb-2 p-0">
                        <div className="col-6 form-group">
                          <label htmlFor="jobRate" className="form-label mb-0">
                            Job rate per hour
                          </label>
                          <Field
                            type="number"
                            id="jobRate"
                            name="jobRate"
                            className="form-control"
                          />
                          {touched.jobRate && errors.jobRate && (
                            <div className="errors">{errors.jobRate}</div>
                          )}
                        </div>
                        <div className="col-6">
                          <label htmlFor="noOfApplicants" className="form-label mb-0">
                            Applicants Needed
                          </label>
                          <Field
                            type="number"
                            id="noOfApplicants"
                            name="noOfApplicants"
                            className="form-control"
                          />
                          {touched.noOfApplicants && errors.noOfApplicants && (
                            <div className="errors">{errors.noOfApplicants}</div>
                          )}
                        </div>
                      </div>
                      {/* Second part of the form */}
                      <div className="title">
                        <span>2/2</span>
                        <h3>Estimate the Timeline/Scope of your job</h3>
                        <p>
                          This information helps us recommend the right applicant for your
                          job.
                        </p>
                      </div>
                      <div className="row m-0 mb-2 p-0">
                        <div className="col-6">
                          <label htmlFor="jobType" className="form-label mb-0">
                            Type of Job
                          </label>
                          <Field
                            as="select"
                            name="jobType"
                            id="jobType"
                            className="form-control"
                          >
                            <option value="">Select job type</option>
                            <option value="single_day">A day job</option>
                            <option value="multiple_days">Multiple</option>
                          </Field>
                          {touched.jobType && errors.jobType && (
                            <div className="errors">{errors.jobType}</div>
                          )}
                        </div>
                        <div className="col-6">
                          <label htmlFor="shiftType" className="form-label mb-0">
                            Type of Shift
                          </label>
                          <Field
                            as="select"
                            name="shiftType"
                            id="shiftType"
                            className="form-control"
                          >
                            <option value="">Select shift type</option>
                            <option value="morning">Morning Shift (6AM - 12PM)</option>
                            <option value="afternoon">Day Shift (12PM - 4PM)</option>
                            <option value="night">Night Shift (4PM - 11pm)</option>
                          </Field>
                          {touched.shiftType && errors.shiftType && (
                            <div className="errors">{errors.shiftType}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-12 mb-2">
                        <label htmlFor="jobDate" className="form-label mb-0">
                          Job Date
                        </label>
                        <Field
                          type="date"
                          name="jobDate"
                          id="jobDate"
                          className="form-control"
                          min={new Date().toISOString().split('T')[0]} // This sets min to today
                        />
                        {touched.jobDate && errors.jobDate && (
                          <div className="errors">{errors.jobDate}</div>
                        )}
                      </div>
                      <div className="row m-0 mb-2 p-0">
                        <div className="col-6">
                          <label htmlFor="startTime" className="form-label mb-0">
                            Start Time:
                          </label>
                          <Field
                            type="time"
                            name="startTime"
                            id="startTime"
                            className="form-control"
                          />
                          {touched.startTime && errors.startTime && (
                            <div className="errors">{errors.startTime}</div>
                          )}
                        </div>
                        <div className="col-6">
                          <label htmlFor="endTime" className="form-label mb-0">
                            End Time:
                          </label>
                          <Field
                            type="time"
                            name="endTime"
                            id="endTime"
                            className="form-control"
                          />
                          {touched.endTime && errors.endTime && (
                            <div className="errors">{errors.endTime}</div>
                          )}
                        </div>
                      </div>
                      <Field name="jobDuration">
                        {({ field, form }) => {
                          // Calculate duration whenever startTime or endTime changes
                          useEffect(() => {
                            const { startTime, endTime } = values;
                            let durationStr = "--";
                            if (startTime && endTime) {
                              const [sh, sm] = startTime.split(":").map(Number);
                              const [eh, em] = endTime.split(":").map(Number);
                              const start = new Date(0, 0, 0, sh, sm);
                              const end = new Date(0, 0, 0, eh, em);
                              let diff = (end - start) / (1000 * 60); // difference in minutes
                              if (diff < 0) diff += 24 * 60; // handle overnight shifts
                              const hours = Math.floor(diff / 60);
                              const minutes = diff % 60;
                              if (diff === 0) durationStr = "0 min";
                              else if (hours && minutes) durationStr = `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`;
                              else if (hours) durationStr = `${hours} hr${hours > 1 ? 's' : ''}`;
                              else durationStr = `${minutes} min`;
                            }
                            if (form.values.jobDuration !== durationStr) {
                              form.setFieldValue("jobDuration", durationStr);
                            }
                          }, [values.startTime, values.endTime]);
                          return (
                            <p>
                              Job Duration: {field.value || "--"}
                            </p>
                          );
                        }}
                      </Field>
                    </div>
                    <div className="row m-0 p-0">
                      <div className="col-4 px-1">
                        <button type="button" className="btn preview-btn">
                          Preview
                        </button>
                      </div>
                      <div className="col-8">
                        <button
                          type="submit"
                          className="btn proceed-btn"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : "Proceed to Payment"}
                        </button>
                        {/* <button
                          type="submit"
                          className="btn proceed-btn"
                          data-bs-toggle="modal" data-bs-target="#paymentMethodModal"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : "Proceed to Payment"}
                        </button> */}
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
          <div className="modal-footer border-0"></div>
        </div>
      </div>

      {/* <PaymentMethodmodal currentProfile={{first_name: "", last_name: "", phone_number: ""}} paymentJobData={{rate: 0, user_id: "", job_id: ""}} /> */}
    </div>
  );
};

export default Postmodal;
