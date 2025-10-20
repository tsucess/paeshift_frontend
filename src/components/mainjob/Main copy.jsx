import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faServer, faUser, faUserGroup, faSearch, faChevronDown,
  faBarsProgress, faBars
} from "@fortawesome/free-solid-svg-icons";
import { faBell, faBookmark } from "@fortawesome/free-regular-svg-icons";
import {
  format, parseISO
} from 'date-fns';

import Stars from "../../assets/images/stars.png";
import iconWallet from "../../assets/images/wallet.png";
import ProfileImage from "../../assets/images/profile.png";
import Axios from "axios";
import { API_BASE_URL } from "../../config";

import Walletmodal from "../walletmodal/Walletmodal";
import Notificationmodal from "../notificationmodal/Notificationmodal";
import Feedbackmodal from "../feedbackmodal/Feedbackmodal";
import PaymentMethodmodal from "../paymentmethodmodal/PaymentMethodmodal";
import PostJobSuccessmodal from "../postjobsuccessmodal/PostJobSuccessmodal";
import OngoingStatusmodal from "../ongoingstatusmodal/OngoingStatusmodal";
import getCurrentUser from "../../auth/getCurrentUser";
import CountdownTimer from "../../auth/CountdownTimer";
import ConvertHoursToTime from "../../auth/ConvertHoursToTime";
import { ToastContainer } from 'react-toastify';
import { showSuccessToast, toastContainerProps } from '../../utils/toastConfig';

import "./Jobs.css";

const filterButton = [
  { id: 0, title: 'All', value: '' },
  { id: 1, title: 'Upcoming', value: 'upcoming' },
  { id: 2, title: 'Ongoing', value: 'ongoing' },
  { id: 3, title: 'Completed', value: 'completed' },
  { id: 4, title: 'Canceled', value: 'cancel' },
];

const formatDate = (dateString) => {
  const date = parseISO(dateString);
  return `${format(date, 'EEEE')} ${format(date, 'do')} ${format(date, 'MMMM')}, ${format(date, 'yyyy')}`;
};

const Main = () => {
  const [searchWork, setSearchWork] = useState("");
  const [filterState, setFilterState] = useState("");
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState("");

  const currentUserId = localStorage.getItem("user_id");
  const currentUserRole = localStorage.getItem("user_role");
  const token = localStorage.getItem("access_token");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }

    getCurrentUser(setProfile);

    const timeToSeconds = (timeStr) => {
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };

    const fetchJobs = async () => {
      try {
        const url = currentUserRole === "applicant"
          ? `${API_BASE_URL}/jobs/alljobsmatched?user_id=${currentUserId}`
          : `${API_BASE_URL}/jobs/clientjobs/${currentUserId}`;

        const { data } = await Axios.get(url);
        const jobsWithDuration = data.jobs.map(job => {
          const duration = (timeToSeconds(job.end_time_str) - timeToSeconds(job.start_time_str)) / 3600;
          return { ...job, duration };
        });

        setJobs(jobsWithDuration);
      } catch (error) {
        console.error(error);
      }
    };

    fetchJobs();
  }, [navigate, token, currentUserId, currentUserRole]);

  const notifySuccess = (message) => {
    return showSuccessToast(message);
  };

  const handleStartShift = async (job_id) => {
    try {
      const { data } = await Axios.post(`${API_BASE_URL}/jobs/start-shift/${job_id}`);
      notifySuccess(data.detail);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelJob = async (job_id) => {
    try {
      const { data } = await Axios.post(`${API_BASE_URL}/jobs/job/cancel/${job_id}/`);
      setJobs(data.jobs);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredJobs = jobs.filter(item =>
    (searchWork === "" ? item.status.toLowerCase().includes(filterState.toLowerCase()) : item.title.toLowerCase().includes(searchWork.toLowerCase()))
  );

  const renderActionButtons = (item) => {
    if (item.status === 'upcoming') {
      return profile.role === 'client' ? (
        <button className="track-btn w-100" onClick={() => handleStartShift(item.id)}>Start Shift</button>
      ) : (
        <>
          <button className="cancel" onClick={() => handleCancelJob(item.id)}>Cancel</button>
          <Link to={`../jobdetails/${item.id}`} className="track-btn">Track Location</Link>
        </>
      );
    }

    if (item.status === 'ongoing') {
      return (
        <>
          <CountdownTimer initialTime={`${item.duration}:00:00`} />
          {profile.role === 'client' ? <OngoingStatusmodal itemId={item.id} /> : <button className="track-btn">Share Location</button>}
        </>
      );
    }

    if (['completed', 'canceled'].includes(item.status)) {
      return <button className="track-btn w-100" data-bs-toggle="modal" data-bs-target="#feedbackModal">Feedback {profile.role === 'client' ? 'Applicant' : 'Client'}</button>;
    }

    if (item.status === 'pending') {
      return profile.role === 'client' ? (
        <button className="track-btn w-100" data-bs-toggle="modal" data-bs-target="#paymentMethodModal">Proceed to payment</button>
      ) : (
        <button className="track-btn w-100" disabled>Not Approved</button>
      );
    }

    return null;
  };

  return (
    <main className="col-12 col-md-12 col-lg-9 col-xl-10 ms-sm-auto px-md-4">
      <div className="d-flex justify-content-between align-items-center pb-2">
        <h1 className="m-0 p-0">Jobs</h1>
        <div className="searchbar-section">
          <div className="serachbar-notify">
            <div className="me-2 searchbar">
              <input
                className="form-control searchbar-input"
                onChange={(e) => setSearchWork(e.target.value)}
                type="text"
                placeholder="Search"
              />
              <FontAwesomeIcon className="search-icon" icon={faSearch} />
            </div>
            <button className="notification-icon px-3" data-bs-toggle="modal" data-bs-target="#notificationModal">
              <FontAwesomeIcon icon={faBell} />
            </button>
          </div>
          {profile.role === "applicant" && (
            <button className="btn btn-wallet px-3" data-bs-toggle="modal" data-bs-target="#walletModal">
              <img src={iconWallet} alt="wallet" /> {profile.wallet_balance}
            </button>
          )}
        </div>
      </div>

      <section className="container container__data">
        <div className="filter-section">
          {filterButton.map(btn => (
            <button
              key={btn.id}
              value={btn.value}
              onClick={(e) => setFilterState(e.target.value)}
              className={`filter-btn ${btn.title === 'All' ? 'active' : ''}`}
            >
              {btn.title}
            </button>
          ))}
        </div>

        <div className="row mt-3">
          <div className="cards jobs">
            {filteredJobs.map((item, key) => (
              <div className="card" key={key}>
                <Link to={`../jobdetails/${item.id}`}>
                  <div className="card_top">
                    <span className="profile_info">
                      <img className="prof" src={ProfileImage} alt="profile" />
                      <span>
                        <h4>{`${item.client_first_name} ${item.client_last_name}`}</h4>
                        <img src={Stars} alt="rating" />
                        <span className="rate_score">{item.client_rating || "Not rated yet"}</span>
                      </span>
                    </span>
                    <span className="top_cta">
                      <button className={`btn ${item.status}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</button>
                    </span>
                  </div>
                  <div><h2>{item.title}</h2></div>
                  <div><p>Location:</p><h4 className="text-truncate">{item.location}</h4></div>
                  <div><p>Date:</p><h4>{profile.role === 'applicant' ? item.date_human : formatDate(item.date)}</h4></div>
                  <div><p>Time:</p><h4>{item.start_time_human}</h4></div>
                  <div><p>Contract Duration:</p><h4>{ConvertHoursToTime(item.duration)}</h4></div>
                  <div><p>Amount:</p><h4>₦{item.rate}</h4></div>
                  <div className="bottom">{renderActionButtons(item)}</div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <ToastContainer />
        <Walletmodal />
        <Notificationmodal />
        <Feedbackmodal />
        <PaymentMethodmodal />
      </section>
    </main>
  );
};

export default Main;