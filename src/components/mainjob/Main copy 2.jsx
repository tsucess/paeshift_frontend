import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Jobs.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faServer, faUser, faUserGroup, faSearch, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faBell, faBookmark } from "@fortawesome/free-regular-svg-icons";
import Stars from "../../assets/images/stars.png";
import iconWallet from "../../assets/images/wallet.png";
import iconLogo from "../../assets/images/icon-logo.png";
import Axios from "axios";
import { faBarsProgress } from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import ProfileImage from "../../assets/images/profile.png";
import Walletmodal from "../walletmodal/Walletmodal";
import Notificationmodal from "../notificationmodal/Notificationmodal";
import Feedbackmodal from "../feedbackmodal/Feedbackmodal";
import PaymentMethodmodal from "../paymentmethodmodal/PaymentMethodmodal";
import getCurrentUser from "../../auth/getCurrentUser";
import CountdownTimer from "../../auth/CountdownTimer";
import ConvertHoursToTime from "../../auth/ConvertHoursToTime";
import { ToastContainer } from 'react-toastify';
import { showSuccessToast, toastContainerProps } from '../../utils/toastConfig';
import { format, parseISO, isToday, isYesterday, subDays, isThisWeek, isThisMonth } from 'date-fns';
import PostJobSuccessmodal from "../postjobsuccessmodal/PostJobSuccessmodal";
import OngoingStatusmodal from "../ongoingstatusmodal/OngoingStatusmodal";
import { API_BASE_URL } from "../../config";

const formatDate = (dateString) => {
  const date = parseISO(dateString);
  const day = format(date, 'do'); // 1st, 2nd, etc.
  const weekday = format(date, 'EEEE'); // Monday
  const month = format(date, 'MMMM'); // April
  const year = format(date, 'yyyy'); // 2025
  return `${weekday} ${day} ${month}, ${year}`;
};

let id = 0;
export const filterButton = [
  {
    id: id++,
    title: 'All',
    value: ''
  },
  // {
  //   id: id++,
  //   title: 'Pending',
  //   value: 'pending'
  // },
  {
    id: id++,
    title: 'Upcoming',
    value: 'upcoming'
  },
  {
    id: id++,
    title: 'Ongoing',
    value: 'ongoing'
  },
  {
    id: id++,
    title: 'Completed',
    value: 'completed'
  },
  {
    id: id++,
    title: 'Canceled',
    value: 'cancel'
  },
]

const Main = () => {
  // let user = useRecoilValue(userInfo);

  // const [prods, setProduct] = useState();
  // const [admins, setAdmins] = useState();
  // const [users, setUsers] = useState();

  const [searchWork, setSearchWork] = useState("");

  const [filterState, setFilterState] = useState("");
  const [jobs, setJobs] = useState("")
  // const [client, setClient] = useState("")
  let [profile, setProfile] = useState("");
  // const [duration, setJoburation] = useState("");


  const filterFunction = (e) => {
    const buttons = document.getElementsByClassName('filter-btn');
    setFilterState(e.target.value);
    for (let index = 0; index < buttons.length; index++) {
      buttons[index].classList.remove('active');;
    }
    e.target.classList.add('active');
  }



  const currentUserId = localStorage.getItem("user_id");
  const currentUserRole = localStorage.getItem("user_role");
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "/signin";
    return null; // No token means no logged-in user
  }

  const notifySuccess = (message) => {
    return showSuccessToast(message);
  };




  useEffect(() => {

    // GET CURRENT USER PROFILE 
    getCurrentUser(setProfile);


    // `/jobs/jobs/{job_id}/shifts/` → Create or Update Shift  
    // ✔️ **GET** `/jobs/jobs/{job_id}/shifts/` → Get Job Shifts  
    // ✔️ ** POST ** `/jobs/jobs/{job_id}/start-shift/` → Start Shift  
    // ✔️ ** POST ** `/jobs/jobs/{job_id}/end-shift/` → End Shift

    function timeToSeconds(timeStr) {
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }

    let baseUrl;
    if (currentUserRole === "applicant") {
      baseUrl = `${API_BASE_URL}/jobs/alljobsmatched`;
      Axios.get(`${baseUrl}?user_id=${currentUserId}`)
        .then((response) => {

          const jobsWithDuration = response.data.jobs.map(job => {
            const jobStarts = timeToSeconds(job.start_time_str);
            const jobEnds = timeToSeconds(job.end_time_str);
            const duration = ((jobEnds - jobStarts) / 60) / 60;
            return { ...job, duration };
          });
          setJobs(jobsWithDuration);
          console.log(jobsWithDuration);

        })
        .catch((error) => console.error(error));
    }
    else {
      Axios.get(`${API_BASE_URL}/jobs/clientjobs/${currentUserId}`)
        .then((response) => {
          const jobsWithDuration = response.data.jobs.map(job => {
            const jobStarts = timeToSeconds(job.start_time_str);
            const jobEnds = timeToSeconds(job.end_time_str);
            const duration = ((jobEnds - jobStarts) / 60) / 60;
            return { ...job, duration };
          });
          setJobs(jobsWithDuration);
          console.log(jobsWithDuration);
        })
        .catch((error) => console.error(error));
    }

    // Axios.get(`${API_BASE_URL}/jobs/jobs/${job_id}/shifts/`)
    //   .then((response) => {
    //     // setJobs(response.data.jobs);
    //     // console.log(response.data.jobs);
    //   })
    //   .catch((error) => console.error(error));
  }, [])


  const handleStartShift = (job_id) => {
    console.log(job_id);
    Axios.post(`${API_BASE_URL}/jobs/start-shift/${job_id}`)
      .then((response) => {
        // setJobs(response.data.jobs);
        console.log(response);
        const message = response.data.detail;
        notifySuccess(message);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((error) => console.error(error));
  }





  const handleCancelJob = (job_id) => {
    Axios.post(`${API_BASE_URL}/jobs/job/cancel/${job_id}/`)
      .then((response) => {
        setJobs(response.data.jobs);
        console.log(response.data.jobs);
      })
      .catch((error) => console.error(error));
  }





  return (
    <main className="col-12 col-md-12 col-lg-9 col-xl-10 ms-sm-auto  px-md-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap flex-md-nowrap align-items-center pb-2 ">
        <div className="page_header">
          <h1 className="m-0 p-0">Jobs</h1>
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
              <FontAwesomeIcon className="" icon={faBell} />
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


            {

              jobs && profile &&
              jobs.filter((item) => {
                return searchWork.toLowerCase() === "" ? item.status.toLowerCase().includes(filterState.toLowerCase()) : item.title.toLowerCase().includes(searchWork.toLowerCase());
              }).map((item, key) => {
                return (
                  <div className="card" key={key}>
                    <Link to={"../jobdetails/" + item.id} >
                      <div className="card_top">
                        <span className="profile_info">
                          <span>
                            <img className="prof" src={ProfileImage} alt="profile" />
                          </span>
                          <span>
                            <h4>{item.client_first_name + " " + item.client_last_name}</h4>
                            <img src={Stars} alt="rating_star" /> <span className="rate_score">{item.client_rating ? item.client_rating : "Not rated yet"}</span>
                          </span>
                        </span>
                        <span className="top_cta">
                          <button className={"btn " + item.status}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</button>
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
                      {
                        item.status === 'upcoming' ?
                          profile.role === 'client' ?
                            <div className="bottom">
                              <button className="track-btn w-100" onClick={() => handleStartShift(item.id)} >Start Shift</button>
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
                                <CountdownTimer initialTime={item.duration + `:00:00`} />
                              </span>
                              <span>
                                <button className="track-btn" >Take Action &nbsp; <FontAwesomeIcon icon={faChevronDown} /> </button>
                                {/* <button className="track-btn" onClick={() => handleEndShift(item.id)}>End Shift</button> */}
                                <OngoingStatusmodal itemId={item.id} />
                              </span>
                            </div>
                            :
                            <div className="bottom">
                              <span>
                                <CountdownTimer initialTime={item.duration + `:00:00`} />
                              </span>
                              <span>
                                <button className="track-btn">Share Location</button>
                              </span>
                            </div>
                          :
                          ""
                      }
                      {
                        item.status === 'completed' || item.status === 'canceled' ?
                          profile.role === 'client' ?
                            <div className="bottom">
                              <button className="track-btn w-100" data-bs-toggle="modal" data-bs-target="#feedbackModal" >Feedback Applicant</button>
                            </div>
                            :
                            <div className="bottom">
                              <button className="track-btn w-100" data-bs-toggle="modal" data-bs-target="#feedbackModal" >Feedback Client</button>
                            </div>
                          :
                          ""
                      }
                      {
                        item.status === 'pending' ?
                          profile.role === 'client' ?
                            <div className="bottom">
                              <button className="track-btn w-100" data-bs-toggle="modal" data-bs-target="#paymentMethodModal" >Proceed to payment</button>
                            </div>
                            :
                            <div className="bottom">
                              <button className="track-btn w-100" disabled >Not Approved</button>
                            </div>
                          :
                          ""
                      }
                    </Link>
                  </div>
                );
              })
              // JobsData.filter((item) => {
              //   return filterState.toLowerCase() === "" ? item : item.status.includes(filterState.toLowerCase());
              // }).map((item, key) => {
              //   return (
              //       <div className={"col-6 col-md-3 state " + item.image} key={key}>
              //         <h4>{item.location}</h4>
              //         <p>{item.description}</p>
              //       </div>
              //   );
              // })
            }

          </div>
        </div>
      </section>
        <ToastContainer {...toastContainerProps} />
        <Walletmodal />
        <Notificationmodal />
        <Feedbackmodal />
        <PaymentMethodmodal />
    </main >
  )
}

export default Main
