import React, { useState, useEffect } from "react";
import iconWarning from "../../assets/images/warning.png"
import "./EndshiftConfirmmodal.css";
import { apiService } from "../../services/api";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";

const EndshiftConfirmmodal = ({ onConfirm }) => {

    const handleConfirmEndShift = async () => {
        const jobId = window.jobIdToEnd;
        if (!jobId) return;

        // Debug: Check if token exists
        const token = localStorage.getItem('access_token');
        console.log('🔐 Token exists:', !!token);
        if (!token) {
            showErrorToast("Authentication token not found. Please log in again.");
            return;
        }

        try {
            const response = await apiService.post(`/jobs/shifts/end-shift/${jobId}`, {});

            // Close the confirmation modal
            const confirmModal = document.getElementById('endshiftConfirmmodal');
            if (confirmModal) {
                const closeButton = confirmModal.querySelector('[data-bs-dismiss="modal"]');
                if (closeButton) closeButton.click();
            }

            // Show the success modal
            const successButton = document.createElement('button');
            successButton.setAttribute('data-bs-toggle', 'modal');
            successButton.setAttribute('data-bs-target', '#endshiftSuccessModal');
            successButton.style.display = 'none';
            document.body.appendChild(successButton);
            successButton.click();
            document.body.removeChild(successButton);

            // Call the parent callback if provided
            if (onConfirm) onConfirm();
        } catch (error) {
            console.error('❌ End shift error:', error);
            if (error.response?.status === 401) {
                showErrorToast("Your session has expired. Please log in again.");
                setTimeout(() => {
                    window.location.href = '/signin';
                }, 2000);
            } else {
                const errorMessage = error.response?.data?.detail ||
                                   error.response?.data?.message ||
                                   "Failed to end shift";
                showErrorToast(errorMessage);
            }
        }
    };

    return (
        <div className="modal fade come-from-modal right text-center" id="endshiftConfirmmodal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body mb-0 pb-0">
                        <img src={iconWarning} alt="Success Logo" />
                        <div className="title">
                            <h1>End Shift?</h1>
                            <p>
                                Are you sure you want to end this Shift now? Doing this you ascertain that the applicant has completed this job and can get paid now.
                            </p>
                        </div>
                        <div className="row m-0 p-0">
                            <div className="col-4 px-1">
                                <button type="button" name='submit' className="btn preview-btn" data-bs-dismiss="modal">Go Back</button>
                            </div>
                            <div className="col-8">
                                <button type="submit" className="btn proceed-btn" onClick={handleConfirmEndShift}>End Shift</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default EndshiftConfirmmodal