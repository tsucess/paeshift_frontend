import React, { useEffect, useState } from "react";
import { Formik, Form, Field, useFormikContext } from "formik";
import * as Yup from "yup";
import Axios from "axios";
// import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api'
// import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { API_BASE_URL } from "../../config";

import "./Postmodal.css";
// import PostJobSuccessmodal from "../postjobsuccessmodal/PostJobSuccessmodal";
import PaymentMethodmodal from "../paymentmethodmodal/PaymentMethodmodal";
import * as bootstrap from 'bootstrap';

// Validation schema for form fields
const Schema = Yup.object().shape({
  jobtitle: Yup.string().min(2, "Too short!").required("Required"),
  // jobLocation: Yup.string().min(2, "Too short!").required("Required"), // <-- UNCOMMENT THIS
  jobIndustry: Yup.string().required("Required"),
  jobSubCategory: Yup.string().required("Required"),
  jobRate: Yup.number().min(2000, "Minimum rate is 2000").required("Required"),
  noOfApplicants: Yup.number().min(1, "Must be at least 1").required("Required"),
  jobType: Yup.string().required("Required"),
  shiftType: Yup.string().required("Required"),
  jobStartDate: Yup.string().required("Required"),
  jobEndDate: Yup.string().required("Required"),
  startTime: Yup.string().required("Required"),
  endTime: Yup.string().required("Required"),
});

const libraries = ['places']; // Only load the places library



const Postmodal = ({ setOutJobData }) => {

  const [industries, setIndustries] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);

  const [address, setAddress] = useState("");
  const [place, setPlace] = useState("");



  const handleChangeAddress = (address) => {
    setAddress(address);
  }

  const handleSelect = async (selectedAddress) => {
    setAddress(selectedAddress);
    try {
      const results = await geocodeByAddress(selectedAddress)

      const latLng = await getLatLng(results[0])
      const placesDetails = {
        name: results[0].formatted_address,
        formatted_address: results[0].formatted_address,
        place_id: results[0].place_id,
        geometry: {
          location: {
            lat: latLng.lat,
            lng: latLng.lng
          }
        }
      }
      setPlace(placesDetails);
    } catch (error) {

    }
  }




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

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = (setFieldValue) => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      setFieldValue("jobLocation", place.formatted_address || "");
      // Optionally, you can also get lat/lng:
      // const lat = place.geometry?.location?.lat();
      // const lng = place.geometry?.location?.lng();
    }
  };

  // Utility function for job duration calculation
  function calculateJobDuration(startTime, endTime) {
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
    return durationStr;
  }

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
                jobStartDate: "",
                jobEndDate: "",
                startTime: "",
                endTime: "",
              }}
              validationSchema={Schema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {


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
                  location: address,
                  industry: values.jobIndustry, // Sending the industry name as expected by the backend
                  subcategory: values.jobSubCategory, // Sending the subcategory name as expected by the backend
                  rate: totalAmount, // totalAmount is now the rate (total cost)
                  applicants_needed: applicants, // Ensure at least 1 applicant
                  job_type: values.jobType,
                  shift_type: values.shiftType,
                  start_date: values.jobStartDate, // Expected as 'YYYY-MM-DD'
                  end_date: values.jobEndDate, // Expected as 'YYYY-MM-DD'
                  start_time: values.startTime, // Expected as 'HH:MM'
                  end_time: values.endTime, // Expected as 'HH:MM'
                  duration: values.jobDuration || "--",
                  payment_status: "Pending", // Fixed value
                  // total_amount: totalAmount,
                  // pay_later: values.payLater, // Include the pay_later flag
                };

                // First, store the job data for the payment modal
                // setOutJobData(jobData);

                try {
                  // First create the job
                  const response = await Axios.post(`${API_BASE_URL}/jobs/jobs/create-job`, jobData, {
                    headers: {
                      'Content-Type': 'application/json',
                    }
                  });

                  if (response.data.success) {
                    // Store the job data with the job_id from the response for payment
                    const jobWithId = {
                      ...jobData,
                      id: response.data.id,
                      rate: parseFloat(response.data.rate).toFixed(2), // Ensure rate is included for payment
                      total_amount: response.data.total_amount,
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

                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ errors, touched, isSubmitting, handleChange, setFieldValue, values, isValid }) => {
                // Listen for the custom event and update Formik


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
                        {/* <GooglePlacesAutocomplete
                          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} 
                        /> */}


                        <PlacesAutocomplete
                          value={address}
                          onChange={handleChangeAddress}
                          onSelect={handleSelect}
                          name="jobLocation"
                        >
                          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                            <div>
                              <Field
                                id="jobLocation"
                                {...getInputProps({
                                  placeholder: 'Enter your job location',
                                  className: 'form-control',
                                })}
                              />
                              <div className="autocomplete-dropdown">
                                {loading && <div>Loading...</div>}
                                {suggestions.map((suggestion) => (
                                  <div
                                    key={suggestion.placeId}
                                    {...getSuggestionItemProps(suggestion)}
                                    className="suggestion-item"
                                  >
                                    {suggestion.description}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </PlacesAutocomplete>

                        {/* {touched.jobLocation && errors.jobLocation && (
                          <div className="errors">{errors.jobLocation}</div>
                        )} */}
                        {/* <GooglePlacesField name="jobLocation" autoRef={autoRef} onChange={handler}  /> */}
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
                      <div className="row m-0 mb-2 p-0">
                        <div className="col-6">
                          <label htmlFor="jobStartDate" className="form-label mb-0">
                            Job Start Date
                          </label>
                          <Field
                            type="date"
                            name="jobStartDate"
                            id="jobStartDate"
                            className="form-control"
                            min={new Date().toISOString().split('T')[0]} // This sets min to today
                          />
                          {touched.jobStartDate && errors.jobStartDate && (
                            <div className="errors">{errors.jobStartDate}</div>
                          )}
                        </div>
                        <div className="col-6">
                          <label htmlFor="jobEndDate" className="form-label mb-0">
                            Job End Date
                          </label>
                          <Field
                            type="date"
                            name="jobEndDate"
                            id="jobEndDate"
                            className="form-control"
                            min={new Date().toISOString().split('T')[0]} // This sets min to today
                          />
                          {touched.jobEndDate && errors.jobEndDate && (
                            <div className="errors">{errors.jobEndDate}</div>
                          )}
                        </div>
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
                          useEffect(() => {
                            const durationStr = calculateJobDuration(values.startTime, values.endTime);
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
                          disabled={isSubmitting || !isValid}
                        >
                          {isSubmitting ? "Submitting..." : "Proceed to Payment"}
                        </button>
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
