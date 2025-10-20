/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { sidebarRoutes, applicantSidebarRoutes } from "./Sidebarroutes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowLeft, faGear } from "@fortawesome/free-solid-svg-icons";
import brandLogo from "../../assets/images/logo-sm.png";
import ProfileImage from "../../assets/images/profile.png";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faClose } from "@fortawesome/free-solid-svg-icons/faClose";
import Axios from "axios";
import { API_BASE_URL } from "../../config"; // Import API_BASE_URL from config

import "./Sidebar.css";



const Sidebar = () => {

  let [profile, setProfile] = useState("");
  let redir = useNavigate()
  const [profileImage, setProfileImage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const token = localStorage.getItem("access_token");
  const user_role = localStorage.getItem("user_role");
  const currentUserId = localStorage.getItem("user_id");

  // Check authentication status in useEffect to avoid early returns
  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      window.location.href = "/signin";
    }
  }, [token]);

  // If not authenticated, render nothing while redirect happens
  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        if (!currentUserId) {
          redir("../signin")
        }
        const response = await Axios.get(`${API_BASE_URL}/accountsapp/whoami/${currentUserId}`);
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching user:", error.response?.data || error.message);
        return null;
      }
    };

    getCurrentUser();

    // const formData = new FormData();
    // formData.append("user_id", currentUserId);

    // const userData = {
    //   user_id: Number(currentUserId)
    // }
 
    Axios.get(`${API_BASE_URL}/accountsapp/user_profile_pictures_full/?user_id=${currentUserId}`)
      .then(response => {
        setProfileImage(response.data[0].url);
        // handle response
      })
      .catch(error => console.error("Profile Image error:", error));


  }, [])



  // HANDLES LOGOUT
  // How does this endpoint know that a user is logged in
  const handleLogout = () => {
    Axios.post(`${API_BASE_URL}/accountsapp/logout`)
      .then(response => {
        // Clear ALL localStorage data to ensure complete logout
        localStorage.clear();

        // Also clear sessionStorage for good measure
        sessionStorage.clear();

        // Force a page reload to ensure all components are reset
        window.location.href = "/signin";
      })
      .catch(error => {
        console.error("Logout error:", error);
        // Even if logout API fails, clear all local data and redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/signin";
      });
  }

  const handleSwitchRole = (currentUserId, currentRole) => {

    const newRole = currentRole === "client" ? "applicant" : "client";

    const curentUserData = {
      user_id: currentUserId,
      new_role: newRole
    }

    Axios.put(`${API_BASE_URL}/accountsapp/switch-role`, curentUserData)
      .then(response => {
        localStorage.setItem("user_role", newRole);
        window.location.reload()
      })
      .catch(error => console.error("Switch role error:", error));
  }
  return (
    <section className="container_sidebar">
      <nav id="sidebarMenu" className="col-12 col-md-4 col-lg-3 col-xl-2 d-lg-block sidebar collapse p-3 p-md-1 p-lg-3 pt-4" >
        <div className="position-sticky sidebar-sticky bg-white">
          <div className="sidebar-brand">
            <NavLink to="../">
              <img src={brandLogo} className="brand-logo" alt="Paeshift logo" />
            </NavLink>
            <button
              className="navbar-toggler position-absolute d-lg-none collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#sidebarMenu"
              aria-controls="sidebarMenu"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <FontAwesomeIcon className="icon-close" icon={faClose} />
            </button>
          </div>
          <ul className="nav flex-column mt-4">

            {user_role === "client" &&
              sidebarRoutes.map((item, key) => {
                return (
                  item.title !== "Home" ?
                    <li
                      style={{ display: "block" }}
                      className="nav-item" key={key}>
                      <NavLink
                        className={item.current ? "nav-link active" : "nav-link"}
                        aria-current="page"
                        to={item.to}
                      >
                        {item.icon} {item.title}
                      </NavLink>
                    </li>
                    : ""

                );
              }
              )
            }
            {
              user_role === "applicant" &&
              applicantSidebarRoutes.map((item, key) => {
                return (
                  item.title !== "Dashboard" ?
                    <li
                      style={{ display: "block" }}
                      className="nav-item" key={key}>
                      <NavLink
                        className={item.current ? "nav-link active" : "nav-link"}
                        aria-current="page"
                        to={item.to}
                      >
                        {item.icon} {item.title}
                      </NavLink>
                    </li>
                    : ""

                );

              }

              )
            }


          </ul>
          <div className="profile-logout">
            <div className="profile">
              <div className="profile-dp">
                {/* <img src={ProfileImage} alt="profile" /> */}
                <img src={`${API_BASE_URL}${profileImage}`} alt="profile" />
              </div>
              <div className="profile-info">
                <h2>{profile.username}</h2>
                <p>{profile.role}</p>
              </div>
            </div>
            <ul className="nav flex-column logout-link">
              <li className="nav-item my-2">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f6f5ff", borderRadius: "4px", padding: "8px 12px", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "bold", color: "#5E0096" }}>
                    {user_role === "client" ? "Client" : "Applicant"}
                  </span>
                  <label className="switch" style={{ margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={user_role === "applicant"}
                      onChange={() => handleSwitchRole(currentUserId, user_role)}
                    />
                    <span className="slider round" style={{
                      backgroundColor: "#5E0096"
                    }}></span>
                  </label>
                </div>
              </li>
              <li className="nav-item my-2">
                <NavLink className="nav-link logout" onClick={() => handleLogout()} aria-current="page">
                  <FontAwesomeIcon className='me-2' icon={faArrowRightFromBracket} /> <p> Logout</p>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </section>
  );
};

export default Sidebar;

/* Add this CSS to your Sidebar.css for the toggle switch:
`
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}
.switch input { display: none; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 22px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #7c3aed;
}
input:checked + .slider:before {
  transform: translateX(18px);
}
` */
