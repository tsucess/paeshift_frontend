import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import "./Postmodal.css";
import PostJobSuccessmodal from "../postjobsuccessmodal/PostJobSuccessmodal";
import PaymentMethodmodal from "../paymentmethodmodal/PaymentMethodmodal";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useRef } from "react";

// Validation schema for form fields
const Schema = Yup.object().shape({
  jobtitle: Yup.string().min(2, "Too short!").required("Required"),
  jobLocation: Yup.string().min(2, "Too short!").required("Required"),
  jobIndustry: Yup.string().required("Required"),
  jobSubCategory: Yup.string().required("Required"),
  jobRate: Yup.number().required("Required"),
  noOfApplicants: Yup.number().required("Required"),
  jobType: Yup.string().required("Required"),
  shiftType: Yup.string().required("Required"),
  jobDate: Yup.string().required("Required"),
  startTime: Yup.string().required("Required"),
  endTime: Yup.string().required("Required"),
});


const libraries = ['places']; // Only load the places library

const Postmodal = () => {
  const [industries, setIndustries] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const locationRef = useRef(null);
  const currentUserId = localStorage.getItem("user_id");


  const [isLoaded, setIsLoaded] = useState(false);


  const onLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = (setFieldValue) => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        console.log("No details available for input: '" + place.name + "'");
        return;
      }
      const address = place.formatted_address;
      const coordinates = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      
      setFieldValue("jobLocation", address);
      setFieldValue("latitude", coordinates.lat);
      setFieldValue("longitude", coordinates.lng); 
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: "google-maps-script",
    // googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
    onLoad: () => {
      setIsLoaded(true);
    },  

    if (loadError) {
      console.error("Google Maps loading error:", loadError);
    }
    
  });
  
  useEffect(() => {
    setIsLoaded(mapsLoaded);
  }, [mapsLoaded]);
  if (!isLoaded) {
    return <div className="loading-maps">Loading Google Maps...</div>;
  }
  
  // Fetch job industries and subcategories on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await Axios.get(`${import.meta.env.VITE_API_BASE_URL}/jobs/job-industries/`);
        setIndustries(response.data);
      } catch (error) {
        console.error("Error fetching industries:", error);
      }
    };

    const fetchSubcategories = async () => {
      try {
        const response = await Axios.get(`${import.meta.env.VITE_API_BASE_URL}/jobs/job-subcategories/`);
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
                latitude: "",
                longitude: ""
              }}
              validationSchema={Schema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {


                // Map form fields to backend payload
                const jobData = {
                  user_id: currentUserId, // Ensure the client_id is included from the form data
                  title: values.jobtitle,
                  location: values.jobLocation,
                  industry: values.jobIndustry, // Sending the industry name as expected by the backend
                  subcategory: values.jobSubCategory, // Sending the subcategory name as expected by the backend
                  rate: parseFloat(values.jobRate).toFixed(2),
                  applicants_needed: Number(values.noOfApplicants),
                  job_type: values.jobType,
                  shift_type: values.shiftType,
                  date: values.jobDate, // Expected as 'YYYY-MM-DD'
                  start_time: values.startTime, // Expected as 'HH:MM'
                  end_time: values.endTime, // Expected as 'HH:MM'
                  duration: "2hrs", // Fixed value
                  payment_status: "Pending", // Fixed value
                };

                console.log("Job data:", jobData);
                try {
                  const response = await Axios.post(`${import.meta.env.VITE_API_BASE_URL}/jobs/create-job`, jobData);
                  console.log(response.data);
                  // const modal = new bootstrap.Modal('#postJobSuccessmodal');
                  // modal.show(); // Show success modal
                  if (response.data.success) {
                    alert("Job created successfully!");
                  }
                  resetForm();
                } catch (error) {
                  console.error("Job creation error:", error);
                  // alert(
                  //   "Job Creation Failed: " +
                  //   (error.response?.data?.error) // "An unexpected error occurred."
                  // );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ errors, touched, isSubmitting, handleChange, setFieldValue }) => (
                <Form className="post_form" id="post_form">
                  <div className="row form_row">
                    {/* Job Title */}



{/* Job Location */}
<div className="col-12 col-md-6 mb-2">
  <label htmlFor="jobLocation" className="form-label mb-0">
    Where will the job take place?
  </label>
  <span className="location">
    {isLoaded ? (
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={() => onPlaceChanged(setFieldValue)}
        fields={['formatted_address', 'geometry.location']}
      >
        <input
          type="text"
          name="jobLocation"
          id="jobLocation"
          className="form-control"
          placeholder="Location"
          ref={locationRef}
          onChange={(e) => setFieldValue("jobLocation", e.target.value)}
        />
      </Autocomplete>
    ) : (
      <Field
        name="jobLocation"
        className="form-control"
        placeholder="Location"
      />
    )}
    <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
  </span>
  {touched.jobLocation && errors.jobLocation && (
    <div className="errors">{errors.jobLocation}</div>
  )}
</div>
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
                    {/* Job Location */}
                    <div className="col-12 col-md-6 mb-2">
                      <label htmlFor="jobLocation" className="form-label mb-0">
                        Where will the job take place?
                      </label>
                      <span className="location">
                        <Field
                          name="jobLocation"
                          id="jobLocation"
                          className="form-control"
                          placeholder="Location"
                          ref={locationRef}
                          onChange={(e) => setFieldValue("jobLocation", e.target.value)}
                        />
                        <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
                      </span>
                      {touched.jobLocation && errors.jobLocation && (
                        <div className="errors">{errors.jobLocation}</div>
                      )}
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
                          <option value="morning">Morning Shift (6AM - 2PM)</option>
                          <option value="afternoon">Day Shift (2AM - 8PM)</option>
                          <option value="night">Night Shift (8PM - 6AM)</option>
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
                    <p>Job Duration: 2hrs {errors.jobDuration}</p>
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
                        data-bs-toggle="modal" data-bs-target="#paymentMethodModal"
                      >
                        {isSubmitting ? "Submitting..." : "Proceed to Payment"}
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <div className="modal-footer border-0"></div>
        </div>
      </div>
      <PostJobSuccessmodal />
      {/* <PaymentMethodmodal /> */}
    </div>
  );
};

export default Postmodal;