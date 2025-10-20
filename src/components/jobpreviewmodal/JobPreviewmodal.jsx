import React, { useEffect } from "react";
import "./JobPreviewmodal.css";

// Import bootstrap for modal handling
import * as bootstrap from 'bootstrap';



const JobPreviewmodal = ({ itemData, handleDelete, setOutJobData }) => {

    // Use useEffect to update parent component state when itemData changes
    useEffect(() => {
        if (itemData) {
            setOutJobData(itemData);
        }
        
    }, [itemData, setOutJobData]);

    

    const initiatePaymentMethod = () => {
        try {
            const successModal = new bootstrap.Modal(document.getElementById('paymentMethodModal'));
            successModal.show();
        } catch (error) {
            console.error("Error showing paymentMethod modal:", error);
        }
    }
    
    const initiateEditFormModal = () => {
        try {
            const successModal = new bootstrap.Modal(document.getElementById('editpostModal'));
            successModal.show();
        } catch (error) {
            console.error("Error showing paymentMethod modal:", error);
        }
    }

    return (

        <div className="modal fade come-from-modal right text-center" id="jobPreviewmodal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h1>Review Job Request</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    {itemData &&
                        <div className="modal-body mb-0 pb-0">

                            <div className="job-details">
                                <div className="row m-0">
                                    <h4>Main Details</h4>
                                    <div className="col-12"><span>Job Title: <b>{itemData.title}</b></span></div>
                                    <div className="col-12"><span>Location: <b>{itemData.location}</b></span></div>
                                    <div className="col-6 pe-0"><span>Job Category: <b>{itemData.industry_name}</b></span></div>
                                    <div className="col-6 px-0"><span>Sub Category: <b>{itemData.subcategory}</b></span></div>
                                    <div className="col-6">
                                      <span>Job rate per hour: <b>
                                        ₦{
                                          (() => {
                                            // Defensive checks
                                            if ( !itemData || !itemData.rate || !itemData.applicants_needed || !itemData.start_time_str || !itemData.end_time_str) return '--';
                                            const total = parseFloat(itemData.rate);
                                            const applicants = parseFloat(itemData.applicants_needed);
                                            // Parse start and end time (HH:MM)
                                            const [sh, sm] = itemData.start_time_str.split(":").map(Number);
                                            const [eh, em] = itemData.end_time_str.split(":").map(Number);
                                            let start = sh * 60 + sm;
                                            let end = eh * 60 + em;
                                            let diff = end - start;
                                            if (diff < 0) diff += 24 * 60; // handle overnight shifts
                                            const hours = diff / 60;
                                            if (!hours || !applicants) return '--';
                                            const perHour = total / applicants / hours;
                                            return perHour.toLocaleString(undefined, { maximumFractionDigits: 2 });
                                          })()
                                        }/hr
                                      </b></span>
                                    </div>
                                    <div className="col-6 px-0">  <span>Applicant Needed: <b>{itemData.applicants_needed}</b></span></div>
                                </div>

                            </div>
                            <div className="job-details">
                                <div className="row m-0">
                                    <h4>Job Timeline/Scope</h4>
                                    <div className="col-6"><span>Type of Job: <b>{itemData.job_type === "single_day" ? "A day job" : "Multiple day"}</b></span></div>
                                    <div className="col-6 px-0"><span>Type of Shift: <b>{itemData.shift_type === "day" ? "Day Shift" : itemData.shift_type === "night" ? "Night Shift" : "Afternoon shift"}</b></span></div>
                                    <div className="col-6"><span>Date: <b>{itemData.date_human}</b></span></div>
                                    <div className="col-6 px-0"><span>Start Time: <b>{itemData.start_time_human}</b></span></div>
                                    <div className="col-6"><span>End Time: <b>{itemData.end_time_human}</b></span></div>
                                    <div className="col-6 px-0"><span>Total Cost <b>{itemData.total_amount}</b></span></div>
                                </div>
                            </div>

                            <div className="row m-0 p-0">
                                <div className="col-3 text-center">
                                    <button type="button" name='submit' data-bs-dismiss="modal" className="btn delete-btn " onClick={() => handleDelete(itemData.id)}>Delete</button>
                                </div>
                                <div className="col-4">
                                    <button type="button" className="btn preview-btn" data-bs-dismiss="modal" onClick={() => initiateEditFormModal()} >Back to Form</button>
                                </div>
                                <div className="col-5">
                                    <button type="button" className="btn proceed-btn" data-bs-dismiss="modal" onClick={() => initiatePaymentMethod()} >Proceed to Payment</button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>


        </div >



    )
}

export default JobPreviewmodal