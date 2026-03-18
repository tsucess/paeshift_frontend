import React, { useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Main from "../components/main/Main";
import "./Home.css";

const Home = () => {
 

 

 

  return (
    <div className="container-fluid dashboard_container">
      <div className="row p-0">
        <Sidebar />
        <Main />
      </div>
    </div>
  );
};

export default Home;
