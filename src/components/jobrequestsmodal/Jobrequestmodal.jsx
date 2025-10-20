import React, { useState, useEffect } from "react";
import Stars from "../../assets/images/stars.png";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBookmark } from "@fortawesome/free-regular-svg-icons";
import { faLocationDot, faStar } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import ProfileImage from "../../assets/images/profile.png"
import "./Jobrequestmodal.css";
import { API_BASE_URL } from "../../config";

import ConvertHoursToTime from "../../auth/ConvertHoursToTime";

import { format, parseISO, isToday, isYesterday, subDays, isThisWeek, isThisMonth } from 'date-fns';

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
  {
    id: id++,
    title: 'Pending',
    value: 'pending'
  },
  {
    id: id++,
    title: 'Completed',
    value: 'completed'
  },
]












const Jobrequestmodal = () => {
  const [toggle, setToggle] = useState(1);
  const [jobs, setJobs] = useState();
  const [filterState, setFilterState] = useState("");
  const userId = localStorage.getItem("user_id");


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // CLIENT JOBS ENDPOINT
    let currentUserId = userId;

    if (!currentUserId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Axios.get(`${API_BASE_URL}/jobs/clients/clientjobs/${currentUserId}`)
      .then((response) => {
        setJobs(response.data.jobs);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching client jobs:", error);
        setError("Failed to load jobs. Please try again later.");
        setLoading(false);
      });
  }, [])


  // Filter Function
  const filterFunction = (e) => {
    const buttons = document.getElementsByClassName('btn-filter');
    setFilterState(e.target.value);
    for (let index = 0; index < buttons.length; index++) {
      buttons[index].classList.remove('active');;
    }
    e.target.classList.add('active');
  }


  function updateToggle(id) {
    setToggle(id);
  }

  // Function to handle job selection for preview
  const selectedJob = (jobId) => {
    // This function should be implemented to handle job selection
    // For now, we'll just log the job ID
  }


  return (
    <div className="modal fade come-from-modal right" id="jobrequestModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">All Job Requests</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body py-0">
            <div className="row mb-2 ">
              <div className="col-12 p-2 filters">
                {
                  filterButton.map((item, key) => {
                    return (
                      <button type="button" key={key} value={item.value} onClick={filterFunction} className={item.title === "All" ? "btn btn-filter active" : "btn btn-filter"}>{item.title}</button>
                    )
                  })
                }
              </div>
            </div>
            <div className="row ">
              <div className="cards">
                {loading && (
                  <div className="text-center p-4">
                    <p>Loading jobs...</p>
                  </div>
                )}

                {error && (
                  <div className="text-center p-4">
                    <p className="text-danger">{error}</p>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => {
                        setLoading(true);
                        setError(null);
                        Axios.get(`${API_BASE_URL}/jobs/clients/clientjobs/${userId}`)
                          .then((response) => {
                            setJobs(response.data.jobs);
                            setLoading(false);
                          })
                          .catch((error) => {
                            console.error("Error fetching client jobs:", error);
                            setError("Failed to load jobs. Please try again later.");
                            setLoading(false);
                          });
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!loading && !error && jobs && jobs.length === 0 && (
                  <div className="text-center p-4">
                    <p>No jobs found. Create a new job to get started.</p>
                  </div>
                )}

                {!loading && !error && jobs &&
                jobs.filter((item) => {
                  return item.status.toLowerCase() === "all" ? item :  item.status.toLowerCase().includes(filterState.toLowerCase()) ;
                  // return item.status.toLowerCase() === "all" ? item : (item.status.toLowerCase() === "pending"? item.status.toLowerCase().includes(filterState.toLowerCase()): !item.status.toLowerCase().includes(filterState.toLowerCase())) ;
                })
                .map((item, key) => {
                  return (
                    <div className="card" key={key}>
                      <div className="card_top">
                        <span className="profile_info">
                          <span>
                            <img className="prof" src={ProfileImage} alt="profile" />
                          </span>
                          <span>
                            <h4>{item.client_first_name} {item.client_last_name}</h4>
                            <img src={Stars} alt="profile" /> <span className="rate_score">{item.client_rating}</span>
                          </span>
                        </span>
                        <span className="top_cta">
                          {/* <button className="btn">{item.applicants_count > 0 ? item.applicants_count : "No applicant yet"}</button> */}
                          <button className={item.status === "pending" ? "btn color-yellow" : "btn"}>{item.status !== "pending" ? item.applicants_count > 0 ? item.applicants_count + " " + "applicant" : "No applicant yet" : "Pending"}</button>
                        </span>
                      </div>
                      <div className="duration">
                        <h3>{ConvertHoursToTime(item.duration)} Contract </h3> <span className="time_post">{item.date_posted}</span>
                      </div>
                      <span className="title">
                        <h3>{item.title}</h3>
                      </span>
                      <h4>{formatDate(item.date)}. {item.start_time}</h4>
                      <span className="address text-truncate"><FontAwesomeIcon icon={faLocationDot} /> {item.location}</span>
                      <div className="price">
                        <span>
                          <h6>₦{item.rate}/hr</h6>
                          <p>{item.applicants_needed} applicant needed</p>
                        </span>
                        <span>
                           {item.status === "pending" ? <button className="btn" onClick={() => selectedJob(item.id)} data-bs-toggle="modal" data-bs-target="#jobPreviewmodal" >Preview details</button> :
                           <a href={`../jobdetails/${item.id}`}  className="btn">View Job Details</a>
                           }
                           {/* <Link to={`../jobdetails/${item.id}`} className="btn">View Request Details</Link> */}

                          {/* <Link to={`../jobdetails/${item.id}`}  className="btn">View Job Details</Link> */}
                        </span>
                      </div>
                    </div>
                  )
                })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Jobrequestmodal