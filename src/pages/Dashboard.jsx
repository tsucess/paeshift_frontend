import React, { useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Main from "../components/dashboard/Main";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";



const Dashboard = () => {
  // let user = useRecoilValue(userInfo);
  let redir = useNavigate();

 

  // useEffect(()=> {
  //   if (!user.isLoggedIn) {
  //     redir("../");
  //   }
  // }, [user.isLoggedIn, redir])

  return (
    <div className="container-fluid dashboard_container">
      <div className="row p-0">
        <Sidebar />
        <Main />
      </div>
    </div>
  );
};

export default Dashboard;
