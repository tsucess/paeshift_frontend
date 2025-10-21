import React from 'react'
import Sidebar from "../components/sidebar/Sidebar";
import Main from "../components/mainjobdetails/Main";
import { useNavigate } from "react-router-dom";
// import "./Dashboard.css";



const JobDetails = () => {
  return (
    <div className="container-fluid dashboard_container">
    <div className="row p-0">
      <Sidebar />
      <Main />
    </div>
  </div>
  )
}

export default JobDetails
