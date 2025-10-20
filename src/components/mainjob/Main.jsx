import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Jobs.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faServer,
  faUser,
  faUserGroup,
  faSearch,
  faChevronDown,
  faBarsProgress,
  faBars
} from "@fortawesome/free-solid-svg-icons";
import { faBell, faBookmark } from "@fortawesome/free-regular-svg-icons";
import { useQuery } from '@tanstack/react-query';

import { VscBellDot } from "react-icons/vsc";

import Stars from "../../assets/images/stars.png";
import iconWallet from "../../assets/images/wallet.png";
import iconLogo from "../../assets/images/icon-logo.png";
import Axios from "axios";
import { apiService } from "../../services/api";
import ProfileImage from "../../assets/images/profile.png";
import Walletmodal from "../walletmodal/Walletmodal";
import Notificationmodal from "../notificationmodal/Notificationmodal";
import Pagination from "../pagination/Pagination";
import Feedbackmodal from "../feedbackmodal/Feedbackmodal";
import PaymentMethodmodal from "../paymentmethodmodal/PaymentMethodmodal";
import getCurrentUser from "../../auth/getCurrentUser";
import CountdownTimer from "../../auth/CountdownTimer";
import timeToSeconds from "../../auth/timeToSeconds";
import ConvertHoursToTime from "../../auth/ConvertHoursToTime";
import { ToastContainer } from 'react-toastify';
import { showSuccessToast, showErrorToast, toastContainerProps } from '../../utils/toastConfig';
import ClipLoader from 'react-spinners/ClipLoader';
import { format, parseISO } from 'date-fns';
import PostJobSuccessmodal from "../postjobsuccessmodal/PostJobSuccessmodal";
import OngoingStatusmodal from "../ongoingstatusmodal/OngoingStatusmodal";
import EmpFeedbackmodal from "../employerfeedbackmodal/EmpFeedbackmodal";
import ShareLocationModal from "../sharemodal/ShareLocationModal";
import WithdrawModal from "../withdrawmodal/WithdrawModal";
import AccountModal from "../accountModal/AccountModal";
import StartshiftConfirmmodal from "../startshiftconfirmmodal/StartshiftConfirmmodal";
import CancelshiftConfirmmodal from "../cancelshiftconfirmmodal/CancelshiftConfirmmodal";
import StartshiftSuccessmodal from "../startshiftsuccessmodal/StartshiftSuccessmodal";
import EndshiftConfirmmodal from "../endshiftconfirmmodal/EndshiftConfirmmodal";
import EndshiftSuccessmodal from "../endshiftsuccessmodal/EndshiftSuccessmodal";
import { API_BASE_URL } from "../../config";

const formatDate = (dateString) => {
  const date = parseISO(dateString);
  const day = format(date, 'do');
  const weekday = format(date, 'EEEE');
  const month = format(date, 'MMMM');
  const year = format(date, 'yyyy');
  return `${weekday} ${day} ${month}, ${year}`;
};

let id = 0;
export const filterButton = [
  { id: id++, title: 'All', value: '' },
  { id: id++, title: 'Upcoming', value: 'upcoming' },
  { id: id++, title: 'Ongoing', value: 'ongoing' },
  { id: id++, title: 'Completed', value: 'completed' },
  { id: id++, title: 'Canceled', value: 'cancel' },
];

const Main = () => {

  const [searchWork, setSearchWork] = useState("");
  const [filterState, setFilterState] = useState("");
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState({});
  const [outJobData, setOutJobData] = useState(null);

  const [isOngoingModalOpen, setIsOngoingModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  let [applicantId, setApplicantId] = useState([]);

  const [receiverId, setReceiverId] = useState("");
  const [feedbackJobId, setFeedbackJobId] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState({}); // Track feedback status for each job
  const [jobIdToStart, setJobIdToStart] = useState(null);
  const [jobIdToCancel, setJobIdToCancel] = useState(null);

  const [newNotification, setNewNotification] = useState(null);
  const [newnotify, setReadCount] = useState(0);

  // Pagination state - moved before early return
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Check token and redirect early if needed
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "/signin";
    return null;
  }

  const filterFunction = (e) => {
    const buttons = document.getElementsByClassName('filter-btn');
    setFilterState(e.target.value);
    for (let index = 0; index < buttons.length; index++) {
      buttons[index].classList.remove('active');
    }
    e.target.classList.add('active');
  }



  const getApplicantId = (userId) => {
    setApplicantId(userId);
  }

  // Function to check feedback status for jobs
  const checkFeedbackStatusForJobs = async (jobsList) => {
    if (!currentUserId || !jobsList || jobsList.length === 0) return;

    try {
      // Get all reviews submitted by the current user (where they are the reviewer)
      const response = await Axios.get(`${API_BASE_URL}/rating/ratings/reviewer_${currentUserId}/`);
      if (response.data && response.data.reviews) {
        const feedbackMap = {};
        jobsList.forEach(job => {
          const existingFeedback = response.data.reviews.find(review =>
            review.job_id === job.id
          );
          feedbackMap[job.id] = !!existingFeedback;
        });
        setFeedbackStatus(feedbackMap);
      }
    } catch (error) {
      console.error('Error checking feedback status for jobs:', error);
    }
  };

  // Callback function to refresh feedback status after successful submission
  const handleFeedbackSubmitted = (jobId) => {
    // Update the feedback status for this specific job
    setFeedbackStatus(prev => ({
      ...prev,
      [jobId]: true
    }));

    // Optionally refresh all feedback statuses
    if (jobs && jobs.length > 0) {
      checkFeedbackStatusForJobs(jobs);
    }
  };

  const currentUserId = localStorage.getItem("user_id");
  const currentUserRole = localStorage.getItem("user_role");

  const notifySuccess = (message) => {
    return showSuccessToast(message);
  };

  const notifyError = (message) => {
    return showErrorToast(message);
  };

  // Fetch all users
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const res = await Axios.get(`${API_BASE_URL}/jobs/all-users`);
      return res.data.users;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  React.useEffect(() => {
    if (usersData) setAllUsers(usersData);
  }, [usersData]);

  // Fetch account details (only for applicant)
  const {
    data: accountData,
    isLoading: accountLoading,
    error: accountError
  } = useQuery({
    queryKey: ['account-details', currentUserId],
    queryFn: async () => {
      if (currentUserId && currentUserRole === "applicant") {
        const res = await Axios.get(`${API_BASE_URL}/accountsapp/get-account-details?user_id=${currentUserId}`);
        return res.data;
      }
      return null;
    },
    enabled: !!currentUserId && currentUserRole === "applicant",
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  React.useEffect(() => {
    if (accountData) setAccountDetails(accountData);
  }, [accountData]);

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchWork, filterState]);

  // Fetch jobs - fetch all jobs for client-side pagination
  const {
    data: jobsResponse,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs
  } = useQuery({
    queryKey: ['jobs', currentUserId, currentUserRole],
    queryFn: async () => {
      function timeToSeconds(timeStr) {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      // Fetch all jobs without server-side pagination since we're doing client-side pagination
      let baseUrl = currentUserRole === "applicant"
        ? `${API_BASE_URL}/jobs/alljobsmatched?user_id=${currentUserId}&page=1&page_size=100&bypass_cache=true`
        : `${API_BASE_URL}/jobs/clients/clientjobs/${currentUserId}?page=1&page_size=100&bypass_cache=true`;
      const res = await Axios.get(baseUrl);
      const jobsWithDuration = res.data.jobs.map(job => {
        const jobStarts = timeToSeconds(job.start_time_str);
        const jobEnds = timeToSeconds(job.end_time_str);
        const duration = ((jobEnds - jobStarts) / 60) / 60;
        return { ...job, duration };
      });

      return {
        jobs: jobsWithDuration,
        pagination: res.data.pagination || {}
      };
    },
    enabled: !!currentUserId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  const jobsData = jobsResponse?.jobs || [];
  React.useEffect(() => {
    if (jobsData) {
      setJobs(jobsData);
      // Check feedback status for the loaded jobs
      checkFeedbackStatusForJobs(jobsData);
    }
  }, [jobsData]);

  // Apply client-side filtering and searching
  const filteredJobs = React.useMemo(() => {
    let filtered = jobs.filter(job => job.status !== "pending");

    // Apply search filter
    if (searchWork.toLowerCase() !== "") {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchWork.toLowerCase())
      );
    }

    // Apply status filter
    if (filterState !== "") {
      filtered = filtered.filter(job =>
        job.status.toLowerCase().includes(filterState.toLowerCase())
      );
    }

    return filtered;
  }, [jobs, searchWork, filterState]);

  // Reset page to 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchWork, filterState]);

  // Client-side pagination for filtered jobs
  const paginatedJobs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage, itemsPerPage]);

  // Calculate pagination info for filtered jobs
  const clientPagination = React.useMemo(() => {
    const totalItems = filteredJobs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return {
      current_page: currentPage,
      total_pages: totalPages,
      total_items: totalItems,
      items_per_page: itemsPerPage,
      has_next: currentPage < totalPages,
      has_previous: currentPage > 1
    };
  }, [filteredJobs.length, currentPage, itemsPerPage]);

  // Fetch current user profile
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      return new Promise((resolve) => getCurrentUser(resolve));
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  React.useEffect(() => {
    if (profileData) setProfile(profileData);
  }, [profileData]);



  const openOngoingModal = (jobId) => {
    setSelectedJobId(jobId);
    setIsOngoingModalOpen(true);
  };

  const closeOngoingModal = () => {
    setIsOngoingModalOpen(false);
    setSelectedJobId(null);
  };

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

  const confirmStartShift = () => {
    // Debug: Check if token exists
    const token = localStorage.getItem('access_token');
    console.log('🔐 Token exists:', !!token);
    if (!token) {
      notifyError("Authentication token not found. Please log in again.");
      return;
    }

    apiService.post(`/jobs/shifts/start-shift/${jobIdToStart}`, {})
      .then((response) => {
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
        refetchJobs();
      })
      .catch((error) => {
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
                             "Failed to start shift";
          notifyError(errorMessage);
        }
      });
  }

  const handleEndShift = (job_id) => {
    apiService.post(`/jobs/shifts/end-shift/${job_id}`, {})
      .then((response) => {
        const message = response.data.detail;
        notifySuccess(message);
        refetchJobs();
      })
      .catch((error) => {
        console.error(error);
        const errorMessage = error.response?.data?.detail ||
                           error.response?.data?.message ||
                           "Failed to end shift";
        notifyError(errorMessage);
      });
  }

  const handleCancelJob = (job_id) => {
    setJobIdToCancel(job_id);
    // Use data-bs-toggle approach as fallback
    const triggerButton = document.createElement('button');
    triggerButton.setAttribute('data-bs-toggle', 'modal');
    triggerButton.setAttribute('data-bs-target', '#cancelshiftConfirmModal');
    triggerButton.style.display = 'none';
    document.body.appendChild(triggerButton);
    triggerButton.click();
    document.body.removeChild(triggerButton);
  }

  const confirmCancelJob = () => {
    apiService.post(`/jobs/shifts/cancel-shift/${jobIdToCancel}/`, {})
      .then(() => {
        notifySuccess("Job canceled successfully.");
        refetchJobs();
      })
      .catch((error) => {
        console.error(error);
        const errorMessage = error.response?.data?.detail ||
                           error.response?.data?.message ||
                           "Failed to cancel job";
        notifyError(errorMessage);
      });
  }

  const handleReportDispute = (job_id) => {
    // Set the job ID for feedback and open the feedback modal with dispute type
    setFeedbackJobId(job_id);

    // Find the job to get the client/applicant IDs
    const job = jobs.find(j => j.id === job_id);
    if (job) {
      // For clients reporting dispute against applicants
      if (profile.role === 'client') {
        setReceiverId(job.applicants_user_ids);
      } else {
        // For applicants reporting dispute against client
        setReceiverId(job.client_id);
      }
    }

    // Close the ongoing modal first
    closeOngoingModal();

    // Create a temporary button to trigger the modal using Bootstrap's data attributes
    const modalId = profile.role === 'client' ? '#jobsFeedbackModal' : '#jobsEmpFeedbackModal';
    const triggerButton = document.createElement('button');
    triggerButton.setAttribute('data-bs-toggle', 'modal');
    triggerButton.setAttribute('data-bs-target', modalId);
    triggerButton.style.display = 'none';
    document.body.appendChild(triggerButton);
    triggerButton.click();
    document.body.removeChild(triggerButton);

    // Set the feedback type to dispute after modal opens
    setTimeout(() => {
      const feedbackTypeSelect = document.querySelector(`${modalId} select[name="feedbacktype"]`);
      if (feedbackTypeSelect) {
        feedbackTypeSelect.value = 'dispute';
        feedbackTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 200);
  }

  return (
    <main className="col-12 col-md-12 col-lg-9 col-xl-10 ms-sm-auto  px-md-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap flex-md-nowrap align-items-center pb-2 ">
        <div className="page_header">
          <h1 className="m-0 p-0">{profile.role === "client" ? "Shifts" : "Jobs"}</h1>
          <div className="">
            <button className="navbar-toggler position-absolute d-lg-none collapsed" type="button"
              data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation"
            >
              <FontAwesomeIcon className="icon-bars" icon={faBars} />
            </button>
          </div>
        </div>
        <div className="searchbar-section">
          <div className="serachbar-notify">
            <div className="me-2 searchbar">
              <input className="form-control searchbar-input" onChange={(e) => setSearchWork(e.target.value)} type="text" placeholder="Search" aria-label="Search" />
              <FontAwesomeIcon className="search-icon" icon={faSearch} />
            </div>
            <button type="button" className="notification-icon px-3" data-bs-toggle="modal" data-bs-target="#notificationModal">
              {
                newnotify > 0 ?
                  <VscBellDot className="" style={{ color: '#6a0dad', fontSize: '1.2rem' }} />
                  :
                  <FontAwesomeIcon className="" icon={faBell} />
              }
            </button>
          </div>
          {profile.role === "applicant" &&
            <button type="button" className="btn btn-wallet px-3" data-bs-toggle="modal" data-bs-target="#walletModal">
              <img src={iconWallet} alt="" srcSet="" /> {profile.wallet_balance}
            </button>
          }

        </div>
      </div>
      <section className="container container__data">
        <div className="row m-0 p-0">
          <div className="col-12 m-0 p-0">
            <div className="filter-section">
              {
                filterButton.map((item, key) => {
                  return (
                    <button type="button" key={key} value={item.value} onClick={filterFunction} className={item.title === "All" ? "filter-btn active" : "filter-btn"}>{item.title}</button>
                  )
                })
              }

            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="cards jobs">
            {jobsLoading ? (
              <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: '200px' }}>
                <ClipLoader color="#6a0dad" size={50} />
              </div>
            ) : profile.phone_number && profile.location ?
              paginatedJobs && profile &&
              paginatedJobs.map((item, key) => {
                return (
                  <div className="card" key={key}>
                    <Link to={"../jobdetails/" + item.id} >
                      <div className="card_top">
                        <span className="profile_info">
                          <span>
                            <img
                              className="prof"
                              src={item.client_profile_pic_url ? `${API_BASE_URL}${item.client_profile_pic_url}` : ProfileImage}
                              alt="profile"
                              onError={e => { e.target.onerror = null; e.target.src = ProfileImage; }}
                            />
                          </span>
                          <span>
                            <h4>{item.client_first_name + " " + item.client_last_name}</h4>
                            <img src={Stars} alt="rating_star" /> <span className="rate_score">{item.client_rating ? item.client_rating : "Not rated yet"}</span>
                          </span>
                        </span>
                        <span className="top_cta">
                          {item.has_applied ? (
                            <button
                              className={`btn applied ${(item.application_status === 'Accepted' || item.application_status === 'Applied' || item.application_status === 'Ongoing') && item.status === 'completed' ? 'completed' : item.application_status?.toLowerCase() || 'pending'}`}
                              disabled
                            >
                              {(item.application_status === 'Accepted' || item.application_status === 'Applied' || item.application_status === 'Ongoing') && item.status === 'completed' ? 'Completed' :
                               item.application_status === 'Ongoing' ? 'Ongoing' :
                               item.application_status === 'Accepted' ? 'Accepted' :
                               item.application_status === 'Applied' ? 'Applied' :
                               item.application_status === 'Rejected' ? 'Rejected' :
                               item.application_status === 'Pending' ? 'Applied' : 'Applied'}
                            </button>
                          ) : (
                            <button className={"btn " + item.status}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</button>
                          )}
                        </span>
                      </div>
                      <div className="row">
                        <div className="col-12"><h2>{item.title}</h2></div>
                      </div>
                      <div className="row">
                        <div className="col-3 pe-0"><p>Location:</p></div>
                        <div className="col-9"><h4 className="text-truncate">{item.location}</h4></div>
                      </div>
                      <div className="row">
                        <div className="col-4 pe-0"><p>Date:</p></div>
                        <div className="col-8"><h4>{profile.role === 'applicant' ? item.date_human : formatDate(item.date)}</h4></div>
                      </div>
                      <div className="row">
                        <div className="col-6 pe-0"><p>Time:</p></div>
                        <div className="col-6"><h4>{item.start_time_human}</h4></div>
                      </div>
                      <div className="row">
                        <div className="col-6 pe-0"><p>Contract Duration:</p></div>
                        <div className="col-6"><h4>{ConvertHoursToTime(item.duration)}</h4></div>
                      </div>
                      <div className="row">
                        <div className="col-6 pe-0"><p>Amount:</p></div>
                        <div className="col-6"><h4>₦{profile.role === 'applicant' ? item.rate : item.rate}</h4></div>
                      </div>
                    </Link>
                    {
                      item.status === 'upcoming' ?
                        profile.role === 'client' ?
                          <div className="bottom">
                            <button
                              className={`track-btn w-100${(item.accepted_applicants_count === 0) ? " disabled" : ""}`}
                              onClick={() => handleStartShift(item.id)}
                              disabled={item.accepted_applicants_count === 0}
                              title={item.accepted_applicants_count === 0 ? "No applicants have been accepted for this job" : "Start Shift"}
                            >
                              {item.accepted_applicants_count === 0 ? "No Accepted Applicants" : "Start Shift"}
                            </button>
                          </div>
                          :
                          <div className="bottom">
                            <span>
                              <button className="cancel" onClick={() => handleCancelJob(item.id)} >Cancel</button>
                            </span>
                            <span>
                              <Link to={"../jobdetails/" + item.id} className="track-btn">Track Location</Link>
                            </span>
                          </div> :
                        ""
                    }
                    {
                      item.status === 'ongoing' ?
                        profile.role === 'client' ?
                          <div className="bottom">
                            <span>
                              <CountdownTimer initialTime={item.duration + `:00:00`} shiftStartTime={item.actual_shift_start} />
                            </span>
                            <span style={{ position: 'relative' }}>
                              <button className="track-btn" onClick={() => openOngoingModal(item.id)} >Take Action &nbsp; <FontAwesomeIcon icon={faChevronDown} /> </button>
                              {isOngoingModalOpen && item.id === selectedJobId && (
                                <OngoingStatusmodal
                                  itemId={selectedJobId}
                                  handleEndShift={handleEndShift}
                                  handleReportDispute={handleReportDispute}
                                  onClose={closeOngoingModal}
                                />
                              )}
                            </span>
                          </div>
                          :
                          <div className="bottom">
                            <span>
                              <CountdownTimer initialTime={item.duration + `:00:00`} shiftStartTime={item.actual_shift_start} />
                            </span>
                            <span>
                              <button className="track-btn" data-bs-toggle="modal" data-bs-target="#shareLocationModal">Share Location</button>
                            </span>
                          </div>
                        :
                        ""
                    }
                    {
                      item.status === 'completed' || item.status === 'canceled' ?
                        profile.role === 'client' ?
                          <div className="bottom">
                            <button
                              className={`track-btn w-100 ${feedbackStatus[item.id] ? 'btn-secondary' : ''}`}
                              onClick={() => {setReceiverId(item.applicants_user_ids); setFeedbackJobId(item.id);}}
                              data-bs-toggle={feedbackStatus[item.id] ? "" : "modal"}
                              data-bs-target={feedbackStatus[item.id] ? "" : "#jobsFeedbackModal"}
                              disabled={feedbackStatus[item.id]}
                            >
                              {feedbackStatus[item.id] ? "Feedback Sent" : "Feedback Applicant"}
                            </button>
                          </div>
                          :
                          <div className="bottom">
                            <button
                              className={`track-btn w-100 ${feedbackStatus[item.id] ? 'btn-secondary' : ''}`}
                              onClick={() => {setReceiverId(item.client_id); setFeedbackJobId(item.id);}}
                              data-bs-toggle={feedbackStatus[item.id] ? "" : "modal"}
                              data-bs-target={feedbackStatus[item.id] ? "" : "#jobsEmpFeedbackModal"}
                              disabled={feedbackStatus[item.id]}
                            >
                              {feedbackStatus[item.id] ? "Feedback Sent" : "Feedback Employer"}
                            </button>
                          </div>
                        :
                        ""
                    }

                  </div>
                );
              })
              :
              <div className="text-center w-100 p-5">
                <p>Update your Phone number and Address in settings click to <Link to={"/settings"} className="fw-bold text-purple">Update Profile</Link></p>
              </div>
            }

          </div>

          {/* Pagination */}
          {clientPagination.total_pages > 1 && (
            <Pagination
              currentPage={clientPagination.current_page}
              totalPages={clientPagination.total_pages}
              totalItems={clientPagination.total_items}
              itemsPerPage={clientPagination.items_per_page}
              onPageChange={(page) => setCurrentPage(page)}
              showInfo={true}
              showPageNumbers={true}
              maxPageNumbers={7}
            />
          )}
        </div>
      </section>
      <ToastContainer {...toastContainerProps} />
      <Walletmodal accountDetails={accountDetails} />
      {accountDetails && <WithdrawModal accountDetails={accountDetails} />}
      <AccountModal />
      <Notificationmodal setNewNotification={setNewNotification} setReadCount={setReadCount} />
      <ShareLocationModal />
      {/* Feedback Modals - Always render both to avoid hook count changes */}
      <Feedbackmodal
        role={currentUserRole}
        jobId={feedbackJobId}
        receiverIds={receiverId}
        allUsers={allUsers}
        modalId="jobsFeedbackModal"
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
      <EmpFeedbackmodal
        role={currentUserRole}
        jobId={feedbackJobId}
        receiverIds={receiverId}
        modalId="jobsEmpFeedbackModal"
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
      <StartshiftConfirmmodal onConfirm={confirmStartShift} />
      <StartshiftSuccessmodal />
      <CancelshiftConfirmmodal onConfirm={confirmCancelJob} />
      <EndshiftConfirmmodal onConfirm={handleEndShift} />
      <EndshiftSuccessmodal />
      {/* { currentUserRole === 'client' &&  outJobData &&
        <PaymentMethodmodal currentProfile={profile} paymentJobData={outJobData} />
        } */}
    </main>
  );
};

export default Main;
