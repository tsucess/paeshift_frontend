import React, { useState, useEffect } from "react";
import Stars from "../../assets/images/stars.png";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBookmark } from "@fortawesome/free-regular-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import ProfileImage from "../../assets/images/profile.png"
import "./Profilemodal.css";
import { API_BASE_URL } from "../../config";

import timeToSeconds from "../../auth/timeToSeconds";
import ConvertHoursToTime from "../../auth/ConvertHoursToTime";


const Profilemodal = ({ clientData, savedJob, }) => {

  const [toggle, setToggle] = useState(1);
  const [clientDetails, setClientDetails] = useState("")
  const [JobsData, setClientJobs] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reviews state - moved to top with other state declarations
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);


  function updateToggle(id) {
    setToggle(id);
  }

  // useEffect(() => {
  //   const clientId = clientData.client_id;

  //   // Fetch user data for each clientId
  //   Axios.get(`${API_BASE_URL}/accountsapp/whoami/${clientId}`)
  //     .then((response) => {
  //       setClientDetails(response.data)
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });

  //   fetchAllJobs(clientId);
  //   fetchReviews(clientId);
  // }, [clientData.client_id]);

  useEffect(() => {
    const clientId = clientData?.client_id;
    if (!clientId) {
      console.warn("clientId is undefined — skipping fetch until available.");
      return;
    }

    // Fetch user data for this client
    Axios.get(`${API_BASE_URL}/accountsapp/whoami/${clientId}`)
      .then((response) => setClientDetails(response.data))
      .catch((error) => console.error("Error fetching client details:", error));

    fetchAllJobs(clientId);
    fetchReviews(clientId);
  }, [clientData?.client_id]);

  const fetchReviews = (clientId) => {
    setReviewsLoading(true);
    setReviewsError(null);
    Axios.get(`${API_BASE_URL}/rating/reviews/${clientId}`)
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




  const fetchAllJobs = (currentUserId) => {

    if (!currentUserId) {
      // console.error("User ID not found. Please log in again.");
      // setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Axios.get(`${API_BASE_URL}/jobs/clients/clientjobs/${currentUserId}`)
      .then((response) => {
        if (!response.data || !response.data.jobs) {
          console.error("Invalid response format:", response.data);
          setError("Invalid response from server. Please try again later.");
          setLoading(false);
          return;
        }

        const jobsWithDuration = response.data.jobs.map(job => {
          try {
            const jobStarts = timeToSeconds(job.start_time_str);
            const jobEnds = timeToSeconds(job.end_time_str);
            const duration = ((jobEnds - jobStarts) / 60) / 60;
            return { ...job, duration };
          } catch (err) {
            console.error("Error processing job time:", err);
            return { ...job, duration: 0 };
          }
        });
        setClientJobs(jobsWithDuration);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching client jobs:", error);
        setError("Failed to load jobs. Please try again later.");
        setLoading(false);


      });

  }







  return (
    <div className="modal fade come-from-modal right" id="profileModal" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="profileBackdropLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header border-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body py-0">
            <div className="profile_section">
              <div className="row">
                <div className="col-12 text-center">
                  <div className="profile_wrapper">
                    <img
                      className=""
                      src={clientDetails.profile_pic_url ? `${API_BASE_URL}${clientDetails.profile_pic_url}` : ProfileImage}
                      alt="profile"
                      onError={e => { e.target.onerror = null; e.target.src = ProfileImage; }}
                    />
                  </div>
                  <span className="profile_details mt-1">
                    <h4>{clientDetails.first_name} {clientDetails.last_name}</h4>
                    <img src={Stars} alt="profile" /> <span className="rate_score">{clientDetails.rating}</span>
                  </span>
                </div>
              </div>
            </div>
            {
              clientDetails &&
              <div className="row client_data p-0 m-0">
                <div className="col-4 p-0">
                  <h4>{clientDetails.job_stats?.total_jobs_posted ?? 0}</h4>
                  <p>Total Job Posted</p>
                </div>
                <div className="col-4 p-0">
                  <h4>{clientDetails.review_count}</h4>
                  <p>Rating & Reviews</p>
                </div>
                <div className="col-4 p-0">
                  <h4>{clientDetails.job_stats?.total_workers_engaged ?? 0}</h4>
                  <p>Applicants Worked With</p>
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
                {JobsData && JobsData.map((item) => (
                  <div className="card" key={item.id}>
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
                          <h4>{item.name}</h4>
                          <img src={Stars} alt="profile" /> <span className="rate_score">{clientDetails.rating}</span>
                        </span>
                      </span>
                      <span className="top_cta">
                        <button
                          className={savedJob.includes(item.id) ? "btn saved bg-dark text-white" : "btn saved"}
                                              >
                          {savedJob.includes(item.id) ? "Saved" : "Unsaved"} &nbsp;
                          <FontAwesomeIcon icon={faBookmark} className="icon-saved" />
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
                        <Link to={`../jobdetails/${item.id}`} className="btn">View Job Details</Link>
                      </span>
                    </div>
                  </div>
                ))}

              </div>

              <div className={toggle === 2 ? "reviews active-content" : "reviews tab-content"}>

                {reviewsLoading ? (
                  <div>Loading reviews...</div>
                ) : reviewsError ? (
                  <div className="alert alert-danger" role="alert">{reviewsError}</div>
                ) : reviews.length === 0 ? (
                  <div>No reviews found.</div>
                ) : (
                  reviews.map((item) => (
                    <div className="review" key={item.id || item.reviewer_name + item.feedback}>
                      <div className="ratings">
                        <div className="worker_profile">
                          <span>
                            <img
                              className="prof"
                              src={item.reviewer_avatar ? `${API_BASE_URL}${item.reviewer_avatar}` : ProfileImage}
                              alt="profile"
                              onError={e => { e.target.onerror = null; e.target.src = ProfileImage; }}
                            />
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
                              style={{ color: i < item.rating ? "#5E0096" : "#d3d3d3" }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="comment">
                        <p>{item.feedback}</p>
                      </div>
                    </div>
                  ))
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profilemodal