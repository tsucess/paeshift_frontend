import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faServer, faUser, faUserGroup, faSearch, faMapPin, faLocation, faLocationDot, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faBell, faBookmark } from "@fortawesome/free-regular-svg-icons";

import { VscBellDot } from "react-icons/vsc";

import Stars from "../../assets/images/stars.png";
import iconWallet from "../../assets/images/wallet.png";
import iconLogo from "../../assets/images/icon-logo.png";
import Axios from "axios";
import { faBarsProgress } from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import ProfileImage from "../../assets/images/profile.png";
import Walletmodal from "../walletmodal/Walletmodal";
import Notificationmodal from "../notificationmodal/Notificationmodal";
import getCurrentUser from "../../auth/getCurrentUser";
import ConvertHoursToTime from "../../auth/ConvertHoursToTime";
import "./Main.css";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { showSuccessToast, showErrorToast, toastContainerProps } from '../../utils/toastConfig';

import { format, parseISO, isToday, isYesterday, subDays, isThisWeek, isThisMonth } from 'date-fns';
import WithdrawModal from "../withdrawmodal/WithdrawModal";
import AccountModal from "../accountModal/AccountModal";
import { API_BASE_URL } from "../../config.js";

const formatDate = (dateString) => {
  const date = parseISO(dateString);
  const day = format(date, 'do'); // 1st, 2nd, etc.
  const weekday = format(date, 'EEEE'); // Monday
  const month = format(date, 'MMMM'); // April
  const year = format(date, 'yyyy'); // 2025
  return `${weekday} ${day} ${month}, ${year}`;
};


const getRelativeDateLabel = (dateString) => {
  const date = parseISO(dateString);

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  const now = new Date();
  // Last Week: more than 7 days ago, within the last calendar week
  const sevenDaysAgo = subDays(now, 7);
  if (date > sevenDaysAgo && !isThisWeek(date)) return 'Last week';

  // Last Month
  // if (isLastMonth(date)) return 'Last month';

  // Fallback
  return format(date, 'do MMMM, yyyy'); // e.g., 12th March, 2025
};





const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];





const Main = () => {
  // let user = useRecoilValue(userInfo);
  const [users, setUsers] = useState();
  let [profile, setProfile] = useState("");
  const [savedJobId, getSavedJobId] = useState("");
  const [allJobsMatched, setAllJobsMatched] = useState([]); // should be an array, not string
  const [filters, setFilters] = useState({
    type: "",
    industry: "",
  });
  const [searchWork, setSearchWork] = useState("");

  const [jobs, setJobs] = useState();
  const [filterIndustry, setFilterIndustry] = useState("");
  const [industries, setIndustries] = useState([]);
  let [savedJobs, getSavedJobs] = useState("");

  const [newNotification, setNewNotification] = useState("");
  const [newnotify, setReadCount] = useState("");





  const notifySuccess = (message) => {
    return showSuccessToast(message);
  };

  const notifyError = (message) => {
    return showErrorToast(message);
  };

  // Update the allJobs list whenever filters change
  // useEffect(() => {
  //   const filtered = allJobs.filter((job) => {
  //     const typeMatch = filters.type === "" || job.type === filters.type;
  //     const shiftMatch = filters.shift === "" || job.shift === filters.shift;
  //     return typeMatch && shiftMatch;
  //   });
  //   setAllJobs(filtered);
  // }, [filters]);


  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const filterByJobsIndustry = (e) => {
    setFilterIndustry(e.target.value)
  }



  function timeToSeconds(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }



  const currentUserId = localStorage.getItem("user_id");


  const fetchSavedJobs = (currentUserId) => {

    if (currentUserId) {

      // GET ALL SAVED JOBS 
      Axios.get(`${API_BASE_URL}/jobs/saved-jobs/${currentUserId}`)
        .then((response) => {
          getSavedJobs(response.data.saved_jobs);
        })
        .catch((error) => console.error(error));
    }
  }


  const fetchAllJobs = () => {

    // Update GET request to use query parameters for /jobs/alljobsmatched
    Axios.get(`${API_BASE_URL}/jobs/alljobsmatched?user_id=${currentUserId}`)
      .then((response) => {
        const jobsWithDuration = response.data.jobs.map(job => {
          const jobStarts = timeToSeconds(job.start_time_str);
          const jobEnds = timeToSeconds(job.end_time_str);
          const duration = ((jobEnds - jobStarts) / 60) / 60;
          return { ...job, duration };
        });
        setAllJobsMatched(jobsWithDuration);
      })
      .catch((error) => console.error(error));
  }




  useEffect(() => {
    // GET CURRENT USER PROFILE 
    getCurrentUser(setProfile);

    // Fetch job industries and subcategories on component mount
    const fetchIndustries = async () => {
      try {
        const response = await Axios.get(`${API_BASE_URL}/jobs/job-industries/`);
        setIndustries(response.data);
      } catch (error) {
        console.error("Error fetching industries:", error);
      }
    };

    fetchIndustries();

    fetchAllJobs();
    fetchSavedJobs(currentUserId);



  }, [])





  // SAVE A JOB
  const saveJob = (UID, jobID) => {
    const savejobData = {
      user_id: UID,
      job_id: jobID
    }
    try {
      Axios.post(`${API_BASE_URL}/jobs/save-job/add/`, savejobData)
        .then((response) => {
          if (response.status === 200) {
            notifySuccess("Job saved successfully");
            fetchSavedJobs(currentUserId);
            fetchAllJobs();
          }
        })
      // .catch((error) => console.error(error));

    } catch (error) {
      console.error(error);
      notifyError(error);
    }
  }












  // Filtering logic before rendering
  const filteredJobs = allJobsMatched.filter((job) => {
    // Filter by type
    const typeMatch = !filters.type || job.shift_type === filters.type;
    // Filter by industry
    const industryMatch = !filters.industry || job.industry_name === filters.industry;
    // Filter by search
    const searchMatch =
      !searchWork ||
      job.title.toLowerCase().includes(searchWork.toLowerCase());
    return typeMatch && industryMatch && searchMatch;
  });



  // Custom MenuProps for Select
  const menuProps = {
    PaperProps: {
      sx: {
        '& .MuiMenuItem-root.Mui-selected, & .MuiMenuItem-root:hover': {
          background: '#ECE5FF',
          color: '#5E0096',
          borderRadius: 2,
        },
        '& .MuiMenuItem-root.Mui-selected:hover': {
          background: '#ECE5FF',
          color: '#5E0096',
          borderRadius: 2,
        },
        // Add padding to the menu list
        '& .MuiList-root': {
          padding: '8px',
        },
      },
    },
  };


  return (
    <main className="col-12 col-md-12 col-lg-9 col-xl-10 ms-sm-auto  px-md-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap flex-md-nowrap align-items-center pb-2">
        <div className="page_header">
          <h1 className="m-0 p-0">Home</h1>
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
          <button type="button" className="btn btn-wallet px-3" data-bs-toggle="modal" data-bs-target="#walletModal">
            <img src={iconWallet} alt="" srcSet="" />₦ {profile.wallet_balance}
          </button>
        </div>
      </div>


      <section className="container container__data">
        <div className="row m-0 p-0">
          <div className="col-12 m-0 p-0">
            <div className="filter-section">
              <button
                type="button"
                className={`filter-btn${!filters.type && !filters.industry ? " active" : ""}`}
                onClick={() => setFilters({ type: "", industry: "" })}
              >
                All
              </button>

              <Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                displayEmpty
                MenuProps={menuProps}
                className={filters.type ? "active" : ""}
                sx={{
                  minWidth: 120,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  color: '#5E0096',
                  background: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fff',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fff',
                  },
                  '& .MuiOutlinedInput-root': {
                    boxShadow: 'none',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused': {
                    boxShadow: 'none',
                    outline: 'none',
                  },
                }}
              >
                <MenuItem value="">Type of Shift</MenuItem>
                <MenuItem value="morning">Morning Shift</MenuItem>
                <MenuItem value="afternoon">Day Shift</MenuItem>
                <MenuItem value="night">Night Shift</MenuItem>
              </Select>

              <Select
                name="industry"
                value={filters.industry}
                onChange={handleFilterChange}
                displayEmpty
                MenuProps={menuProps}
                className={filters.industry ? "active" : ""}
                sx={{
                  minWidth: 120,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  color: '#5E0096',
                  background: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fff',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#fff',
                  },
                  '& .MuiOutlinedInput-root': {
                    boxShadow: 'none',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused': {
                    boxShadow: 'none',
                    outline: 'none',
                  },
                }}
              >
                <MenuItem value="">Sort Jobs By</MenuItem>
                {industries.map((industry) => (
                  <MenuItem key={industry.id} value={industry.name}>
                    {industry.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="cards">


            {profile.phone_number && profile.location ?
              filteredJobs.map((item, key) => {

                const isJobSaved = savedJobs?.some(saved => saved.job?.id === item.id);

                return (
                  <div className="card" key={key}>
                    <div className="card_top">
                      <span className="profile_info">
                        <span>
                          <img className="prof" src={`${API_BASE_URL}${item.client_profile_pic_url}` || ProfileImage} alt="profile" />
                        </span>
                        <span>
                          <h4>{item.client_first_name} {item.client_last_name}</h4>
                          <img src={Stars} alt="profile" /> <span className="rate_score">{item.client_rating}</span>
                        </span>
                      </span>
                      <span className="top_cta">
                        <button className={isJobSaved ? "btn active" : "btn"} onClick={() => saveJob(profile.user_id, item.id)}>{isJobSaved ? "Saved" : "Save"} &nbsp; <FontAwesomeIcon icon={faBookmark} className="icon-saved" /> </button>
                      </span>
                    </div>
                    <div className="duration">
                      <h3>{ConvertHoursToTime(item.duration)} Contract </h3>
                      <span className="time_post">{item.date_posted_human}</span>
                    </div>
                    <span className="title">
                      <h3 className="text-dark text-truncate" >{item.title}</h3>
                    </span>
                    <h4>{formatDate(item.start_date)} {item.start_time_human}</h4>
                    <span className="address text-truncate"><FontAwesomeIcon icon={faLocationDot} /> &nbsp; {item.location}</span>
                    <div className="price">
                      <span>
                        <h6>₦ {Math.ceil(item.rate / item.applicants_needed)} /hr</h6>
                        <p>{item.applicants_needed} applicant needed</p>
                      </span>
                      <span>
                        <Link to={`../jobdetails/${item.id}`} className="btn">View Job Details</Link>
                      </span>
                    </div>
                  </div>
                )
              })
              :
              <div className="text-center w-100 p-5">
                <p>Update your Phone number and Address in settings click to <Link to={"/settings"} className="fw-bold text-purple">Update Profile</Link></p>
              </div>
            }
          </div>
        </div>

        <ToastContainer {...toastContainerProps} />
        <Walletmodal />
        <WithdrawModal />
        <AccountModal />
        <Notificationmodal setNewNotification={setNewNotification} setReadCount={setReadCount} />
      </section>
    </main >
  )
}

export default Main
