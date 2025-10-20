import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faServer, faUser, faUserGroup, faSearch, faBars, faKey, faBarsProgress, faChevronRight, faUserPen, faWallet, faClipboard, faStar, faCamera, faClose, faBookBible, faBook, faBank } from "@fortawesome/free-solid-svg-icons";
import { faBell, faBookmark, faCircleXmark } from "@fortawesome/free-regular-svg-icons";

import { VscBellDot } from "react-icons/vsc";


import Stars from "../../assets/images/stars.png";
import iconWallet from "../../assets/images/wallet.png";
import iconStamp from "../../assets/images/paeshiftstamp.png";
import iconWarning from "../../assets/images/warning.png";
import iconLogo from "../../assets/images/icon-logo.png";

import ProfileImage from "../../assets/images/profile.png";
import Walletmodal from "../walletmodal/Walletmodal";
import Notificationmodal from "../notificationmodal/Notificationmodal";
import PaymentDetailsmodal from "../paymentdetailsmodal/PaymentDetailsmodal";
import WithdrawModal from "../withdrawmodal/WithdrawModal";
import "./Settings.css";

import Axios from "axios";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import { JobsData } from "./JobsData";
import { faFacebook, faInstagram, faTiktok } from "@fortawesome/free-brands-svg-icons";
import getCurrentUser from "../../auth/getCurrentUser";
import timeToSeconds from "../../auth/timeToSeconds";
import ConvertHoursToTime from "../../auth/ConvertHoursToTime";
import { ToastContainer } from 'react-toastify';
import { showSuccessToast, showErrorToast, toastContainerProps } from '../../utils/toastConfig';
import { icon } from "@fortawesome/fontawesome-svg-core";
import AccountModal from "../accountModal/AccountModal";
import { API_BASE_URL } from "../../config";



let id = 0;
export const filterButton = [
  {
    id: id++,
    title: 'All',
    value: 'all'
  },
  {
    id: id++,
    title: 'Read',
    value: true
  },
  {
    id: id++,
    title: 'Un Read',
    value: false
  },


]
export const filterDay = [
  {
    id: id++,
    title: 'All',
    value: ''
  },
  {
    id: id++,
    title: 'Today',
    value: 'today'
  },
  {
    id: id++,
    title: 'Yesterday',
    value: 'yesterday'
  },
  {
    id: id++,
    title: 'This_Week',
    value: 'this_week'
  },
  {
    id: id++,
    title: 'Last_Week',
    value: 'last_week'
  },
  {
    id: id++,
    title: 'This_Month',
    value: 'this_month'
  },
  {
    id: id++,
    title: 'Last_Month',
    value: 'last_month'
  },
  {
    id: id++,
    title: 'This_Year',
    value: 'this_year'
  },
  {
    id: id++,
    title: 'Last_Year',
    value: 'last_year'
  },


]


export const tabApplicantButton = [
  {
    id: id++,
    title: 'Edit Profile',
    value: 1,
    icon: faUserPen
  },
  {
    id: id++,
    title: 'Wallet',
    value: 2,
    icon: faWallet
  },
  {
    id: id++,
    title: 'Bank Account',
    value: 10,
    icon: faBank
  },
  {
    id: id++,
    title: 'Saved Jobs',
    value: 3,
    icon: faBookmark
  },
  {
    id: id++,
    title: 'Notifications',
    value: 4,
    icon: faBell
  },
  {
    id: id++,
    title: 'Ratings & Reviews',
    value: 5,
    icon: faStar
  },
  {
    id: id++,
    title: 'Login Settings',
    value: 6,
    icon: faKey
  },
  {
    id: id++,
    title: 'Feedback',
    value: 7,
    icon: faClipboard
  }
]
export const tabClientButton = [
  {
    id: id++,
    title: 'Edit Profile',
    value: 1,
    icon: faUserPen
  },
  {
    id: id++,
    title: 'Invoice',
    value: 9,
    icon: faBook
  },
  {
    id: id++,
    title: 'Notifications',
    value: 4,
    icon: faBell
  },
  {
    id: id++,
    title: 'Ratings & Reviews',
    value: 5,
    icon: faStar
  },
  {
    id: id++,
    title: 'Login Settings',
    value: 6,
    icon: faKey
  },
  {
    id: id++,
    title: 'Feedback',
    value: 7,
    icon: faClipboard
  }
]




const Schema = Yup.object().shape({
  newpassword: Yup.string().min(6, "Must Contain 6 Characters").required("Required")
    .matches(/^(?=.*[a-z])/, "Must Contain One Lowercase Character")
    .matches(/^(?=.*[A-Z])/, "Must Contain One Uppercase Character")
    .matches(/^(?=.*[0-9])/, "Must Contain One Number Character")
    .matches(/^(?=.*[!@#\$%\^&\*])/, "Must Contain  One Special Case Character"),
  confirmPassword: Yup.string().min(6, "Too Short!").max(50, "Too Long!").required("Required")
    .oneOf([Yup.ref("newpassword"), null], "Passwords must match"),
});

const profileSchema = Yup.object().shape({
  firstName: Yup.string().min(2, "Too short!"),
  lastName: Yup.string().min(2, "Too short!"),
  locationAddress: Yup.string().min(11, "Minimum of 10 characters!"),
  phone: Yup.string().min(11, "Minimum of 10 characters!"),
});
const feedbackSchema = Yup.object().shape({
  feedback: Yup.string().required("Required"),
  feedbacktype: Yup.string().required("Required"),

});

const Main = () => {
  const location = useLocation();

  let [profile, setProfile] = useState({});
  let [payments, setPayments] = useState([]);
  let [transactions, setTransactions] = useState([]);
  let [filterState, setFilterState] = useState("all");
  let [selectedPayment, setSelectedPayment] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  let [show, setShow] = useState('password');
  let [show1, setShow1] = useState('password');
  let [show2, setShow2] = useState('password');




  // Initialize activeTab from location state, localStorage, or default to 1
  const getInitialTab = () => {
    if (location.state?.activeTab) {
      return location.state.activeTab;
    }
    const savedTab = localStorage.getItem("settingsActiveTab");
    return savedTab ? parseInt(savedTab) : 1;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [showSlide, setShowSlide] = useState("");

  const [allJobsMatched, setAllJobs] = useState("");
  const [savedjobs, setSavedJobs] = useState("");
  const [savedJobIds, getSavedJobs] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  const [newNotification, setNewNotification] = useState("");
  const [newnotify, setReadCount] = useState("");
  const [accountDetails, setAccountDetails] = useState("");




  const fetchReviews = () => {
    setReviewsLoading(true);
    setReviewsError(null);
    // Axios.get(`${API_BASE_URL}/rating/ratings/reviewed/${currentUserId}`)
    Axios.get(`${API_BASE_URL}/rating/reviews/${currentUserId}`)
      .then((response) => {
        // setReviews(response.data.results);
        setReviews(response.data.data.reviews);
        setReviewsLoading(false);
      })
      .catch((error) => {
        setReviewsError("Failed to load reviews");
        setReviewsLoading(false);
        console.log(error);
      });
  };

  function openTab(params) {
    setActiveTab(params);
    setShowSlide(0);
    // Save the active tab to localStorage
    localStorage.setItem("settingsActiveTab", params);
  }

  function closeTab() {
    setActiveTab(0);
    setShowSlide(1);
    // Clear the saved tab when closing
    localStorage.removeItem("settingsActiveTab");
  }


  const notifySuccess = (message) => {
    return showSuccessToast(message);
  };

  const notifyError = (message) => {
    return showErrorToast(message);
  };

  // All Notification
  const [formData, setFormData] = useState({
    // Push notifications
    newjob: false,
    newjobreminder: false,
    jobrequest: false,
    settings: false,
    // Email notifications
    emailnewjob: false,
    emailjobreminder: false,
    jobacceptance: false,
    emailsettings: false
  });




  // Handle input changes
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    // For checkboxes, use the checked property; for other inputs, use value
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };



  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh

    // Format data for API
    const apiData = {
      push_new_job_alert: formData.newjob,
      push_job_reminder: formData.newjobreminder,
      push_job_acceptance: formData.jobrequest,
      push_settings_changes: formData.settings,
      email_new_job_alert: formData.emailnewjob,
      email_job_reminder: formData.emailjobreminder,
      email_job_acceptance: formData.jobacceptance,
      email_settings_changes: formData.emailsettings
    };

    Axios.put(`${API_BASE_URL}/notifications/notifications/${currentUserId}/settings`, apiData)
      .then((response) => {
        notifySuccess("Notification settings updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating notification settings:", error);
        notifyError("Failed to update notification settings");
      });
  };


  const currentUserId = localStorage.getItem("user_id");
  const currentUserRole = localStorage.getItem("user_role");

  const fetchSavedJobs = () => {
    if (currentUserId && currentUserRole === "applicant") {
      Axios.get(`${API_BASE_URL}/jobs/saved-jobs/${currentUserId}`)
        .then((response) => {
          const savedJobIds = response.data.saved_jobs.map(eachjob => eachjob.job.id);
          getSavedJobs(savedJobIds);
        })
        .catch((error) => console.error(error));
    }
  };

  const fetchAllJobs = () => {

    Axios.get(`${API_BASE_URL}/jobs/alljobsmatched?user_id=${userId}`)
      .then((response) => {
        const jobsWithDuration = response.data.jobs.map(job => {
          const jobStarts = timeToSeconds(job.start_time_str);
          const jobEnds = timeToSeconds(job.end_time_str);
          const duration = ((jobEnds - jobStarts) / 60) / 60;
          return { ...job, duration };
        });
        setAllJobs(jobsWithDuration);
      })
      .catch((error) => console.error(error));
  }


  // GET ALL DATA
  useEffect(() => {
    // GET CURRENT USER PROFILE
    getCurrentUser(setProfile);


    if (currentUserId && currentUserRole === "applicant") {
      // GET ALL SAVED JOBS
      Axios.get(`${API_BASE_URL}/jobs/saved-jobs/${currentUserId}`)
        .then((response) => {
          // getSavedJobs(response.data.saved_jobs);

        })
        .catch((error) => console.error(error));
    }


    // GET ACCOUNT DETAILS (only for applicants)
    if (currentUserId && currentUserRole === "applicant") {
      Axios.get(`${API_BASE_URL}/accountsapp/get-account-details?user_id=${currentUserId}`)
        .then((response) => {
          setAccountDetails(response.data)
        })
        .catch((error) => {
          if (error.status === 400) {
            console.log(error.response.data.error);
          }
        });
    } else {
      console.warn('Skipping account details request: user is not applicant or user_id missing.');
    }

    if (activeTab === 3) {
      fetchAllJobs();
      fetchSavedJobs();
    }

    if (activeTab === 4) {
      Axios.get(`${API_BASE_URL}/notifications/${currentUserId}/settings`)
        .then((response) => {

          // Map API response to form data
          if (response.data && response.data.data) {
            const notificationData = response.data.data;

            // Update form data with values from API
            setFormData({
              // Push notifications
              newjob: notificationData.push?.new_job_alert || false,
              newjobreminder: notificationData.push?.job_reminder || false,
              jobrequest: notificationData.push?.job_acceptance || false,
              settings: notificationData.push?.settings_changes || false,

              // Email notifications
              emailnewjob: notificationData.email?.new_job_alert || false,
              emailjobreminder: notificationData.email?.job_reminder || false,
              jobacceptance: notificationData.email?.job_acceptance || false,
              emailsettings: notificationData.email?.settings_changes || false
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching Notifications:", error);
          notifyError("Failed to load notification settings");
        });
    }
    if (activeTab === 2) {
      Axios.get(`${API_BASE_URL}/payment/users/${currentUserId}/wallet/transactions`)
        .then((response) => {
          if (response.data && response.data.data.results) {
            setTransactions(response.data.data.results);
            console.log(response.data.data.results);
          }


        })
        .catch((error) => {
          console.error("Error fetching Transactions:", error);
          notifyError("Failed to load Transaction data");
        });
    }


    // Fetch payments when tab changes to Invoice
    if (activeTab === 9) {

      Axios.get(`${API_BASE_URL}/payment/users/${currentUserId}/payments`)
        .then((response) => {
          if (response.data && response.data.data.results) {
            setPayments(response.data.data.results);
            console.log(response.data.data.results)          }
        })
        .catch((error) => {
          console.error("Error fetching payments:", error);
          notifyError("Failed to load payment data");
        });

    }

    // Fetch reviews when tab changes to Ratings & Reviews
    if (activeTab === 5) {
      fetchReviews();
    }

    Axios.get(`${API_BASE_URL}/accountsapp/user_profile_pictures_full/?user_id=${currentUserId}`)
      .then(response => {
        setProfileImage(response.data[0].url);
        // handle response
      })
      .catch(error => console.error("Profile Image error:", error));


  }, [activeTab])


  const handleReadReview = (reviewId, currentUserId) => {
    const reviewData = {
      user_id: Number(currentUserId),
      review_id: reviewId
    }

    Axios.post(`${API_BASE_URL}/rating/ratings/mark-read/`, reviewData)
      .then((response) => {
        if (response.status === 200) {
          notifySuccess("Review read successfully")
          fetchReviews();
        }
      })
      .catch((error) => {
        console.error("Error Reading Review:", error);
        notifyError("Failed to read review");
      });
  }




  useEffect(() => {
    if (allJobsMatched && savedJobIds) {
      const savedJobIdsSet = new Set(savedJobIds);
      const filteredJobs = allJobsMatched.filter(job => savedJobIdsSet.has(job.id));
      setSavedJobs(filteredJobs);
    }
  }, [allJobsMatched, savedJobIds]);




  const removeSavedJob = (selectedJobId) => {
    const payload = {
      user_id: Number(currentUserId),
      job_id: selectedJobId
    };

    Axios.delete(`${API_BASE_URL}/jobs/unsave-job/`, { data: payload })
      .then((response) => {
        if (response.status === 200) {
          fetchSavedJobs(); // refresh saved jobs
          fetchAllJobs();
          notifySuccess(response.data.message);
        }
      })
      .catch((error) => console.error(error));
  };


  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    // Open payment details modal
  };

  const userId = localStorage.getItem("user_id");
  if (!userId) return;





  // Filter Feature
  const filterFunction = (e) => {
    const filter = e.target.value || "all";
    setFilterState(filter);

    // Update active button
    const buttons = document.getElementsByClassName('btn-filter');
    for (let index = 0; index < buttons.length; index++) {
      buttons[index].classList.remove('active');
    }
    e.target.classList.add('active');

  }




  const filteredReviews = reviews.filter((review) => {
    if (filterState === "all" || filterState === "") return true;
    return review.is_read === filterState;
  });

  // Helper function to check if a date matches the filter
  const isDateInFilter = (dateString, filter) => {
    const date = new Date(dateString);
    const now = new Date();

    switch (filter) {
      case "today":
        return (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return (
          date.getDate() === yesterday.getDate() &&
          date.getMonth() === yesterday.getMonth() &&
          date.getFullYear() === yesterday.getFullYear()
        );
      case "this_week":
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        return date >= firstDayOfWeek && date <= now;
      case "last_week":
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setDate(now.getDate() - now.getDay() - 1);
        return date >= lastWeekStart && date <= lastWeekEnd;
      case "this_month":
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      case "last_month":
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        return (
          date.getMonth() === lastMonth.getMonth() &&
          date.getFullYear() === lastMonth.getFullYear()
        );
      case "this_year":
        return date.getFullYear() === now.getFullYear();
      case "last_year":
        return date.getFullYear() === now.getFullYear() - 1;
      default:
        return true;
    }
  };

  // Filter payments based on filterState
  const filteredPayments = payments.filter(payment => {
    if (filterState === "all" || filterState === "") return true;
    return isDateInFilter(payment.created_at, filterState);
  });

  // Filter payments based on filterState
  const filteredTransactions = transactions.filter(transaction => {
    if (filterState === "all" || filterState === "") return true;
    return isDateInFilter(transaction.created_at, filterState);
  });





  return (
    <main className="col-12 col-md-12 col-lg-9 col-xl-10 ms-sm-auto p-0  px-md-2">
      <div className="d-flex justify-content-between align-items-center flex-wrap flex-md-nowrap align-items-center pb-2 ">
        <div className="page_header">
          <h1 className="m-0 p-0">Settings</h1>
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
              <input
                className="form-control searchbar-input"
                type="text"
                placeholder="Search"
                aria-label="Search"
                value=""
                onChange={e => setSearchValue(e.target.value)}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <FontAwesomeIcon className="search-icon" icon={faSearch} style={{ color: '#ccc' }} />
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
            <>
              <button type="button" className="btn btn-wallet px-3" data-bs-toggle="modal" data-bs-target="#walletModal">
                <img src={iconWallet} alt="" srcSet="" /> {profile.wallet_balance}
              </button>
              {/* <button type="button" className="btn btn-wallet px-3" data-bs-toggle="modal" data-bs-target="#AccountModal"> Account
              </button> */}
            </>
          }
          {/* <div class="modal-backdrop fade"></div> */}
        </div>
      </div>
      <section className="container container__data m-0" id="settings">
        <div className="row m-0 p-md-4">
          <div className="col-12 col-md-4 col-xl-3 m-0 py-3 profile_data">
            <div className="profile_info">
              <span>
                <img className="prof" src={`${API_BASE_URL}${profileImage}`} alt="profile" />
              </span>
              <span>
                <h4>{profile.first_name} {profile.last_name}</h4>
                <h4 className="rate_score">{profile.role}</h4>
              </span>
            </div>
            <ul className="tabs">
              {profile.role === "applicant" &&
                tabApplicantButton.map((tab) => (
                  <li
                    key={tab.id}
                    className={activeTab === tab.value ? "active" : ""}
                    onClick={() => openTab(tab.value)}
                  >
                    <span className="label">
                      <FontAwesomeIcon icon={tab.icon} />
                      <span>{tab.title}</span>
                    </span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </li>
                ))}
              {profile.role === "client" &&
                tabClientButton.map((tab) => (
                  <li
                    key={tab.id}
                    className={activeTab === tab.value ? "active" : ""}
                    onClick={() => openTab(tab.value)}
                  >
                    <span className="label">
                      <FontAwesomeIcon icon={tab.icon} />
                      <span>{tab.title}</span>
                    </span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </li>
                ))}

              <li className={activeTab === 8 ? "active" : ""} onClick={() => openTab(8)}>
                <span className="label">
                  {/* <FontAwesomeIcon icon={faUserPen} /> */}
                  <img src={iconLogo} alt="Paeshift Logo" />
                  <span>About Paeshift</span>
                </span>
                <FontAwesomeIcon icon={faChevronRight} />
              </li>

            </ul>
          </div>
          <div className={showSlide === 0 ? "animate__animated animate__fadeIn col-12 col-md-8 col-xl-9 m-0  p-2 py-3 profile_form" : "col-12 col-md-8 col-xl-9 m-0 px-0 profile_form hide"}>
            {/* <div className={"col-12 col-md-8 col-xl-9 m-0 px-0 profile_form"}> */}
            <button className="close_btn" onClick={closeTab}><FontAwesomeIcon icon={faCircleXmark} className="close_icon" /> </button>


            {/* EDIT PROFILE  */}
            <div className={activeTab === 1 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="profile">
              <h3>Edit Profile</h3>
              <h4>Profile Picture Upload</h4>
              <div className="profile_wrapper">
                <img
                  className="prof"
                  src={`${API_BASE_URL}${profileImage}`}

                  alt="profile"
                />
              </div>


              <Formik
                enableReinitialize
                initialValues={{
                  firstName: profile.first_name || "",
                  lastName: profile.last_name || "",
                  locationAddress: profile.location || "",
                  phone: profile.phone_number || "",
                  email: profile.email || "",
                  profile_pic: "",
                }}
                validationSchema={profileSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setSubmitting(false);

                  // Create FormData for multipart/form-data
                  const formData = new FormData();
                  formData.append("user_id", currentUserId);
                  formData.append("first_name", values.firstName);
                  formData.append("last_name", values.lastName);
                  formData.append("bio", "");
                  formData.append("location", values.locationAddress);
                  formData.append("phone_number", values.phone);

                  // Only append file if user selected one
                  if (values.profile_pic && values.profile_pic instanceof File) {
                    formData.append("profile_picture", values.profile_pic);
                  }

                  try {
                    const response = await Axios.post(
                      `${API_BASE_URL}/accountsapp/profile/update`,
                      formData,
                      {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );
                    notifySuccess("Profile updated successfully");
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                  } catch (error) {
                    console.error(error.response?.data);
                    notifyError(error.response?.data?.message || "Profile update failed");
                  }
                }}
              >
                {({ errors, touched, setFieldValue }) => (
                  <Form className="edit_profile_form">
                    <input
                      type="file"
                      name="profile_pic"
                      accept=".jpg, .jpeg, .png, .gif"
                      id="changeimage"
                      className="block w-full imagefile"
                      value=""
                      onChange={event => {
                        setFieldValue("profile_pic", event.currentTarget.files[0]);
                      }}
                    />
                    <label htmlFor="changeimage" className="change-image-btn" >
                      <FontAwesomeIcon icon={faCamera} /> &nbsp;
                      Change Image
                    </label>
                    <div className="row form_row">
                      <div className="col-12 col-md-6 mb-2">
                        <label htmlFor="firstName" className="form-label mb-0">First Name:</label>
                        <Field name="firstName" className="form-control" placeholder={profile?.first_name || ''} />
                        {touched.firstName && errors.firstName && (<div className="errors">{errors.firstName}</div>)}
                      </div>
                      <div className="col-12 col-md-6 mb-2">
                        <label htmlFor="lastName" className="form-label mb-0">Last Name:</label>
                        <Field name="lastName" className="form-control" placeholder={profile.last_name} />
                        {touched.lastName && errors.lastName && (<div className="errors">{errors.lastName}</div>)}
                      </div>
                      <div className="col-12 phone">
                        <label htmlFor="phone" className="form-label mb-0">Phone Number:</label>
                        <Field name="phone" className="form-control" placeholder={profile.phone_number || "Enter your phone number"} />
                        {touched.phone && errors.phone && (<div className="errors">{errors.phone}</div>)}
                      </div>
                      <div className="col-12 phone">
                        <label htmlFor="locationAddress" className="form-label mb-0">Address:</label>
                        <Field name="locationAddress" className="form-control" placeholder={profile.location || "Enter your address"} />
                        {touched.locationAddress && errors.locationAddress && (<div className="errors">{errors.locationAddress}</div>)}
                      </div>
                      <div className="col-12 email">
                        <label htmlFor="email" className="form-label mb-0">Email:</label>
                        <Field name="email" className="form-control" placeholder={profile.email} readOnly />
                      </div>
                    </div>
                    <button type="submit" name='submit' className="btn save-btn w-100 mt-2">Save Changes</button>
                  </Form>
                )}
              </Formik>
            </div>


            {/* WALLET TAB CONTENT  */}
            <div className={activeTab === 2 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="wallet_section">
              <h3>Wallet</h3>
              <div className="balance">
                <h4>Wallet Balance</h4>
                <h1>₦ {profile.wallet_balance}</h1>
                <p>January 6, 2025 . 11:35 AM</p>
              </div>
              <div className="transactions">
                <div className="top_section">
                  <div><h3>All Transaction</h3></div>
                  <div className="btns-filter">
                    {
                      filterDay.map((item, key) => {
                        return (
                          <button type="button" key={key} value={item.value} onClick={filterFunction} className={item.title === "All" ? "btn-filter active" : "btn-filter"}>{item.title}</button>
                        )
                      })
                    }
                  </div>
                </div>
                <div className="bottom_section">
                  {filteredTransactions && filteredTransactions.length > 0 ?
                    (
                      filteredTransactions.map((transaction, index) => (
                        <div className="row ms-0 transaction p-2" key={index} onClick={() => viewPaymentDetails(transaction)} data-bs-toggle="modal" data-bs-target="#paymentDetailsModal">
                          <div className="col-8">
                            <span className="profile_info mb-0">
                              <span className="profileWrapper">
                                <img
                                  className="prof"
                                  src={iconLogo}
                                  alt={transaction.transaction_type}
                                />
                              </span>
                              <span>
                                <h4>Payment {transaction.reference}</h4>
                                <p className="date">{formatDate(transaction.created_at)}</p>
                              </span>
                            </span>
                          </div>
                          <div className="col-4">
                            <h3 className={transaction.transaction_type === "credit" ? "credit-amount" : "debit-amount"}>
                              ₦{transaction.amount}
                            </h3>
                          </div>
                        </div>
                      )))
                    : (
                      <div className="no-transactions">
                        <p>No transaction records found</p>
                      </div>
                    )}
                </div>
              </div>
              <button type="button" className="btn withdraw-btn" data-bs-toggle="modal" data-bs-target="#withdrawModal">Withdraw</button>
            </div>


            {/* Invoice TAB CONTENT  */}
            <div className={activeTab === 9 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="invoice_section">
              <h3>Invoice</h3>

              <div className="transactions">
                <div className="top_section">
                  <div className="btns-filter">
                    {
                      filterDay.map((item, key) => {
                        return (
                          <button
                            type="button"
                            key={key}
                            value={item.value}
                            onClick={filterFunction}
                            className={item.title === "All" ? "btn-filter active" : "btn-filter"}
                          >
                            {item.title}
                          </button>
                        )
                      })
                    }
                  </div>
                </div>

                <div className="bottom_section">
                  {filteredPayments && filteredPayments.length > 0 ? (
                    filteredPayments.map((payment, index) => (
                      <div className="row transaction p-2" key={index} onClick={() => viewPaymentDetails(payment)}>
                        <div className="col-8">
                          <span className="profile_info mb-0">
                            <span className="profileWrapper">
                              <img
                                className="prof"
                                src={payment.status === "paid" ? iconLogo : iconWarning }
                                alt={payment.payment_method}
                              />
                            </span>
                            <span>
                              <h4>Payment {payment.reference}</h4>
                              <p className="date">{formatDate(payment.created_at)}</p>
                            </span>
                          </span>
                        </div>
                        <div className="col-4">
                          <h3 className={payment.status === "paid" ? "credit-amount" : "debit-amount"}>
                            ₦{payment.amount}
                          </h3>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-transactions">
                      <p>No payment records found</p>
                    </div>
                  )}
                </div>
              </div>
              {/* <button type="button" className="btn withdraw-btn">Save Changes</button> */}
            </div>


            {/* BANK ACCOUNT TAB CONTENT  */}
            <div className={activeTab === 10 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="bank_account">
              <h3>Bank Account Details</h3>
              <div className="bank-account-section">
                {accountDetails && accountDetails.bank_name ? (
                  <div className="account-details-card">
                    <div className="details-display">
                      <div className="detail-item">
                        <label>Bank Name:</label>
                        <p>{accountDetails.bank_name}</p>
                      </div>
                      <div className="detail-item">
                        <label>Account Number:</label>
                        <p>{accountDetails.account_number ? `**** **** ${accountDetails.account_number.slice(-4)}` : 'Not provided'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn account-btn mt-3"
                      data-bs-toggle="modal"
                      data-bs-target="#AccountModal"
                    >
                      Edit Account Details
                    </button>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <p>No bank account details added yet. Add your bank account details to enable withdrawals.</p>
                    <button
                      type="button"
                      className="btn account-btn mt-3"
                      data-bs-toggle="modal"
                      data-bs-target="#AccountModal"
                    >
                      Add Bank Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SAVED JOBS TAB CONTENT  */}
            <div className={activeTab === 3 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="saved_jobs">
              <h3>Saved Jobs</h3>
              <div className="row">
                <div className="cards">

                  {savedjobs && savedjobs.length > 0 ? (
                    savedjobs.map((item) => {
                      return (
                        <div className="card" key={item.id}>
                          <div className="card_top">
                            <span className="profile_info">
                              <span>
                                <img className="prof" src={`${API_BASE_URL}${profileImage}`} alt="profile" />
                              </span>
                              <span>
                                <h4>{item.client_first_name} {item.client_last_name}</h4>
                                <img src={Stars} alt="profile" /> <span className="rate_score">{item.client_rating}</span>
                              </span>
                            </span>
                            <span className="top_cta">
                              <button className="btn active" onClick={() => removeSavedJob(item.id)}>Remove &nbsp; <FontAwesomeIcon icon={faCircleXmark} className="icon-saved" /> </button>
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
                              <p>{item.no_of_application} applicant needed</p>
                            </span>
                            <span>
                              <Link to={`../jobdetails/${item.id}`} className="btn">View Job Details</Link>
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="no-saved-jobs">
                      <p>No saved jobs yet.</p>
                    </div>
                  )}

                </div>
              </div>
            </div>


            {/* NOTIFICATIONS TAB CONTENT  */}
            <div className={activeTab === 4 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="notification">
              <h3>Notifications</h3>
              <h4>Set your push notification preferences</h4>
              <form onSubmit={handleSubmit} className="notification_form">
                <div className="row notifications">
                  <div className="col-12 notification">
                    <span>
                      <h4>New Job alert</h4>
                      <label className="form-check-label" htmlFor="notify-switch">Receive push notification for all new job alert</label>
                    </span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        name="newjob"
                        type="checkbox"
                        role="switch"
                        id="notify-switch"
                        value=""
                        checked={Boolean(formData.newjob)}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-12 notification">
                    <span>
                      <h4>Job Reminder</h4>
                      <label className="form-check-label" htmlFor="notify-switch1">Receive push notification for all new job reminder</label>
                    </span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        name="newjobreminder"
                        type="checkbox"
                        role="switch"
                        id="notify-switch1"
                        value=""
                        checked={Boolean(formData.newjobreminder)}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-12 notification">
                    <span>
                      <h4>Job Request Acceptance</h4>
                      <label className="form-check-label" htmlFor="notify-switch2">Receive push notification for all accepted job requests</label>
                    </span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        name="jobrequest"
                        type="checkbox"
                        role="switch"
                        id="notify-switch2"
                        value=""
                        checked={Boolean(formData.jobrequest)}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-12 notification">
                    <span>
                      <h4>Settings</h4>
                      <label className="form-check-label" htmlFor="notify-switch3">Receive push notification for all settings changes</label>
                    </span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        name="settings"
                        type="checkbox"
                        role="switch"
                        id="notify-switch3"
                        value=""
                        checked={Boolean(formData.settings)}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <h4>Set your email notification preferences</h4>
                <div className="row notifications">
                  <div className="col-12 notification">
                    <span>
                      <h4>New Job alert</h4>
                      <label className="form-check-label" htmlFor="notify-switch4">Receive email notification for all  new job alert</label>
                    </span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        name="emailnewjob"
                        type="checkbox"
                        role="switch"
                        id="notify-switch4"
                        value=""
                        checked={Boolean(formData.emailnewjob)}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-12 notification">
                    <span>
                      <h4>Job Reminder</h4>
                      <label className="form-check-label" htmlFor="notify-switch5">Receive email notification for all new job reminder</label>
                    </span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        name="emailjobreminder"
                        type="checkbox"
                        role="switch"
                        id="notify-switch5"
                        value=""
                        checked={Boolean(formData.emailjobreminder)}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-12 notification">
                    <span>
                      <h4>Job Request Acceptance</h4>
                      <label className="form-check-label" htmlFor="notify-switch6">Receive email notification for all accepted job requests</label>
                    </span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        name="jobacceptance"
                        type="checkbox"
                        role="switch"
                        id="notify-switch6"
                        value=""
                        checked={Boolean(formData.jobacceptance)}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-12 notification">
                    <span>
                      <h4>Settings</h4>
                      <label className="form-check-label" htmlFor="notify-switch7">Receive email notification for all settings changes</label>
                    </span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        name="emailsettings"
                        type="checkbox"
                        role="switch"
                        id="notify-switch7"
                        value=""
                        checked={Boolean(formData.emailsettings)}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" name='submit' className="btn btn-save w-100 mt-2">Save Changes</button>
              </form>
            </div>


            {/* RATINGS AND REVIEWS TAB CONTENTS  */}
            <div className={activeTab === 5 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="reviews">
              <h3>Rating & Reviews</h3>
              <div className="row m-0 p-0">
                <div className="col-12 m-0 p-0">
                  <div className="filter-section">
                    {filterButton.map((item, key) => (
                      <button
                        type="button"
                        key={key}
                        value={item.value}
                        onClick={(e) => setFilterState(item.value)}
                        className={filterState === (item.value) ? "filter-btn active" : "filter-btn"}
                      >
                        {item.title}
                      </button>
                    ))}

                  </div>
                </div>
              </div>
              <div className="row">
                <div className="cards">
                  {reviewsLoading && <div>Loading reviews...</div>}
                  {reviewsError && <div className="text-danger">{reviewsError}</div>}
                  {!reviewsLoading && !reviewsError && filteredReviews.length === 0 && (
                    <div>No reviews found.</div>
                  )}
                  {!reviewsLoading && !reviewsError && filteredReviews.map((item, key) => (
                    <div className="card" key={key}>
                      <div className="card_top">
                        <span className="profile_info">
                          <span>
                            <img className="prof" src={`${API_BASE_URL}${item.reviewer_avatar}` || ProfileImage} alt="profile" />
                          </span>
                          <span>
                            <h4>{item.reviewer_name}</h4>
                            <span className="rate_score">{item.reviewer_role}</span>
                          </span>
                        </span>
                        <span className="top_cta">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              style={{
                                color: i < item.rating ? "#5E0096" : "#d3d3d3" // purple for rated, ash for others
                              }}
                            />
                          ))}
                        </span>
                      </div>
                      <span className="review">{item.feedback}</span>
                      <div className="button">
                        <button className="btn w-100" disabled={item.is_read} onClick={() => handleReadReview(item.id, currentUserId)}>{item.is_read ? "Read" : "Mark as Read"}</button>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>


            {/* LOGIN SETTINGS TAB CONTENTS  */}
            <div className={activeTab === 6 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="login_settings">
              <h3>Login Settings</h3>
              <div className="row">
                <div className="col-12">
                  <div className="accordion" id="accordionExample">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOn" aria-expanded="true" aria-controls="collapseOn">
                          <h4>Change Password</h4>
                        </button>
                      </h2>
                      <div id="collapseOn" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                        <div className="accordion-body p-2">
                          <Formik

                            initialValues={{
                              oldpassword: "",
                              newpassword: "",
                              confirmPassword: "",
                            }}

                            validationSchema={Schema}
                            onSubmit={async (values, { setSubmitting }) => {
                              setSubmitting(false);

                              let passworddata = {
                                user_id: userId,
                                old_password: values.oldpassword,
                                new_password: values.newpassword,
                                confirm_password: values.confirmPassword
                              };

                              Axios.post(`${API_BASE_URL}/accountsapp/change-password`, passworddata)
                                .then((response) => {
                                  notifySuccess(response.data.message);
                                  // setTimeout(() => {
                                  //   window.location.reload();
                                  // }, 1000);
                                })
                                .catch((error) => console.error(error.response.data));
                            }
                            }
                          >
                            {({ errors, touched }) => (
                              <Form className="form_settings">
                                {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
                                <div className="mb-2">
                                  <span className="visibility">
                                    <Field type={show} name="oldpassword" id="oldpassword" className="form-control" placeholder="Old Password" />
                                    <FontAwesomeIcon icon={show === "password" ? faEye : faEyeSlash} onClick={() => setShow(show === "password" ? "text" : "password")} className='eye-icon' />
                                  </span>
                                  {touched.oldpassword && errors.oldpassword && (<div className="errors">{errors.oldpassword}</div>)}
                                </div>
                                <div className="mb-2">
                                  <span className="visibility">
                                    <Field type={show1} name="newpassword" id="password" className="form-control" placeholder="New Password" />
                                    <FontAwesomeIcon icon={show1 === "password" ? faEye : faEyeSlash} onClick={() => setShow1(show1 === "password" ? "text" : "password")} className='eye-icon' />
                                  </span>
                                  {touched.newpassword && errors.newpassword && (<div className="errors">{errors.newpassword}</div>)}
                                </div>
                                <div className="mb-2" >
                                  <span className="visibility">
                                    <Field type={show2} name="confirmPassword" id="confirmPassword" className="form-control" placeholder="Confirm Password" />
                                    <FontAwesomeIcon icon={show2 === "password" ? faEye : faEyeSlash} onClick={() => setShow2(show2 === "password" ? "text" : "password")} className='eye-icon' />
                                  </span>
                                  {touched.confirmPassword && errors.confirmPassword && (<div className="errors">{errors.confirmPassword}</div>)}
                                </div>
                                <button type="submit" name='submit' className="btn btn-lg primary-btn w-100 mt-2">Save Changes</button>
                              </Form>
                            )}
                          </Formik>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>



            {/* FEEDBACK TAB CONTENTS  */}
            <div className={activeTab === 7 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="feedback">
              <h3>Feedback</h3>
              <div className="row">
                <div className="col-12">
                  <img src={iconStamp} alt="Paeshift Feedback Icon" className="brand_stamp" />
                </div>
                <div className="col-12">
                  <h2>Paeshift wants your feedback</h2>
                  <Formik
                    initialValues={{
                      firstName: "",
                      lastName: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                    }}

                    validationSchema={feedbackSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                      setSubmitting(false);
                      let feedbackData = {
                        category: values.feedbacktype,
                        message: values.feedback,
                        user_id: Number(currentUserId),
                        rating: 5

                      };



                      Axios.post(`${API_BASE_URL}/rating/company/feedback/`, feedbackData)
                        .then((response) => {

                          notifySuccess(`Thank you for your feedback`);
                          setTimeout(() => {
                            window.location.reload();
                          }, 1000);

                        })
                        .catch((error) => console.error(error));

                    }
                    }
                  >
                    {({ errors, touched }) => (
                      <Form className="form_settings" >
                        <div className="row">
                          <div className="col-12 mb-3">
                            <label htmlFor="feedbacktype" className="form-label mb-0">Feedback Type</label>
                            <Field as="select" name="feedbacktype" id="feedbacktype" className="form-control" >
                              <option value="">Choose type of Feedback</option>
                              <option value="dispute">Dispute</option>
                              <option value="review">Review</option>
                              <option value="general">General</option>
                            </Field>
                            {touched.feedbacktype && errors.feedbacktype && (<div className="errors">{errors.feedbacktype}</div>)}
                          </div>
                        </div>
                        <div className="my-2">
                          <Field name="feedback" className="form-control" as="textarea" placeholder="We'd love to hear from you" />
                          {touched.feedback && errors.feedback && (<div className="errors">{errors.feedback}</div>)}
                        </div>
                        <button type="submit" name="submit" className="btn btn-lg primary-btn w-100 mt-2">Submit</button>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>


            {/* ABOUT PAESHIFT TAB CONTENT  */}
            <div className={activeTab === 8 ? "animate__animated animate__fadeIn tab-content display" : "tab-content"} id="about_paeshift">
              <h3>About Paeshift</h3>
              <div className="row">
                <div className="col-12">
                  <div className="accordion" id="accordionExample2">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                          <h4>Privacy Policy</h4>
                        </button>
                      </h2>
                      <div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionExample2">
                        <div className="accordion-body">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                          <h4>Terms & Condition</h4>
                        </button>
                      </h2>
                      <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample2">
                        <div className="accordion-body">
                          Terms dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                          <h4>Social Media</h4>
                        </button>
                      </h2>
                      <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionExample2">
                        <div className="accordion-body">
                          <a href="#" className="d-flex align-items-center justify-content-between py-3 mb-2" style={{ textDecoration: 'none' }}>
                            <span className="d-flex align-items-center">
                              <FontAwesomeIcon icon={faInstagram} />
                              <span className="text-dark ms-2">Instagram</span>
                            </span>
                            <FontAwesomeIcon className="socialmedia-icon ms-2" icon={faChevronRight} />
                          </a>
                          <a href="#" className="d-flex align-items-center justify-content-between py-3 mb-2" style={{ textDecoration: 'none' }}>
                            <span className="d-flex align-items-center">
                              <FontAwesomeIcon icon={faFacebook} />
                              <span className="text-dark ms-2">Facebook</span>
                            </span>
                            <FontAwesomeIcon className="socialmedia-icon ms-2" icon={faChevronRight} />
                          </a>
                          <a href="#" className="d-flex align-items-center justify-content-between py-3 " style={{ textDecoration: 'none' }}>
                            <span className="d-flex align-items-center">
                              <FontAwesomeIcon icon={faTiktok} />
                              <span className="text-dark ms-2">Tiktok</span>
                            </span>
                            <FontAwesomeIcon className="socialmedia-icon ms-2" icon={faChevronRight} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div >
        <ToastContainer {...toastContainerProps} />
        <Walletmodal accountDetails={accountDetails} />
        <WithdrawModal accountDetails={accountDetails} />
        <AccountModal />
        <Notificationmodal setNewNotification={setNewNotification} setReadCount={setReadCount} />
        <PaymentDetailsmodal payment={selectedPayment} />
      </section >
    </main>
  )
}

export default Main
