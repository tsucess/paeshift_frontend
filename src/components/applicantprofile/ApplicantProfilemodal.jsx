import React, { useState, useEffect } from "react";
import Stars from "../../assets/images/stars.png";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBookmark } from "@fortawesome/free-regular-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import { apiService } from "../../services/api";
import ProfileImage from "../../assets/images/profile.png"
import "./ApplicantProfilemodal.css";

import { ToastContainer } from 'react-toastify';
import { showSuccessToast, toastContainerProps } from '../../utils/toastConfig';
import { API_BASE_URL } from "../../config";

import timeToSeconds from "../../auth/timeToSeconds";
import ConvertHoursToTime from "../../auth/ConvertHoursToTime";

// import { JobsData } from "./JobsData";

const ApplicantProfilemodal = ({ applicantData, savedJob, applicantId, onApplicationStatusChange }) => {

  const [toggle, setToggle] = useState(1);
  const [applicantDetails, setApplicantDetails] = useState(null);
  const [JobsData, setApplicantJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Initialize as object for status
  const [applicantStatus, setApplicantStatus] = useState({});

  // Separate loading and error states
  const [applicantLoading, setApplicantLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [applicantError, setApplicantError] = useState(null);
  const [jobsError, setJobsError] = useState(null);

  // Reviews state - moved to top with other state declarations
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  function updateToggle(id) {
    setToggle(id);
  }
  const jobId = applicantData.id;
  const currentUserId = localStorage.getItem("user_id");
  const currentUserRole = localStorage.getItem("user_role");



  const notifySuccess = (message) => {
    return showSuccessToast(message);
  };
  // const notifyError = (message) => toast.error(message, {
  //   position: "top-center",
  //   autoClose: 500,
  //   hideProgressBar: false,
  //   closeOnClick: false,
  //   pauseOnHover: true,
  //   draggable: true,
  //   progress: undefined,
  //   theme: "light",
  //   transition: Bounce,
  // });





  useEffect(() => {
    if (applicantId) {
      setApplicantLoading(true);
      setApplicantError(null);
      setJobsLoading(true);
      setJobsError(null);
      setReviewsLoading(true);
      setReviewsError(null);

      // Fetch applicant details
      Axios.get(`${API_BASE_URL}/accountsapp/whoami/${applicantId}`)
        .then((response) => {
          setApplicantDetails(response.data);
          setApplicantLoading(false);
        })
        .catch((error) => {
          setApplicantError(error?.response?.data?.detail || "Failed to load applicant details.");
          setApplicantLoading(false);
        });

      // Fetch jobs
      Axios.get(`${API_BASE_URL}/jobs/applicants/applicantjobs/${applicantId}`)
        .then((response) => {
          const jobs = response.data?.jobs_applied || [];
          const jobsWithDuration = jobs.map(job => {
            try {
              const jobStarts = timeToSeconds(job.start_time_str);
              const jobEnds = timeToSeconds(job.end_time_str);
              const duration = ((jobEnds - jobStarts) / 60) / 60;
              return { ...job, duration };
            } catch (err) {
              return { ...job, duration: 0 };
            }
          });
          setApplicantJobs(jobsWithDuration);
          setJobsLoading(false);
        })
        .catch((error) => {
          setJobsError(error?.response?.data?.detail || "Failed to load jobs. Please try again later.");
          setJobsLoading(false);
        });

      // Fetch reviews
      fetchReviews(applicantId);

      // Fetch application status
      Axios.get(`${API_BASE_URL}/jobs/application/status/${jobId}/${applicantId}/`)
        .then((response) => {
          setApplicantStatus(response.data);
        })
        .catch(error => console.error(error));
    }
  }, [applicantId, API_BASE_URL, jobId]); // <-- Fix: add applicantId as dependency

  // Refetch all data when modal is shown
  useEffect(() => {
    const modalElement = document.getElementById('applicantProfileModal');
    if (!modalElement) return;

    const handleModalShow = () => {
      // Refetch all data when modal is shown to ensure real-time updates
      if (applicantId && jobId) {
        console.log('📋 Modal shown - refetching data for applicant:', applicantId);

        // Refetch applicant details
        Axios.get(`${API_BASE_URL}/accountsapp/whoami/${applicantId}`)
          .then((response) => {
            setApplicantDetails(response.data);
            console.log('✅ Applicant details refetched');
          })
          .catch((error) => console.error("Error refetching applicant details:", error));

        // Refetch jobs
        Axios.get(`${API_BASE_URL}/jobs/applicants/applicantjobs/${applicantId}`)
          .then((response) => {
            const jobs = response.data?.jobs_applied || [];
            const jobsWithDuration = jobs.map(job => {
              try {
                const jobStarts = timeToSeconds(job.start_time_str);
                const jobEnds = timeToSeconds(job.end_time_str);
                const duration = ((jobEnds - jobStarts) / 60) / 60;
                return { ...job, duration };
              } catch (err) {
                return { ...job, duration: 0 };
              }
            });
            setApplicantJobs(jobsWithDuration);
            console.log('✅ Applicant jobs refetched');
          })
          .catch((error) => console.error("Error refetching applicant jobs:", error));

        // Refetch reviews
        Axios.get(`${API_BASE_URL}/rating/reviews/${applicantId}`)
          .then((response) => {
            setReviews(response.data.data.reviews);
            console.log('✅ Applicant reviews refetched');
          })
          .catch((error) => console.error("Error refetching applicant reviews:", error));

        // Refetch application status
        Axios.get(`${API_BASE_URL}/jobs/application/status/${jobId}/${applicantId}/`)
          .then((response) => {
            setApplicantStatus(response.data);
            console.log('✅ Application status refetched');
          })
          .catch(error => console.error("Error refetching application status on modal show:", error));
      }
    };

    modalElement.addEventListener('show.bs.modal', handleModalShow);
    return () => modalElement.removeEventListener('show.bs.modal', handleModalShow);
  }, [applicantId, jobId, API_BASE_URL]);

  const fetchReviews = (applicantId) => {
    setReviewsLoading(true);
    setReviewsError(null);
    Axios.get(`${API_BASE_URL}/rating/reviews/${applicantId}`)
      .then((response) => {
        setReviews(response.data.data.reviews);
        setReviewsLoading(false);
      })
      .catch((error) => {
        setReviewsError(error?.response?.data?.detail || "Failed to load reviews");
        setReviewsLoading(false);
      });
  };




  const fetchAllJobs = (currentUserId) => {
    if (!currentUserId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Axios.get(`${API_BASE_URL}/jobs/applicants/applicantjobs/${currentUserId}`)
      .then((response) => {
        const jobs = response.data?.jobs_applied || [];
        const jobsWithDuration = jobs.map(job => {
          try {
            const jobStarts = timeToSeconds(job.start_time_str);
            const jobEnds = timeToSeconds(job.end_time_str);
            const duration = ((jobEnds - jobStarts) / 60) / 60;
            return { ...job, duration };
          } catch (err) {
            return { ...job, duration: 0 };
          }
        });
        setApplicantJobs(jobsWithDuration);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load jobs. Please try again later.");
        setLoading(false);
      });
  }



  // Function to refetch application status
  const refetchApplicationStatus = () => {
    Axios.get(`${API_BASE_URL}/jobs/application/status/${jobId}/${applicantId}/`)
      .then((response) => {
        setApplicantStatus(response.data);
      })
      .catch(error => console.error("Error refetching application status:", error));
  };

  const acceptApplicant = (applicationId, clientId) => {
    setActionLoading(true);
    setError(null);
    const userData = { user_id: clientId };

    apiService.put(`/jobs/clients/applications/${applicationId}/accept/`, userData)
      .then((response) => {
        setApplicantStatus((prev) => ({
          ...prev,
          application_status: APPLICATION_STATUS.ACCEPTED
        }));
        setActionLoading(false);
        notifySuccess("Applicant accepted successfully.");
        // Refetch to ensure we have the latest data
        setTimeout(() => {
          refetchApplicationStatus();
          // Notify parent component to refetch job details
          if (onApplicationStatusChange) {
            onApplicationStatusChange();
          }
        }, 500);
      })
      .catch((error) => {
        setError(error?.response?.data?.detail || "Failed to Accept Applicant. Please try again later.");
        setActionLoading(false);
      });
  }


  const declineApplicant = (applicationId, clientId) => {
    setActionLoading(true);
    setError(null);
    const userData = { user_id: clientId };

    apiService.put(`/jobs/clients/applications/${applicationId}/decline/`, userData)
      .then((response) => {
        setApplicantStatus((prev) => ({
          ...prev,
          application_status: APPLICATION_STATUS.REJECTED
        }));
        setActionLoading(false);
        notifySuccess("Applicant declined successfully.");
        // Refetch to ensure we have the latest data
        setTimeout(() => {
          refetchApplicationStatus();
          // Notify parent component to refetch job details
          if (onApplicationStatusChange) {
            onApplicationStatusChange();
          }
        }, 500);
      })
      .catch((error) => {
        setError(error?.response?.data?.detail || "Failed to Decline Applicant. Please try again later.");
        setActionLoading(false);
      });
  }


  // Application status constants
  const APPLICATION_STATUS = {
    APPLIED: "Applied",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected"
  };

  // Phone number sanitization for tel: link
  const getSafePhoneNumber = (phone) => {
    if (!phone) return null;
    // Remove all non-numeric except +
    return phone.replace(/[^\d+]/g, "");
  };

  return (
    <div className="modal fade come-from-modal right" id="applicantProfileModal" data-bs-backdrop="normal" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header border-0">
             <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body py-0">
            {/* Show error if present */}
            {error && <div className="alert alert-danger">{error}</div>}
            {applicantError && <div className="alert alert-danger">{applicantError}</div>}
            {jobsError && <div className="alert alert-danger">{jobsError}</div>}
            {/* Loading states */}
            {(applicantLoading || jobsLoading) && <div className="text-center my-3">Loading...</div>}
            {
              applicantDetails &&
              <div className="profile_section">
                <div className="row">
                  <div className="col-12 text-center">
                    <div className="profile_wrapper">
                      <img className="" src={applicantDetails.profile_pic_url ? `${API_BASE_URL}${applicantDetails.profile_pic_url}` : ProfileImage} alt="profile" />
                    </div>
                    <span className="profile_details mt-1">
                      <h4>{applicantDetails.first_name} {applicantDetails.last_name}</h4>
                      <img src={Stars} alt="profile" /> <span className="rate_score">{applicantDetails.rating}</span>
                    </span>
                  </div>
                </div>
              </div>
            }
            {
              applicantDetails &&
              <div className="row client_data p-0 m-0">
                <div className="col-4 p-0">
                  <h4>{applicantDetails.activity_stats.total_applied_jobs}</h4>
                  <p>Total Job Applied</p>
                </div>
                <div className="col-4 p-0">
                  <h4>{applicantDetails.review_count}</h4>
                  <p>Rating & Reviews</p>
                </div>
                <div className="col-4 p-0">
                  <h4>{applicantDetails.activity_stats.total_employers_worked_with}</h4>
                  <p>Employers Worked With</p>
                </div>
              </div>
            }
            <div className="row tabs m-0 p-0">
              <ul >
                <li className={toggle === 1 ? "profile-btn active" : "profile-btn"} onClick={() => updateToggle(1)}>Jobs Posted</li>
                <li className={toggle === 2 ? "profile-btn active" : "profile-btn"} onClick={() => updateToggle(2)}>Reviews</li>
              </ul>
            </div>
            <div className="row ">
              <div className={toggle === 1 ? "cards jobs active-content" : "cards jobs tab-content"}>
                {jobsLoading ? (
                  <div>Loading jobs...</div>
                ) : JobsData && JobsData.length > 0 ? JobsData.map((item, key) => (
                  <div className="card" key={key}>
                    <div className="card_top">
                      <span className="profile_info">
                        <span>
                          <img className="prof" src={item.client_profile_pic_url ? `${API_BASE_URL}${item.client_profile_pic_url}` : ProfileImage} alt="profile" />
                        </span>
                        <span>
                          <h4>{item.client_first_name} {item.client_last_name}</h4>
                          <img src={Stars} alt="profile" /> <span className="rate_score">{applicantDetails?.rating ?? "--"}</span>
                        </span>
                      </span>
                      <span className="top_cta">
                        {/* <button className="btn active">Saved &nbsp; <FontAwesomeIcon icon={faBookmark} className="icon-saved" /> </button> */}
                        {/* <button className={savedJob.includes(item.id) ? "btn saved bg-dark text-white" : "btn saved"}  >{savedJob.includes(item.id) ? "Saved" : "unsaved"} {item.status}  &nbsp; <FontAwesomeIcon icon={faBookmark} className="icon-saved" /> </button> */}
                        <button className={item.status === APPLICATION_STATUS.ACCEPTED.toLowerCase() ? "btn saved border-success text-success" : "btn saved"}>
                          {item.status === APPLICATION_STATUS.ACCEPTED.toLowerCase() ? APPLICATION_STATUS.ACCEPTED : "Not Completed"}
                        </button>
                      </span>
                    </div>
                    <div className="duration">
                      <h3>{ConvertHoursToTime(item.duration)} Contract </h3> <span className="time_post">{item.date_posted}</span>
                    </div>
                    <span className="title">
                      <h3>{item.title}</h3>
                    </span>
                    <h4>{item.date}. {item.time}</h4>
                    <span className="address text-truncate">{item.location}</span>
                    <div className="price">
                      <span>
                        <h6>₦{item.rate}/hr</h6>
                        <p>{item.applicants_needed} applicant needed</p>
                      </span>
                      <span>
                        {/* <Link to={`../jobdetails/${item.id}`} className="btn">View Job Details</Link> */}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div>No jobs found.</div>
                )}
              </div>
              <div className={toggle === 2 ? "reviews active-content" : "reviews tab-content"}>
                {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                  <div>No reviews found.</div>
                )}


                {
                  !reviewsLoading && !reviewsError && reviews.map((item, key) => {
                    return (
                      <div className="review" key={key}>
                        <div className="ratings">
                          <div className="worker_profile">
                            <span>
                              <img className="prof" src={item.reviewer_avatar ? `${API_BASE_URL}${item.reviewer_avatar}` : ProfileImage} alt="profile" />
                            </span>
                            <span>
                              <h4>{item.reviewer_name}</h4>
                              <span className="rate_score">{item.reviewer_role}</span>
                            </span>
                          </div>
                          <div className="star_ratings">
                            {[...Array(5)].map((_, i) => (
                              <FontAwesomeIcon
                                key={i}
                                icon={faStar}
                                style={{
                                  color: i < item.rating ? "#5E0096" : "#d3d3d3" // purple for rated, ash for others
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="comment">
                          <p> {item.feedback} </p>
                        </div>
                      </div>
                    )
                  })
                }


              </div>
            </div>

            {
              applicantStatus.application_status === APPLICATION_STATUS.APPLIED ?
                <div className="row m-0 p-0 bg-white">
                  <div className="col-4 px-1">
                    <button
                      type="button"
                      name='submit'
                      className="btn preview-btn"
                      onClick={() => declineApplicant(applicantStatus.application_id, applicantStatus.client_id)}
                      disabled={actionLoading}
                    >Decline</button>
                  </div>
                  <div className="col-8">
                    <button
                      type="submit"
                      className="btn proceed-btn"
                      onClick={() => acceptApplicant(applicantStatus.application_id, applicantStatus.client_id)}
                      disabled={actionLoading}
                    >Accept Applicant</button>
                  </div>
                </div>
                :
                <div className="row m-0 p-0 bg-white">
                  <div className="col-12">
                    <button
                      type="submit"
                      disabled={applicantStatus.application_status === APPLICATION_STATUS.REJECTED || !applicantDetails?.phone_number}
                      className="btn proceed-btn"
                      onClick={() => {
                        const safePhone = getSafePhoneNumber(applicantDetails?.phone_number);
                        if (safePhone) {
                          window.location.href = `tel:${safePhone}`;
                        }
                      }}
                    >
                      {applicantStatus.application_status === APPLICATION_STATUS.ACCEPTED ? "Call worker" : APPLICATION_STATUS.REJECTED}
                    </button>
                  </div>
                </div>
            }
          </div>
        </div>
      </div>
      {/* ToastContainer should be placed at the root of your app for global toasts */}
    </div>
  )
}

export default ApplicantProfilemodal