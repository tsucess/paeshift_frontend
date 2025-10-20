import React, { useState, useEffect } from "react";
import feedBackImage from "../../assets/images/feedback.png";
import Select from "react-select";
import "./Feedbackmodal.css";



import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';


import Axios from "axios";
import { API_BASE_URL } from "../../config";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import FeedbackSuccessmodal from "../feedbacksuccessmodal/FeedbackSuccessmodal.jsx";
import FeedbackConfirmmodal from "../feedbackconfirmmodal/FeedbackConfirmmodal.jsx";
import Starrating from "../startrating/Starrating.jsx";





const Schema = Yup.object().shape({
    feedback: Yup.string().required("Required").min(2, "Too short!"),
    feedbacktype: Yup.string().required("Required"),
    feedbackuser: Yup.array().min(1, "Required"),
    // rating: Yup.string(),
});





const Feedbackmodal = ({ role, jobId, receiverIds, allUsers, modalId = "feedbackModal", onFeedbackSubmitted }) => {
    // ALL hooks must be declared before any conditional logic or early returns
    const [rating, setRating] = useState(0);
    const [rateColor, setRateColor] = useState("");
    const [feedback, setFeedback] = useState("");
    const [applicantUserIds, setApplicantUserIds] = useState([]);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [isCheckingFeedback, setIsCheckingFeedback] = useState(false);
    const [formikKey, setFormikKey] = useState(0); // Key to force Formik reset
    const [pendingFeedbackData, setPendingFeedbackData] = useState(null); // Store feedback data for confirmation

    // Function to check if feedback has already been submitted
    const checkFeedbackStatus = async () => {
        if (!jobId || !currentUserId) return;

        setIsCheckingFeedback(true);
        try {
            // Get all reviews submitted by the current user (where they are the reviewer)
            const response = await Axios.get(`${API_BASE_URL}/rating/ratings/reviewer_${currentUserId}/`);
            if (response.data && response.data.reviews) {
                const existingFeedback = response.data.reviews.find(review =>
                    review.job_id === jobId
                );
                setFeedbackSubmitted(!!existingFeedback);
            }
        } catch (error) {
            console.error('Error checking feedback status:', error);
        } finally {
            setIsCheckingFeedback(false);
        }
    };

    // Move useEffect here - BEFORE any conditional logic
    useEffect(() => {
        // Only run effect if we have valid jobId and receiverIds
        if (!jobId || !receiverIds ||
            (Array.isArray(receiverIds) && receiverIds.length === 0)) return;

        Axios.get(`${API_BASE_URL}/jobs/${jobId}`)
            .then((response) => {
                if (response.data && response.data.applicants_user_ids) {
                    setApplicantUserIds(response.data.applicants_user_ids);
                }
            })
            .catch(error => console.error(error));

        // Check feedback status
        checkFeedbackStatus();
    }, [jobId, receiverIds]);

    // Handle modal close to reset form
    useEffect(() => {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const handleModalHide = () => {
            // Reset form state when modal closes
            setRating(0);
            setRateColor("");
            setFeedback("");
            setFeedbackSubmitted(false);
            setFormikKey(prev => prev + 1); // Force Formik to reset
        };

        modal.addEventListener('hidden.bs.modal', handleModalHide);
        return () => modal.removeEventListener('hidden.bs.modal', handleModalHide);
    }, [modalId]);

    // Check if we have required data
    const hasRequiredData = jobId && receiverIds &&
                           (Array.isArray(receiverIds) ? receiverIds.length > 0 : receiverIds);




    const notifySuccess = (message) => showSuccessToast(message);



    const currentUserId = localStorage.getItem("user_id");

    const currentUserRole = localStorage.getItem("user_role");



    const handleStarRating = (currRateVal) => {
        // const selectedRating = e.target.value;
        setRateColor(currRateVal);
        setRating(currRateVal);
    }

    // Handle confirmed feedback submission
    const handleConfirmFeedback = async () => {
        console.log('✅ handleConfirmFeedback called');
        console.log('📦 pendingFeedbackData:', pendingFeedbackData);

        if (!pendingFeedbackData) {
            console.error('❌ No pending feedback data');
            return;
        }

        try {
            console.log('📤 Sending feedback to API...');
            const response = await Axios.post(`${API_BASE_URL}/rating/ratings/`, pendingFeedbackData);
            console.log('✅ API Response:', response);

            if (response.status === 201) {
                console.log('✅ Feedback submitted successfully');

                // Close the confirmation modal and remove backdrop
                const confirmModal = document.getElementById('feedbackConfirmModal');
                if (confirmModal) {
                    const closeButton = confirmModal.querySelector('[data-bs-dismiss="modal"]');
                    if (closeButton) {
                        closeButton.click();
                        console.log('✅ Confirmation modal closed');
                    }
                    // Remove backdrop if it exists
                    setTimeout(() => {
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) {
                            backdrop.remove();
                            console.log('✅ Backdrop removed');
                        }
                    }, 100);
                }

                // Show the success modal
                const successButton = document.createElement('button');
                successButton.setAttribute('data-bs-toggle', 'modal');
                successButton.setAttribute('data-bs-target', '#feedbackSuccessModal');
                successButton.style.display = 'none';
                document.body.appendChild(successButton);
                successButton.click();
                document.body.removeChild(successButton);
                console.log('✅ Success modal shown');

                setFeedbackSubmitted(true);
                setPendingFeedbackData(null);

                // Call the callback to update parent component
                if (onFeedbackSubmitted && jobId) {
                    onFeedbackSubmitted(jobId);
                }

                // Close the feedback form modal after a delay
                setTimeout(() => {
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        const closeButton = modal.querySelector('[data-bs-dismiss="modal"]');
                        if (closeButton) closeButton.click();
                    }
                    // Remove all remaining backdrops
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());
                    console.log('✅ All backdrops removed');
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Error submitting feedback:', error);
            showErrorToast('Failed to send feedback. Please try again.');
            setPendingFeedbackData(null);
        }
    };

    // Handle cancel feedback
    const handleCancelFeedback = () => {
        setPendingFeedbackData(null);
    };

    // Define filteredOptions at the top level of the component
    // Ensure receiverIds is always an array
    const receiverIdsArray = Array.isArray(receiverIds) ? receiverIds :
                            receiverIds ? [receiverIds] : [];

    const filteredOptions = allUsers && receiverIdsArray.length > 0
        ? allUsers
            .filter(user => receiverIdsArray.includes(user.id))
            .map(user => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name}`
            }))
        : [];

        // console.log(receiverIds)







    return (
        <>
        <div className="modal fade come-from-modal right" id={modalId} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">Feedback Worker</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body mb-0 pb-0">
                        {!hasRequiredData ? (
                            <div className="text-center">
                                <p>Loading...</p>
                            </div>
                        ) : (
                        <>
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
                            key={formikKey}
                            initialValues={{
                                feedbacktype: "",
                                feedback: "",
                                feedbackuser: [], // or [] if using isMulti
                                rating: ""
                            }}

                            validationSchema={Schema}
                            onSubmit={async (values, { setSubmitting }) => {
                                let feedbacktype = values.feedbacktype;
                                // Extract array of user IDs from selected options
                                const selectedUserIds = Array.isArray(values.feedbackuser)
                                    ? values.feedbackuser.map(option => option.value)
                                    : [];

                                let feedbackdata = {
                                    sender_id: Number(currentUserId),
                                    receiver_id: selectedUserIds, // Use the selected user's id
                                    job_id: jobId,
                                    feedback: values.feedback,
                                    rating: rating,
                                    feedbacktype: feedbacktype
                                };

                                // Store the feedback data and show confirmation modal
                                setPendingFeedbackData(feedbackdata);
                                setSubmitting(false);

                                // Show confirmation modal
                                const confirmButton = document.createElement('button');
                                confirmButton.setAttribute('data-bs-toggle', 'modal');
                                confirmButton.setAttribute('data-bs-target', '#feedbackConfirmModal');
                                confirmButton.style.display = 'none';
                                document.body.appendChild(confirmButton);
                                confirmButton.click();
                                document.body.removeChild(confirmButton);
                            }}
                        >
                            {({ errors, touched, values, setFieldValue, isSubmitting }) => (
                                <Form >
                                    {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <label htmlFor="feedbacktype" className="form-label mb-0">Feedback Type</label>
                                            <Field as="select" name="feedbacktype" id="feedbacktype" className="form-control" disabled={feedbackSubmitted || isSubmitting}>
                                                <option value="">Choose type of Feedback</option>
                                                <option value="dispute">Dispute</option>
                                                <option value="review">Review</option>
                                            </Field>
                                            {touched.feedbacktype && errors.feedbacktype && (<div className="errors">{errors.feedbacktype}</div>)}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <label htmlFor="feedbackuser" className="form-label mb-0">Feedback User</label>
                                            <Select
                                                options={filteredOptions}
                                                onChange={option => setFieldValue("feedbackuser", option)}
                                                isMulti={true} // or true if you want multiple
                                                name="feedbackuser"
                                                isDisabled={feedbackSubmitted || isSubmitting}
                                            />
                                            {touched.feedbackuser && errors.feedbackuser && (<div className="errors">{errors.feedbackuser}</div>)}
                                        </div>
                                    </div>
                                    <div className="row rating mt-2">
                                        <div className="col-7">
                                            <h4>Employer Rating</h4>
                                            <span>Nice Experience</span>
                                        </div>
                                        <div className="col-5 star-ratings">
                                            <Starrating
                                                handleStarRating={feedbackSubmitted || isSubmitting ? () => {} : handleStarRating}
                                                rateColor={rateColor}
                                                rating={rating}
                                                disabled={feedbackSubmitted || isSubmitting}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <Field as="textarea" name="feedback" id="feedback" className="form-control" placeholder="We’d love to hear from you..." rows={4} disabled={feedbackSubmitted || isSubmitting}>
                                            </Field>
                                            <span className="text-count">{values.feedback.length}/2000</span>
                                            {touched.feedback && errors.feedback && (<div className="errors">{errors.feedback}</div>)}
                                        </div>

                                    </div>
                                    <div className="row m-0 p-0 mt-3">
                                        <div className="col-6 pe-2">
                                            <button type="button" name='cancel' className="btn back-btn w-100" data-bs-dismiss="modal">Go Back</button>
                                        </div>
                                        <div className="col-6 ps-2">
                                            <button
                                                type="submit"
                                                name='submit'
                                                className={`btn w-100 ${feedbackSubmitted ? 'btn-secondary' : 'submit-btn'}`}
                                                disabled={isSubmitting || feedbackSubmitted || isCheckingFeedback}
                                            >
                                                {isCheckingFeedback ? "Checking..." :
                                                 feedbackSubmitted ? "Feedback Sent" :
                                                 isSubmitting ? "Sending..." : "Send Feedback"}
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                        </>
                        )}
                    </div>
                    <div className="modal-footer border-0">
                    </div>
                    <FeedbackSuccessmodal />
                </div>
            </div>
        </div >
        <FeedbackConfirmmodal onConfirm={handleConfirmFeedback} onCancel={handleCancelFeedback} feedbackType="feedback" />
        </>
    )
}

export default Feedbackmodal