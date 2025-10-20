import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Stars from "../../assets/images/stars.png";
import iconWallet from "../../assets/images/wallet.png";
import iconLogo from "../../assets/images/icon-logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsProgress, faLocation, faLocationArrow, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import ProfileImage from "../../assets/images/profile.png"
import "./Applicantmodal.css";
import { API_BASE_URL } from "../../config";

import Axios from "axios";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";




const Schema = Yup.object().shape({
    jobtitle: Yup.string().required("Required").min(2, "Too short!"),
    jobLocation: Yup.string().required("Required").min(2, "Too short!"),
    jobIndustry: Yup.string().required("Required").min(2, "Too short!"),
    jobSubCategory: Yup.string().required("Required").min(2, "Too short!"),
    jobRate: Yup.string().required("Required"),
    noOfApplicants: Yup.string().required("Required"),
    jobType: Yup.string().required("Required"),
    shiftType: Yup.string().required("Required"),
    jobDate: Yup.string().required("Required"),
    startTime: Yup.string().required("Required"),
    endTime: Yup.string().required("Required"),
});


const Applicantmodal = ({ getApplicantId, jobId }) => {
    // let jobId = useParams();
    const [applicantsId, setApplicantsId] = useState([]);
    const [user, setUser] = useState([]);

    useEffect(() => {
        let isMounted = true;
        Axios.get(`${API_BASE_URL}/jobs/${jobId.id}`)
            .then((response) => {
                setApplicantsId(response.data.applicants_user_ids);
                const applicantsIds = response.data.applicants_user_ids;
                if (Array.isArray(applicantsIds) && applicantsIds.length > 0) {
                    Promise.all(
                        applicantsIds.map(applicantId =>
                            Axios.get(`${API_BASE_URL}/accountsapp/whoami/${applicantId}`)
                                .then(res => res.data)
                                .catch(error => null)
                        )
                    ).then(applicants => {
                        if (isMounted) {
                            setUser(applicants.filter(Boolean));
                        }
                    });
                } else {
                    setUser([]);
                }
            })
            .catch(error => console.error(error));
        return () => { isMounted = false; };
    }, [jobId]);




    return (
        <div className="modal fade come-from-modal right" id="applicantModal" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="applicantBackdropLabel" aria-hidden="false">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h1 className="modal-title fs-5" id="applicantBackdropLabel">All Applicants</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body mb-0 pb-0">
                        <div className="title">
                            <h3>Today</h3>
                        </div>
                        {
                            user && user.length > 0 ? (
                                user.map((applicant) => (
                                    <div className="row mt-3 px-3" key={applicant.user_id}>
                                        <div className="col-12 applicants">
                                            <div className="card_top">
                                                <span className="profile_info">
                                                    <span>
                                                        <img className="prof" src={ProfileImage} alt="profile" />
                                                    </span>
                                                    <span>
                                                        <h4>{applicant.first_name} {applicant.last_name}</h4>
                                                        <img src={Stars} alt="profile" /> <span className="rate_score">{applicant.rating}</span>
                                                    </span>
                                                </span>
                                                <span className="top_cta">
                                                    <button className="btn" onClick={() => {
                                                        getApplicantId(applicant.user_id);
                                                        // Use setTimeout to ensure state is updated before modal opens
                                                        setTimeout(() => {
                                                            const triggerButton = document.createElement('button');
                                                            triggerButton.setAttribute('data-bs-toggle', 'modal');
                                                            triggerButton.setAttribute('data-bs-target', '#applicantProfileModal');
                                                            triggerButton.style.display = 'none';
                                                            document.body.appendChild(triggerButton);
                                                            triggerButton.click();
                                                            document.body.removeChild(triggerButton);
                                                        }, 0);
                                                    }}>View Profile</button>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="row mt-3 px-3">
                                    <div className="col-12 text-center">
                                        <p>No applicants yet.</p>
                                    </div>
                                </div>
                            )
                        }
                        {/* <div className="title mt-4">
                            <h3>Tomorrow</h3>
                        </div>
                        <div className="row mt-3 px-3">
                            <div className="col-12 applicants">
                                <div className="card_top">
                                    <span className="profile_info">
                                        <span>
                                            <img className="prof" src={ProfileImage} alt="profile" />
                                        </span>
                                        <span>
                                            <h4>Eniola Lucas</h4>
                                            <img src={Stars} alt="profile" /> <span className="rate_score">4.98</span>
                                        </span>
                                    </span>
                                    <span className="top_cta">
                                        <button className="btn" data-bs-toggle="modal" data-bs-target="#profileModal">View Profile</button>
                                    </span>
                                </div>
                            </div>
                        </div> */}
                    </div>
                    <div className="modal-footer border-0">
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Applicantmodal