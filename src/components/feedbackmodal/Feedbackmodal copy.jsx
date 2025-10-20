import React, { useState, useEffect } from "react";
import feedBackImage from "../../assets/images/feedback.png";
import AsyncSelect from "react-select/async";
import "./Feedbackmodal.css";





import Axios from "axios";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import FeedbackSuccessmodal from "../feedbacksuccessmodal/FeedbackSuccessmodal.jsx";
import Starrating from "../startrating/Starrating.jsx";
import { use } from "react";




const Schema = Yup.object().shape({
    feedback: Yup.string().required("Required").min(2, "Too short!"),
    feedbacktype: Yup.string().required("Required"),
    feedbackuser: Yup.string().required("Required"),
    rating: Yup.string(),
});





const Feedbackmodal = ({ role, jobId, receiverId }) => {

    const [rating, setRating] = useState(0);
    const [rateColor, setRateColor] = useState("");
    const [feedback, setFeedback] = useState("");

    const options = [
        {
            value: 1,
            label: 'Leanne Graham'
        },
        {
            value: 2,
            label: 'Ervin Howell'
        }
    ];

    const currentUserId = localStorage.getItem("user_id");

    const currentUserRole = localStorage.getItem("user_role");


    const selectedValues = (values) => {
        console.log(values);
    }

    const loadOptions = (searchVal, callback) => {
        setTimeout(() => {
            const filterOptions = options.filter(option => option.label.toLowerCase().includes(searchVal.toLowerCase()));
            console.log(filterOptions);
            callback(filterOptions);
        }, 2000)
    }




    const handleStarRating = (currRateVal) => {
        // const selectedRating = e.target.value;
        setRateColor(currRateVal);
        setRating(currRateVal);
        console.log("Selected rating:", currRateVal);
    }

    // /jobs/feedback/

    return (
        <div className="modal fade come-from-modal right" id="feedbackModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">Feedback {role === "client" ? "Worker" : "Employer"}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body mb-0 pb-0">
                        <div className="row">
                            <div className="col-12 text-center feedbackContent">
                                <img src={feedBackImage} alt="feed back image" />
                                <p>
                                    This employee needs your rating and feedback
                                    about the job to stand out among other applicants. Thank you!
                                </p>
                            </div>
                        </div>


                        <Formik
                            initialValues={{
                                feedbacktype: "",
                                feedback: "",
                                rating: ""
                            }}

                            validationSchema={Schema}
                            onSubmit={(values, { setSubmitting }) => {

                                setSubmitting(false);

                                let userdata = {
                                    userId: currentUserId,
                                    user: role,
                                    jobId: jobId,
                                    recieverId: receiverId,
                                    feedbacktype: values.feedbacktype,
                                    feedback: values.feedback,
                                    rating: rating
                                };

                                // redir("../jobs");
                                // const modal = new bootstrap.Modal('#feedbackSuccessModal');
                                // modal.show()
                                console.log(userdata);

                                // try {
                                //     useEffect(() => {
                                //         Axios.post("http://localhost:8000/jobs/feedback", {userdata})
                                //             .then((response) => {
                                //                 setFeedback(response.data.jobs);
                                //                 console.log(response.data.jobs);
                                //             })
                                //             .catch((error) => console.error(error));
                                //     }, [])

                                // } catch (error) {
                                //     console.error(error);
                                // }
                            }
                            }
                        >
                            {({ errors, touched, values }) => (
                                <Form >
                                    {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <label htmlFor="feedbacktype" className="form-label mb-0">Feedback Type</label>
                                            <Field as="select" name="feedbacktype" id="feedbacktype" className="form-control" >
                                                <option value="">Choose type of Feedback</option>
                                                <option value="dispute">Dispute</option>
                                                <option value="review">Review</option>
                                            </Field>
                                            {touched.feedbacktype && errors.feedbacktype && (<div className="errors">{errors.feedbacktype}</div>)}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <label htmlFor="feedbackuser" className="form-label mb-0">Feedback Type</label>
                                            <AsyncSelect loadOptions={loadOptions} onChange={selectedValues} isMulti />
                                            {/* {touched.feedbackuser && errors.feedbackuser && (<div className="errors">{errors.feedbackuser}</div>)} */}
                                        </div>
                                    </div>
                                    <div className="row rating mt-2">
                                        <div className="col-7">
                                            <h4>Worker Rating</h4>
                                            <span>Nice Experience</span>
                                        </div>
                                        <div className="col-5 star-ratings">
                                            <Starrating handleStarRating={handleStarRating} rateColor={rateColor} rating={rating} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <Field as="textarea" name="feedback" id="feedback" className="form-control" placeholder="We’d love to hear from you..." row="" >
                                            </Field>
                                            <span className="text-count" >0/2000</span>
                                            {touched.feedback && errors.feedback && (<div className="errors">{errors.feedback}</div>)}
                                        </div>

                                    </div>
                                    <div className="row m-0 p-0">
                                        <div className="col-5 px-1">
                                            <button type="button" name='cancel' className="btn back-btn" data-bs-dismiss="modal">Go Back</button>
                                        </div>
                                        <div className="col-7 px-1">
                                            <button type="submit" name='submit' className="btn submit-btn">Send Feedback</button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>

                    </div>
                    <div className="modal-footer border-0">
                    </div>
                    <FeedbackSuccessmodal />
                </div>
            </div>
        </div >
    )
}

export default Feedbackmodal