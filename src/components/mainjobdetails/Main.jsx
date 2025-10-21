import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import "./Jobdetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faBookmark } from "@fortawesome/free-regular-svg-icons";
import { useQuery } from '@tanstack/react-query';

import GoogleMapReact from "google-map-react";
import Swal from 'sweetalert2';
import successIcon from "../../assets/images/success.png";
import { logger } from "../../utils/logger.js";


import Stars from "../../assets/images/stars.png";
import Axios from "axios";
import { apiService } from "../../services/api";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import ProfileImage from "../../assets/images/profile.png";
import MapImage from "../../assets/images/map.png";
import Walletmodal from "../walletmodal/Walletmodal";
import Profilemodal from "../profile/Profilemodal";
import Applicantmodal from "../applicantmodal/Applicantmodal";
import PaymentDetailsmodal from "../paymentdetailsmodal/PaymentDetailsmodal";
import ApplicantProfilemodal from "../applicantprofile/ApplicantProfilemodal";
import AcceptJobmodal from "../acceptjobmodal/AcceptJobmodal";
import DeclineJobmodal from "../declinejobmodal/DeclineJobmodal";
import Feedbackmodal from "../feedbackmodal/Feedbackmodal";
import AcceptJobConfirmmodal from "../acceptjobconfirmmodal/AcceptJobConfirmmodal";
import CancelshiftConfirmmodal from "../cancelshiftconfirmmodal/CancelshiftConfirmmodal";
import CancelshiftSuccessmodal from "../cancelshiftsuccessmodal/CancelshiftSuccessmodal";
import EndshiftConfirmmodal from "../endshiftconfirmmodal/EndshiftConfirmmodal";
import EndshiftSuccessmodal from "../endshiftsuccessmodal/EndshiftSuccessmodal";
import StartshiftConfirmmodal from "../startshiftconfirmmodal/StartshiftConfirmmodal";
import StartshiftSuccessmodal from "../startshiftsuccessmodal/StartshiftSuccessmodal";
import FeedbackSuccessmodal from "../feedbacksuccessmodal/FeedbackSuccessmodal";
import getCurrentUser from "../../auth/getCurrentUser";
import CountdownTimer from "../../auth/CountdownTimer";



import { ToastContainer } from 'react-toastify';
import { showSuccessToast, showErrorToast, toastContainerProps } from '../../utils/toastConfig';

import Map from "./Map";
import CallModal from "../callworker/CallModal";
import EmpFeedbackmodal from "../employerfeedbackmodal/EmpFeedbackmodal";
import { API_BASE_URL, NOTIFY } from "../../config";

// Create a component to display user's location on the map
const AnyReactComponent = ({ text }) => <div>{text}</div>;


// Utility to check if a date string (YYYY-MM-DD) is today
function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return (
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day
  );
}

const Main = () => {
  let jobId = useParams();
  const redir = useNavigate()


  // State declarations with improved naming and consolidation
  const [profile, setProfile] = useState({});
  const [jobDetails, setJobDetails] = useState({}); // for local updates only
  const [users, setUsers] = useState([]);
  const [duration, setJobDuration] = useState(0);
  const [savedJobs, setSavedJobs] = useState([]); // for local updates only
  const [applicantId, setApplicantId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [applicantStatus, setApplicantStatus] = useState({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [jobIdToStart, setJobIdToStart] = useState(null);
  const [jobIdToCancel, setJobIdToCancel] = useState(null);




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









  const notifySuccess = (message) => {
    return showSuccessToast(message);
  };

  const notifyError = (message) => {
    return showErrorToast(message);
  };



  // Utility for API URL construction
  const apiUrl = (path) => `${API_BASE_URL}${path}`;

  function timeToSeconds(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  const currentUserId = localStorage.getItem("user_id");
  const currentUserRole = localStorage.getItem("user_role");

  // Function to check if feedback has already been submitted for this job
  const checkFeedbackStatus = async (jobIdToCheck) => {
    if (!jobIdToCheck || !currentUserId) return;

    try {
      // Get all reviews submitted by the current user (where they are the reviewer)
      const response = await Axios.get(`${API_BASE_URL}/rating/ratings/reviewer_${currentUserId}/`);
      if (response.data && response.data.reviews) {
        const existingFeedback = response.data.reviews.find(review =>
          review.job_id === jobIdToCheck
        );
        setFeedbackSubmitted(!!existingFeedback);
      }
    } catch (error) {
      console.error('Error checking feedback status:', error);
    }
  };

  // React Query: Job Details
  const fetchJobDetails = async () => {
    const { data } = await Axios.get(apiUrl(`/jobs/${jobId.id}`));
    logger.apiResponse(`/jobs/${jobId.id}`, data);
    return data;
  };
  const { data: jobDetailsData = {}, isLoading: loadingJobDetails, error: errorJobDetails, refetch: refetchJobDetails } = useQuery({
    queryKey: ['jobDetails', jobId.id],
    queryFn: fetchJobDetails,
    enabled: !!jobId.id
  });

  // React Query: Saved Jobs (for applicants)
  const fetchSavedJobs = async () => {
    const { data } = await Axios.get(apiUrl(`/jobs/saved-jobs/${currentUserId}`));
    return data.saved_jobs.map(eachjob => eachjob.job.id);
  };
  const { data: savedJobsData = [], isLoading: loadingSavedJobs, error: errorSavedJobs, refetch: refetchSavedJobs } = useQuery({
    queryKey: ['savedJobs', currentUserId],
    queryFn: fetchSavedJobs,
    enabled: !!currentUserId && currentUserRole === 'applicant'
  });

  // Sync local state with React Query data
  useEffect(() => {
    if (jobDetailsData && Object.keys(jobDetailsData).length > 0) {
      setJobDetails(jobDetailsData);
      const jobStarts = timeToSeconds(jobDetailsData.start_time_str);
      const jobEnds = timeToSeconds(jobDetailsData.end_time_str);
      const duration = ((jobEnds - jobStarts) / 60) / 60;
      setJobDuration(duration);

      // Check feedback status for this job
      checkFeedbackStatus(jobDetailsData.id);
    }


    // Fetch application status
    Axios.get(`${API_BASE_URL}/jobs/application/status/${jobId.id}/${currentUserId}/`)
      .then((response) => {
        setApplicantStatus(response.data);
        logger.apiResponse(`/jobs/application/status/${jobId.id}/${currentUserId}`, response.data);
      })
      .catch(error => logger.apiError(`/jobs/application/status/${jobId.id}/${currentUserId}`, error));
      setSavedJobs(savedJobsData);


  }, [jobDetailsData, currentUserId]);

  // useEffect(() => {
  // }, [savedJobsData]);



useEffect(() => {
  getCurrentUser(setProfile);
}, []); 



  const getApplicantId = (userId) => {
    setApplicantId(userId);
  }

  // START A JOB SHIFT - Show confirmation modal first
  const handleStartShift = (job_id) => {
    setJobIdToStart(job_id);
    // Use data-bs-toggle approach as fallback
    const triggerButton = document.createElement('button');
    triggerButton.setAttribute('data-bs-toggle', 'modal');
    triggerButton.setAttribute('data-bs-target', '#startshiftConfirmModal');
    triggerButton.style.display = 'none';
    document.body.appendChild(triggerButton);
    triggerButton.click();
    document.body.removeChild(triggerButton);
  }

  // Confirm and execute start shift
  const confirmStartShift = async () => {
    // Debug: Check if token exists
    const token = localStorage.getItem('access_token');
    console.log('🔐 Token exists:', !!token);
    if (!token) {
      notifyError("Authentication token not found. Please log in again.");
      return;
    }

    try {
      const response = await apiService.post(`/jobs/shifts/start-shift/${jobIdToStart}`, {});
      // Close the confirmation modal
      const confirmModal = document.getElementById('startshiftConfirmModal');
      if (confirmModal) {
        const closeButton = confirmModal.querySelector('[data-bs-dismiss="modal"]');
        if (closeButton) closeButton.click();
      }
      // Show the success modal
      const successButton = document.createElement('button');
      successButton.setAttribute('data-bs-toggle', 'modal');
      successButton.setAttribute('data-bs-target', '#startshiftSuccessModal');
      successButton.style.display = 'none';
      document.body.appendChild(successButton);
      successButton.click();
      document.body.removeChild(successButton);
      setJobDetails((prev) => ({ ...prev, status: "ongoing" }));
    } catch (error) {
      console.error('❌ Start shift error:', error);
      if (error.response?.status === 401) {
        notifyError("Your session has expired. Please log in again.");
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.detail ||
                           error.response?.data?.message ||
                           "Failed to start shift.";
        notifyError(errorMessage);
      }
    }
  }

  // Confirm and execute cancel shift
  const confirmCancelJob = async () => {
    // Debug: Check if token exists
    const token = localStorage.getItem('access_token');
    console.log('🔐 Token exists:', !!token);
    if (!token) {
      notifyError("Authentication token not found. Please log in again.");
      return;
    }

    try {
      const response = await apiService.post(`/jobs/shifts/cancel-shift/${jobIdToCancel}/`, {});

      // Close the confirmation modal
      const confirmModal = document.getElementById('cancelshiftConfirmModal');
      if (confirmModal) {
        const closeButton = confirmModal.querySelector('[data-bs-dismiss="modal"]');
        if (closeButton) closeButton.click();
      }

      // Show the success modal
      const successButton = document.createElement('button');
      successButton.setAttribute('data-bs-toggle', 'modal');
      successButton.setAttribute('data-bs-target', '#cancelshiftSuccessModal');
      successButton.style.display = 'none';
      document.body.appendChild(successButton);
      successButton.click();
      document.body.removeChild(successButton);

      setJobDetails((prev) => ({ ...prev, status: "canceled" }));
    } catch (error) {
      console.error('❌ Cancel shift error:', error);
      if (error.response?.status === 401) {
        notifyError("Your session has expired. Please log in again.");
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.detail ||
                           error.response?.data?.message ||
                           "Failed to cancel job.";
        notifyError(errorMessage);
      }
    }
  }

  const handleEndShift = async (job_id) => {
    try {
      const response = await apiService.post(`/jobs/shifts/end-shift/${job_id}`, {});
      notifySuccess(NOTIFY.SHIFT_ENDED);
      setJobDetails((prev) => ({ ...prev, status: "completed" }));
    } catch (error) {
      notifyError("Failed to end shift.");
      console.error(error);
    }
  }


  // SAVE A JOB
  const saveJob = async (UID, jobID) => {
    const savejobData = {
      user_id: UID,
      job_id: jobID
    }
    try {
      const response = await Axios.post(apiUrl("/jobs/save-job/add/"), savejobData);
      if (response.status === 200) {
        notifySuccess(NOTIFY.JOB_SAVED);
        setSavedJobs((prev) => [...prev, jobID]);
      }
    } catch (error) {
      notifyError("Failed to save job.");
      console.error(error);
    }
  }


  const applyJob = async (userId, jobId) => {
    const applyJobData = {
      user_id: userId,
      job_id: jobId
    }
    try {
      const response = await Axios.post(apiUrl("/jobs/applicants/applications/apply-job/"), applyJobData);
      if (response.status === 200) {
         showSuccessSwal("Successful!", "Your application has been successfully submitted. The client will review your details and get back to you shortly.");
        setApplicantStatus((prev) => ({ ...prev, application_status: "Applied" }));
      }
    } catch (error) {
      notifyError("Failed to apply for job.");
      console.error(error);
    }
  };


  const notifyClient = async (userId, clientId, applicationId) => {
    const applyJobData = {
      applicant_id: userId,
      client_id: clientId,
      application_id: applicationId

    }
    try {
      const response = await Axios.post(apiUrl("/jobs/application/mark-arrived/"), applyJobData);
      if (response.status === 200) {
        notifySuccess(NOTIFY.APPLICANT_ARRIVAL);
      }
    } catch (error) {
      notifyError("Failed to notify client.");
      console.error(error);
    }
  };



  return (

    <main className="col-12 col-md-12 col-lg-9 col-xl-10 ms-sm-auto main__job-details px-md-4">
      <div className="row page_title">
        <div className="col-1 pt-lg-2">
          <button
            onClick={() => redir(-1)}
            className='btn p-0 text-dark'
            style={{ background: 'none', border: 'none' }}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>
        <div className="col-10 payment-btn">
          <h1 className="mb-0">{profile.role === "client" ? "Job Request Details" : "Job Details"}</h1>
          {
            profile.role === "client" &&
            <button type="button" className="mb-0 me-1" data-bs-toggle="modal" data-bs-target="#paymentDetailsModal">View Payment Detail</button>
          }
          {
            profile.role === "applicant" && applicantStatus.application_status === "Accepted" &&
            <button className="btn apply-btn" onClick={() => notifyClient(profile.user_id, applicantStatus.client_id, applicantStatus.application_id)}>Arrived! Notify Client</button>
          }
        </div>
        <div className="col-1 p-0">
          <button className="navbar-toggler position-absolute d-lg-none collapsed mt-1" type="button"
            data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation"
          >
            <FontAwesomeIcon className="icon-bars" icon={faBars} />
          </button>
        </div>
      </div>

      <section className="container container__data">

        <Map />
        {profile.role === "applicant" &&
          <div className="row mt-3 px-3">
            <div className="col-12 job_details">
              <h4 className="">Employer</h4>
              <div className="card_top">
                <span className="profile_info">
                  <span>
                    <img
                      className="prof"
                      src={jobDetails.client_profile_pic_url ? `${API_BASE_URL}${jobDetails.client_profile_pic_url}` : ProfileImage}
                      alt="profile"
                      onError={e => { e.target.onerror = null; e.target.src = ProfileImage; }}
                    />
                  </span>
                  <span>
                    <h4>{jobDetails.employer_name}</h4>
                    <img src={Stars} alt="profile" /> <span className="rate_score">{jobDetails.client_rating}</span>
                  </span>
                </span>
                <span className="top_cta">
                  <button className="btn" data-bs-toggle="modal" data-bs-target="#profileModal">View Profile</button>
                </span>
              </div>
            </div>
          </div>
        }

        {/* {profile.role === "client" &&
          <div className="row mt-3 px-3">
            <div className="col-12 job_details">
              <h4 className="">Worker(s)</h4>
              <div className="card_top">
                <span className="profile_info">
                  <span>
                    <img className="prof" src={ProfileImage} alt="profile" />
                  </span>
                  <span>
                    <h4>Eniola Lucas</h4>
                    <img src={Stars} alt="profile" /> <span className="rate_score">4.98</span>
                  </span>
                </span>
                <span className="top_cta">
                  <button className="btn" data-bs-toggle="modal" data-bs-target="#callModal"><FontAwesomeIcon icon={faPhone} className="icon-phone" />  Call Worker</button>

                  {profile.status === "done" &&
                    <button className="btn" data-bs-toggle="modal" data-bs-target="#feedbackModal">Feedback Worker</button> 
                  }
                </span>
              </div>
            </div>
          </div>

        } */}
        <section className="container_bottom">
          <div className="row mb-2">
            <div className="col-12 col-md-6">
              <p>Job Title:</p>
              <h2>{jobDetails.title || 'Loading...'}</h2>
            </div>
            <div className="col-6 col-md-3">
              <p>Applicant Needed:</p>
              <h2>{jobDetails.applicants_needed || '0'}</h2>
            </div>
            <div className="col-6 col-md-3">
              <p>Duration:</p>
              <h2>{Math.ceil(jobDetails.duration)} hrs Contract</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6">
              <p>Start Date:</p>
              {/* <h2>Monday 2nd March, 2024.</h2> */}
              <h2>{jobDetails.date}</h2>
            </div>
            <div className="col-6 col-md-3">
              <p>Start Time:</p>
              {/* <h2>09:00 AM.</h2> */}
              <h2>{jobDetails.start_time_human}</h2>
            </div>
            <div className="col-6 col-md-3">
              <p>Job Pay:</p>
              <h2>₦{jobDetails.rate ? parseFloat(jobDetails.rate).toLocaleString() : '0'}</h2>
            </div>
          </div>
        </section>

        {profile.role === "client" &&
          <section className="container_bottom">
            <div className="row">
              <div className="col-12 applicant_details">
                <h4>{jobDetails.applicants_count} Applicant(s) Applied</h4>
                {jobDetails.status === "upcoming" &&
                  // <button className="btn" data-bs-toggle="modal" data-bs-target="#feedbackModal">Feedback Worker</button> 
                  <button className="btn view-btn" data-bs-toggle="modal" data-bs-target="#applicantModal">View Applicants</button>
                }
                {jobDetails.status === "completed" &&
                  <button
                    className={`btn ${feedbackSubmitted ? 'btn-secondary' : 'view-btn'}`}
                    onClick={() => setReceiverId(jobDetails.applicants_user_ids)}
                    data-bs-toggle={feedbackSubmitted ? "" : "modal"}
                    data-bs-target={feedbackSubmitted ? "" : "#feedbackModal"}
                    disabled={feedbackSubmitted}
                  >
                    {feedbackSubmitted ? "Feedback Sent" : "Feedback Worker"}
                  </button>
                }
              </div>
            </div>
          </section>
        }

        {
          profile.role === "applicant" &&
          <section className="buttons">
            {jobDetails.status === "upcoming" &&
              <>
                <button className={savedJobs.includes(jobDetails.id) ? "btn saved bg-dark text-white" : "btn saved"} onClick={() => saveJob(profile.user_id, jobDetails.id)} >{savedJobs.includes(jobDetails.id) ? "Saved" : "Save"}  &nbsp; <FontAwesomeIcon icon={faBookmark} className="icon-saved" /> </button>
                {profile.phone_number && profile.location ?
                  applicantStatus.application_status === "Accepted" ? (
                    <button className="btn apply-btn" disabled>Accepted</button>
                  ) : applicantStatus.application_status === "Rejected" ? (
                    <button className="btn apply-btn" style={{ backgroundColor: '#FFF3CD', color: '#856404', borderColor: '#FFC107' }} onClick={() => applyJob(profile.user_id, jobDetails.id)}>Rejected Apply Again</button>
                  ) : (
                    <button className="btn apply-btn" disabled={applicantStatus.application_status === "Applied" ? true : false} onClick={() => applyJob(profile.user_id, jobDetails.id)}>
                      {applicantStatus.application_status === "Applied" ? "Job Applied" : "Apply Now"}
                    </button>
                  )
                  :
                  <Link to={'/settings'} className="btn update-btn">Update your profile please</Link>
                }
              </>
            }
            {jobDetails.status === "completed" &&
              <button
                className={`btn w-100 ${feedbackSubmitted ? 'btn-secondary' : 'feedback-btn'}`}
                onClick={() => setReceiverId(jobDetails.client_id)}
                data-bs-toggle={feedbackSubmitted ? "" : "modal"}
                data-bs-target={feedbackSubmitted ? "" : "#EmpFeedbackModal"}
                disabled={feedbackSubmitted}
              >
                {feedbackSubmitted ? "Feedback Sent" : "Feedback Employer"}
              </button>
            }
          </section>



        }

        {profile.role === "client" && jobDetails.status === "upcoming" &&
          <section className="buttons">
            <button className="btn saved" onClick={() => {
              setJobIdToCancel(jobDetails.id);
              // Use data-bs-toggle approach as fallback
              const triggerButton = document.createElement('button');
              triggerButton.setAttribute('data-bs-toggle', 'modal');
              triggerButton.setAttribute('data-bs-target', '#cancelshiftConfirmModal');
              triggerButton.style.display = 'none';
              document.body.appendChild(triggerButton);
              triggerButton.click();
              document.body.removeChild(triggerButton);
            }}>Cancel</button>
            <button
              className={`btn apply-btn${(jobDetails.accepted_applicants_count === 0) ? " disabled" : ""}`}
              onClick={() => handleStartShift(jobDetails.id)}
              disabled={jobDetails.accepted_applicants_count === 0}
              title={jobDetails.accepted_applicants_count === 0 ? "No applicants have been accepted for this job" : "Start Shift"}
            >
              {jobDetails.accepted_applicants_count === 0 ? "No Accepted Applicants" : "Start Shift"}
            </button>
          </section>
        }
        {profile.role === "client" && jobDetails.status === "ongoing" &&
          <section className="buttons">
            <button className="btn saved">
              {jobDetails.actual_shift_start ? (
                <CountdownTimer initialTime={jobDetails.duration + `:00:00`} shiftStartTime={jobDetails.actual_shift_start} />
              ) : (
                <span>Loading...</span>
              )}
            </button>
            <button className="btn apply-btn" onClick={() => handleEndShift(jobDetails.id)}>End Shift</button>
          </section>
        }
      </section>








      <div className="row">
        <AcceptJobConfirmmodal />
        <AcceptJobmodal />
        <Applicantmodal getApplicantId={getApplicantId} jobId={jobId} />
        <ApplicantProfilemodal applicantData={jobDetails} savedJob={savedJobs} applicantId={applicantId} onApplicationStatusChange={refetchJobDetails} />
        <CancelshiftConfirmmodal onConfirm={confirmCancelJob} />
        <CancelshiftSuccessmodal />
        <DeclineJobmodal />
        <EndshiftConfirmmodal />
        <EndshiftSuccessmodal />
        <StartshiftConfirmmodal onConfirm={confirmStartShift} />
        <StartshiftSuccessmodal />
        {/* {
          profile.role === 'client' ?
            <Feedbackmodal role={currentUserRole} jobId={jobId.id} receiverIds={receiverId} allUsers={allUsers} />
            :
            <EmpFeedbackmodal role={currentUserRole} jobId={jobId.id} allUsers={allUsers} />
        } */}
        {
          profile.role === 'client' ?
            <Feedbackmodal role={currentUserRole} jobId={jobId.id} receiverIds={receiverId} allUsers={allUsers} />
            :
            <EmpFeedbackmodal role={currentUserRole} jobId={jobId.id} receiverIds={receiverId} allUsers={allUsers} />
        }
        {/* <Feedbackmodal applicantId={applicantId} />
        <EmpFeedbackmodal applicantId={applicantId} /> */}
        <FeedbackSuccessmodal />
        {
          jobDetails &&
          <Profilemodal clientData={jobDetails} savedJob={savedJobs} />
        }
        <PaymentDetailsmodal jobId={jobId} />
        <DeclineJobmodal />
        <CallModal />
        <ToastContainer />
      </div>
    </main >
  )
}

export default Main