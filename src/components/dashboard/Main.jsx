import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Main.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBriefcase, faLocationDot, faBars } from "@fortawesome/free-solid-svg-icons";
import { faBell, faCircleUser, faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { useQuery } from '@tanstack/react-query';
import Axios from 'axios';

import { VscBellDot } from "react-icons/vsc";


import Stars from "../../assets/images/stars.png";
import { API_BASE_URL } from "../../config";

import getCurrentUser from "../../auth/getCurrentUser";
import timeToSeconds from "../../auth/timeToSeconds";
import ConvertHoursToTime from "../../auth/ConvertHoursToTime";
import { format, parseISO } from 'date-fns';
import Postmodal from "../postmodal/Postmodal";
import EditPostmodal from "../editpostmodal/EditPostmodal";
import JobPreviewmodal from "../jobpreviewmodal/JobPreviewmodal";
import Notificationmodal from "../notificationmodal/Notificationmodal";
import Jobrequestmodal from "../jobrequestsmodal/Jobrequestmodal";
import Pagination from "../pagination/Pagination";
import { ToastContainer } from 'react-toastify';
import { showSuccessToast, showErrorToast, toastContainerProps } from '../../utils/toastConfig';
import PostJobSuccessmodal from "../postjobsuccessmodal/PostJobSuccessmodal";
import PaymentMethodmodal from "../paymentmethodmodal/PaymentMethodmodal";



const fetchProfile = async (userId) => {
  const { data } = await Axios.get(`${API_BASE_URL}/accountsapp/user_profile_pictures_full/?user_id=${userId}`);
  return data[0]?.url || "";
};

const fetchJobs = async (userId) => {
  // Fetch all jobs without server-side pagination since we're doing client-side pagination
  const { data } = await Axios.get(`${API_BASE_URL}/jobs/clients/clientjobs/${userId}?page=1&page_size=100`);
  return {
    jobs: data.jobs || [],
    pagination: data.pagination || {
      current_page: 1,
      total_pages: 1,
      total_items: 0,
      items_per_page: 1000
    }
  };
};


const formatDate = (dateString) => {
  const date = parseISO(dateString);
  const day = format(date, 'do'); // 1st, 2nd, etc.
  const weekday = format(date, 'EEEE'); // Monday
  const month = format(date, 'MMMM'); // April
  const year = format(date, 'yyyy'); // 2025
  return `${weekday} ${day} ${month}, ${year}`;
};



const Main = () => {

  const [searchWork, setSearchWork] = useState("");
  const [selectedJobData, setSelectedJobData] = useState(null);
  const [outJobData, setOutJobData] = useState("");
  // Remove manual error and loading state for jobs
  // const [profileImage, setProfileImage] = useState("");
  const [profile, setProfile] = useState(null); // <-- Add this line
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const currentUserId = localStorage.getItem("user_id");
  const currentUserRole = localStorage.getItem("user_role");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const [newNotification, setNewNotification] = useState("");
  const [newnotify, setReadCount] = useState("");

  const token = localStorage.getItem("access_token");

  // Check authentication status in useEffect to avoid early returns
  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      window.location.href = "/signin";
    }
  }, [token]);

  // If not authenticated, render nothing while redirect happens
  if (!isAuthenticated) {
    return <div>Redirecting to sign in...</div>;
  }



  const notifySuccess = (message) => {
    return showSuccessToast(message);
  };

  const notifyError = (message) => {
    return showErrorToast(message);
  };





  const selectedJob = (jobId) => {
    Axios.get(`${API_BASE_URL}/jobs/${jobId}`)
      .then(
        (response) => {
          setSelectedJobData(response.data);
        }
      ).catch(error => console.error(error));
  };



  const handleDelete = (job_id) => {
    Axios.delete(`${API_BASE_URL}/jobs/job/delete/${job_id}`)
      .then((response) => {
        const message = response.data.message;
        notifySuccess(message);
        setTimeout(() => {
          window.location.reload();
        }, 500);

      }).catch((error) => console.error(error));
  }



  // Removed fetchAllJobs and setJobs logic

  useEffect(() => {
    getCurrentUser(setProfile);

    if (currentUserRole === "applicant") {
      window.location.href = "/home";
    }

  }, []);

  // Note: This useEffect is for applicants, but dashboard is only for clients
  // Keeping it for reference but it won't execute since profile.role will be "client"
  useEffect(() => {
    if (profile && profile.role === "applicant") {
      // This won't execute for clients, but keeping for consistency
      Axios.get(`${API_BASE_URL}/jobs/saved-jobs`)
        .catch((error) => console.error(error));
    }
  }, [profile]);

  // const [jobId, setJobId] = useState(null);

  const refreshJobs = (message) => {
    refetchJobs();
  }

  const initiatePayment = (payMethod, actualJobData, refNumber, reservationNo, setProcessingPayment, setPaidJobData) => {
    // Use the actual job data (either from props or window global)
    const jobData = actualJobData || window.paymentJobData || paymentJobData || {};



    if (!jobData) {
      notifyError("No job data found or job ID missing. Cannot process payment.");
      console.error("Missing job data or job ID:", jobData);
      return;
    }

    setProcessingPayment(true);

    // Get current user ID if not available in job data
    const currentUserId = jobData.user_id || profile?.user_id || localStorage.getItem("user_id");
    if (!currentUserId) {
      notifyError("User ID not found. Cannot process payment.");
      setProcessingPayment(false);
      return;
    }

    // Ensure we have a valid rate
    const rate = parseFloat(jobData.rate) || 0;
    if (rate <= 0) {
      notifyError("Invalid job rate. Cannot process payment.");
      setProcessingPayment(false);
      return;
    }

    // Create payment data object that matches the InitiatePaymentSchema in the backend

    // Check for missing phone number and prompt user to update profile
    if (!profile?.phone_number) {
      notifyError("Phone number missing in your profile. Please update your profile before making a payment.");
      setProcessingPayment(false);
      return;
    }

    const payData = {
      total: rate,
      reference: refNumber,
      user_id: Number(currentUserId),
      first_name: profile?.first_name || 'User',
      last_name: profile?.last_name || 'Name',
      phone: profile.phone_number,
      payment_method: payMethod,
      reservation_code: reservationNo,
      status: "pending",
      job_id: jobData.id // Add job_id to link payment to the job
    }

    // Make the API call to process payment
    Axios.post(`${API_BASE_URL}/payment/payments`, payData)
      .then((response) => {
        console.log("Payment Response:", response);

        window.location.href = response.data.data.authorization_url;
        setProcessingPayment(false);

        // Store the job data for the success modal
        setPaidJobData(jobData);

        // Show success notification
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);

        // fetchAllJobs();
        // notifySuccess("Payment successful!");
      })
      .catch((error) => {
        console.error("Payment Error:", error);
        if (error.response) {
          console.error("Backend response:", error.response.data);
          notifyError(error.response.data?.detail || "Payment failed. Please try again.");
        }
        setProcessingPayment(false);
      });
  };



  // Profile image query
  const { data: profileImage, isLoading: loadingProfileImage, error: errorProfileImage } = useQuery({
    queryKey: ['profileImage', currentUserId],
    queryFn: () => fetchProfile(currentUserId),
    enabled: !!currentUserId
  });

  // Jobs query - fetch all jobs for client-side pagination
  const { data: jobsResponse, isLoading: loadingJobs, error: errorJobs, refetch: refetchJobs } = useQuery({
    queryKey: ['jobs', currentUserId],
    queryFn: () => fetchJobs(currentUserId),
    enabled: !!currentUserId,
    keepPreviousData: true
  });

  const jobs = jobsResponse?.jobs || [];
  const pagination = jobsResponse?.pagination || {};

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchWork]);

  // Client-side filtering for search
  const filteredJobs = useMemo(() => {
    return jobs.filter((item) => {
      return searchWork.toLowerCase() === "" ? item : item.title.toLowerCase().includes(searchWork.toLowerCase());
    });
  }, [jobs, searchWork]);

  // Client-side pagination for filtered jobs
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage, itemsPerPage]);

  // Calculate pagination info for filtered jobs
  const filteredPagination = useMemo(() => {
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

  return (
    <main className="col-12 col-md-12 col-lg-9 col-xl-10 ms-sm-auto  px-md-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap flex-md-nowrap align-items-center pb-2">
        <div className="page_header">
          <h1 className="m-0 p-0">Dashboard</h1>
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
              <span>
                {
                  newnotify > 0 ?
                    <VscBellDot className="" style={{ color: '#6a0dad', fontSize: '1.2rem' }} />
                    :
                    <FontAwesomeIcon className="" icon={faBell} />

                }


              </span>
            </button>
          </div>
        </div>
      </div>
      {profile && profile.phone_number && profile.location &&
        <button type="button" className=" btn-post px-3" data-bs-toggle="modal" data-bs-target="#postModal">
          Post a new Job &nbsp; <FontAwesomeIcon icon={faSquarePlus} />
        </button>
      }
      {profile && ((profile.phone_number === "" || profile.phone_number === undefined || profile.phone_number === null) || (profile.location === "" || profile.location === undefined || profile.location === null)) &&
        <Link to={'/settings'} className="btn btn-post px-3" >Update your profile &nbsp; <FontAwesomeIcon icon={faSquarePlus} /></Link>
      }
      <section className="container container__data">
        <div className="row m-0 mt-3 dashboard_profile">
          <div className="col-5 col-md-4 col-xl-2 p-0">
            <div className="profile_wrapper">
              <img src={`${API_BASE_URL}${profileImage}`} alt="Profile Image" />
            </div>
          </div>
      <div className="col-7 col-md-8 col-xl-10 ps-xl-5 ">
        {profile ? (
          <>
            <h3>{profile.first_name} {profile.last_name}</h3>
            <p>{profile.role} </p>
            <p>Rating</p>
            <span>
              <img src={Stars} alt="rating_icon" /> <span className="rate_score">{profile.rating}</span>
            </span>
            <p>Email Address</p>
            <h4>{profile.email}</h4>
            <p>Phone Number</p>
            <h4>{profile.phone_number || "Not provided"}</h4>
          </>
        ) : (
          <div>Loading profile...</div>
        )}
      </div>
          <div className="col-12 col-md-4 col-xl-2"></div>
          <div className="col-12 col-md-8 col-xl-10 p-0 ps-xl-5">
            <Link to="../settings" className="btn edit-btn">Edit Profile</Link>
          </div>
        </div>
        {
          profile &&
          <div className="row  dashboard_user_data">
            <div className="col-6 col-md-3 user_data">
              <span><FontAwesomeIcon icon={faBriefcase} className="user_data_icon" /> </span>
              <span>
                <p>Total Job Posted</p>
                <h5>{profile.job_stats.total_jobs_posted}</h5>
              </span>
            </div>
            <div className="col-6 col-md-3 user_data">
              <span><FontAwesomeIcon icon={faCircleUser} className="user_data_icon" /> </span>
              <span>
                <p>Total workers engaged</p>
                <h5>{profile.job_stats.total_workers_engaged}</h5>
              </span>
            </div>
            <div className="col-6 col-md-3 user_data">
              <span><FontAwesomeIcon icon={faBriefcase} className="user_data_icon" /> </span>
              <span>
                <p>Total Completed Jobs</p>
                <h5>{profile.job_stats.total_completed_jobs}</h5>
              </span>
            </div>
            <div className="col-6 col-md-3 user_data">
              <span><FontAwesomeIcon icon={faBriefcase} className="user_data_icon" /> </span>
              <span>
                <p>Total Cancelled Jobs</p>
                <h5>{profile.job_stats.total_cancelled_jobs}</h5>
              </span>
            </div>
          </div>

        }
        <div className="row mt-3">
          <div className="col-12 top_title">
            <h3>Your Recent Job Requests</h3>
            <span><button type="button" data-bs-toggle="modal" data-bs-target="#jobrequestModal" >See More</button></span>
          </div>

          <div className="cards p-0">

            {loadingJobs && (
              <div className="text-center p-4 w-100">
                <div className="spinner-border text-purple" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading jobs...</p>
              </div>
            )}

            {errorJobs && (
              <div className="text-center p-4 w-100">
                <p className="text-danger">Failed to load jobs. Please try again later.</p>
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => refetchJobs()}
                >
                  Try Again
                </button>
              </div>
            )}

            {!loadingJobs && !errorJobs && jobs && jobs.length === 0 && (
              <div className="text-center p-4 w-100">
                <p>No jobs found. Create a new job to get started.</p>
              </div>
            )}

            {!loadingJobs && !errorJobs && paginatedJobs && paginatedJobs.map((item, key) => {
              // Safely handle profile being null
              const rating = profile && profile.rating ? profile.rating : "-";
              return (
                <div className="card" key={key}>
                  <div className="card_top">
                    <span className="profile_info">
                      <span>
                        <img className="prof" src={`${API_BASE_URL}${item.client_profile_pic_url}`} alt="profile" />
                      </span>
                      <span>
                        <h4>{item.client_first_name} {item.client_last_name}</h4>
                        <img src={Stars} alt="rating_star" /> <span className="rate_score">{rating}</span>
                      </span>
                    </span>
                    <span className="top_cta">

                      <button className={item.status === "pending" ? "btn color-yellow" : "btn"}>{item.status !== "pending" ? item.applicants_count > 0 ? item.applicants_count + " " + "applicant" : "No applicant yet" : "Pending"}</button>

                    </span>
                  </div>
                  <div className="duration">
                    <h3>{ConvertHoursToTime(item.duration)} Contract </h3> <span className="time_post">{item.date_posted}</span>
                  </div>
                  <span className="title">
                    <h3 className="text-truncate">{item.title}</h3>
                  </span>
                  <h4>{formatDate(item.date)}. {item.start_time}</h4>
                  <span className="address text-truncate"><FontAwesomeIcon icon={faLocationDot} /> {item.location}</span>
                  <div className="price">
                    <span>
                      <h6>₦{item.rate}/hr</h6>
                      <p>{item.applicants_needed} applicant needed</p>
                    </span>
                    <span>
                      {item.status === "pending" ? <button className="btn" onClick={() => selectedJob(item.id)} data-bs-toggle="modal" data-bs-target="#jobPreviewmodal" >Preview details</button> : <Link to={`../jobdetails/${item.id}`} className="btn">View Request Details</Link>}
                    </span>
                  </div>
                </div>
              )
            })
            }

          </div>

          {/* Pagination */}
          {filteredPagination.total_pages > 1 && (
            <Pagination
              currentPage={filteredPagination.current_page}
              totalPages={filteredPagination.total_pages}
              totalItems={filteredPagination.total_items}
              itemsPerPage={filteredPagination.items_per_page}
              onPageChange={(page) => setCurrentPage(page)}
              showInfo={true}
              showPageNumbers={true}
              maxPageNumbers={7}
            />
          )}
        </div>

        <Jobrequestmodal />
        <Notificationmodal setNewNotification={setNewNotification} setReadCount={setReadCount} />
        <JobPreviewmodal itemData={selectedJobData} handleDelete={handleDelete} setOutJobData={setOutJobData} selectedJob={selectedJob} />
        <Postmodal setOutJobData={setOutJobData} />
        <EditPostmodal formData={selectedJobData} refreshJobs={refreshJobs} />

        <PaymentMethodmodal paymentJobData={outJobData} initiatePayment={initiatePayment} />
        <PostJobSuccessmodal />
        <ToastContainer />
      </section>
    </main >
  )
}

export default Main
