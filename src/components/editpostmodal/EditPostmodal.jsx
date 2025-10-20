import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import "./EditPostmodal.css";
import PostJobSuccessmodal from "../postjobsuccessmodal/PostJobSuccessmodal";
import PaymentMethodmodal from "../paymentmethodmodal/PaymentMethodmodal";
import { getApiUrl } from "../../config.js";


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




const EditPostmodal = ({ formData, refreshJobs, selectedJob }) => {


  // Mock data for industries and subcategories (in case the API fails)
  const mockIndustries = [
    { id: 1, name: "Construction" },
    { id: 2, name: "Healthcare" },
    { id: 3, name: "Technology" },
    { id: 4, name: "Hospitality" },
    { id: 5, name: "Education" },
    { id: 6, name: "Transportation" },
    { id: 7, name: "Retail" }
  ];

  const mockSubcategories = [
    { id: 1, name: "Building", industry_id: 1 },
    { id: 2, name: "Plumbing", industry_id: 1 },
    { id: 3, name: "Electrical", industry_id: 1 },
    { id: 4, name: "Nursing", industry_id: 2 },
    { id: 5, name: "Medical Doctor", industry_id: 2 },
    { id: 6, name: "Web Development", industry_id: 3 },
    { id: 7, name: "Mobile App Development", industry_id: 3 },
    { id: 8, name: "Hotel Staff", industry_id: 4 },
    { id: 9, name: "Restaurant Staff", industry_id: 4 },
    { id: 10, name: "Teaching", industry_id: 5 },
    { id: 11, name: "Administration", industry_id: 5 },
    { id: 12, name: "Driver", industry_id: 6 },
    { id: 13, name: "Logistics", industry_id: 6 },
    { id: 14, name: "Sales Associate", industry_id: 7 },
    { id: 15, name: "Cashier", industry_id: 7 }
  ];

  const [industries, setIndustries] = useState(mockIndustries);
  const [subcategories, setSubcategories] = useState(mockSubcategories);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [usesMockData, setUsesMockData] = useState(false);

  const currentUserId = localStorage.getItem("user_id");

  // Set the selected industry based on the form data when it loads
  useEffect(() => {
    if (formData && formData.industry_id) {
      setSelectedIndustry(String(formData.industry_id));
    }
  }, [formData]);

  // Fetch job industries and subcategories on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await Axios.get(getApiUrl('/jobs/job-industries/'));
        if (response.data && response.data.length > 0) {
          setIndustries(response.data);
          setUsesMockData(false);
        } else {
          setUsesMockData(true);
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
        setUsesMockData(true);
      }
    };

    const fetchSubcategories = async () => {
      try {
        const response = await Axios.get(getApiUrl('/jobs/job-subcategories/'));

        if (response.data && response.data.length > 0) {
          setSubcategories(response.data);
        } else {
          console.warn("Subcategories API returned empty data, using mock data");
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchIndustries();
    fetchSubcategories();
  }, []);

  // Filter subcategories based on the selected industry
  const getFilteredSubcategories = () => {
    // If no industry is selected, return empty array
    if (!selectedIndustry) {
      return [];
    }

    // First try to filter by industry_id
    let filtered = subcategories.filter(
      (sub) => String(sub.industry_id) === selectedIndustry
    );

    // If that doesn't work, try filtering by industry.id if industry property exists
    if (filtered.length === 0) {
      filtered = subcategories.filter(
        (sub) => sub.industry && String(sub.industry.id) === selectedIndustry
      );
    }

    // If we still have no results, fall back to mock data for the selected industry
    if (filtered.length === 0 && usesMockData) {
      filtered = mockSubcategories.filter(
        (sub) => String(sub.industry_id) === selectedIndustry
      );
    }
    return filtered;
  };

  const filteredSubcategories = getFilteredSubcategories();

  return (
    <div
      className="modal fade come-from-modal right"
      id="editpostModal"
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
              Edit Job Request
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
            {
              formData &&
              <Formik
                initialValues={{
                  jobtitle: formData.title,
                  jobLocation: formData.location,
                  jobIndustry: formData.industry_id,
                  jobSubCategory: formData.subcategory,
                  jobRate: (() => {
                    // Defensive: check all required fields
                    if (!formData.rate || !formData.applicants_needed || !formData.start_time_str || !formData.end_time_str) return '';
                    const total = parseFloat(formData.rate);
                    const applicants = parseFloat(formData.applicants_needed);
                    if (!applicants) return '';
                    // Parse start and end time (HH:MM)
                    if (typeof formData.start_time_str !== 'string' || typeof formData.end_time_str !== 'string') return '';
                    const startParts = formData.start_time_str.split(":");
                    const endParts = formData.end_time_str.split(":");
                    if (startParts.length < 2 || endParts.length < 2) return '';
                    const [sh, sm] = startParts.map(Number);
                    const [eh, em] = endParts.map(Number);
                    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return '';
                    let start = sh * 60 + sm;
                    let end = eh * 60 + em;
                    let diff = end - start;
                    if (diff < 0) diff += 24 * 60; // handle overnight shifts
                    const hours = diff / 60;
                    if (!hours) return '';
                    const perHour = total / applicants / hours;
                    return perHour ? perHour.toFixed(2) : '';
                  })(),
                  noOfApplicants: formData.applicants_needed,
                  jobType: formData.job_type,
                  shiftType: formData.shift_type,
                  jobDate: formData.date,
                  startTime: formData.start_time_str,
                  endTime: formData.end_time_str,
                }}
                validationSchema={Schema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {


                  // Calculate total amount: jobRate * duration (in hours) * applicants_needed
                  const jobRate = parseFloat(values.jobRate || formData.rate) || 0;
                  const applicants = Math.max(1, Number(values.noOfApplicants || formData.applicants_needed)) || 1;
                  // Calculate duration in hours from start and end time
                  let hours = 0;
                  let minutes = 0;
                  if (values.startTime && values.endTime) {
                    const [sh, sm] = values.startTime.split(":").map(Number);
                    const [eh, em] = values.endTime.split(":").map(Number);
                    let start = sh * 60 + sm;
                    let end = eh * 60 + em;
                    let diff = end - start;
                    if (diff < 0) diff += 24 * 60; // handle overnight shifts
                    hours = Math.floor(diff / 60);
                    minutes = diff % 60;
                  }
                  const durationInHours = hours + minutes / 60;
                  const totalAmount = (jobRate * durationInHours * applicants).toFixed(2);

                  const jobData = {
                    job_id: formData.id,
                    user_id: Number(currentUserId),
                    title: values.jobtitle || formData.title,
                    location: values.jobLocation || formData.location,
                    industry: String(values.jobIndustry), // Backend expects a string
                    subcategory: values.jobSubCategory || formData.subcategory,
                    rate: totalAmount, // totalAmount is now the rate (total cost)
                    applicants_needed: applicants, // Ensure at least 1 applicant
                    job_type: values.jobType || formData.job_type,
                    shift_type: values.shiftType || formData.shift_type,
                    date: values.jobDate || formData.date, // Expected as 'YYYY-MM-DD'
                    start_time: values.startTime || formData.start_time_str, // Expected as 'HH:MM'
                    end_time: values.endTime || formData.end_time_str, // Expected as 'HH:MM'
                    pay_later: false,
                  };

                  try {
                    const response = await Axios.put(getApiUrl('/jobs/jobs/edit-job'), jobData);
                    // const modal = new bootstrap.Modal('#postJobSuccessmodal');
                    // modal.show(); // Show success modal
                    if (response.data.success) {
                      refreshJobs("Job updated successfully!");
                      resetForm();
                    }
                  } catch (error) {
                   console.error("Job update error:", error);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ errors, touched, isSubmitting, handleChange, setFieldValue, values }) => (
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
                          placeholder={formData.title}

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
                            placeholder={formData.location}

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
                        <Field name="jobIndustry" value={formData.industry_name} >
                          {({ field, form }) => (
                            <select
                              {...field}
                              id="jobIndustry"
                              className="form-control"
                              // value={formData.industry}
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
                        <Field name="jobSubCategory" value={formData.subcategory} >
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
                            placeholder={formData.rate}

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

                            placeholder= {formData.applicants_needed}
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

                            placeholder = {formData.job_type}
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
                            placeholder = {formData.shift_type}

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

                          // placeholder={formData.date}
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
                            // value={formData.start_time_str}

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
                            value={formData.end_time_str}
                            // placeholder={formData.end_time_str}
                          />
                          {touched.endTime && errors.endTime && (
                            <div className="errors">{errors.endTime}</div>
                          )}
                        </div>
                      </div>
                      {/* Job Duration Calculation */}
                      <p>
                        Job Duration: {
                          (() => {
                            // Helper to parse HH:MM to minutes
                            const parseTime = (t) => {
                              if (!t) return 0;
                              const [h, m] = t.split(":").map(Number);
                              return h * 60 + m;
                            };
                            const start = parseTime(values.startTime);
                            const end = parseTime(values.endTime);
                            let diff = end - start;
                            if (diff < 0) diff += 24 * 60; // handle overnight shifts
                            const hours = Math.floor(diff / 60);
                            const mins = diff % 60;
                            if (!values.startTime || !values.endTime) return "-";
                            if (diff === 0) return "0 hrs";
                            return `${hours > 0 ? hours + ' hr' + (hours > 1 ? 's' : '') : ''}${hours > 0 && mins > 0 ? ' ' : ''}${mins > 0 ? mins + ' min' + (mins > 1 ? 's' : '') : ''}`;
                          })()
                        } {errors.jobDuration}
                      </p>
                    </div>
                    <div className="row m-0 p-0">
                      <div className="col-4 px-1">
                        <button type="submit" className="btn preview-btn">
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

            }
          </div>
          <div className="modal-footer border-0"></div>
        </div>
      </div>
      <PostJobSuccessmodal />
      {/* <PaymentMethodmodal /> */}
    </div>
  );
};

export default EditPostmodal;
