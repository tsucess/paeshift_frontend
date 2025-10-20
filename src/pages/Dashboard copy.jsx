c:\Users\HP\Desktop\Code25\paeshift-frontend - Copy\paeshift-frontend\src\pages\AppSignup.jsximport React, 
{ useEffect } from "react";
import Sidebar from "../components/sidebar/SideBar";
import Main from "../components/main/Main";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";


const Dashboard = () => {
  
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
