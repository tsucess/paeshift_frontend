import React, {useState, useEffect, useRef} from 'react'
import "./OngoingStatusmodal.css";
import { showSuccessToast } from '../../utils/toastConfig';

import  Axios from 'axios';


const OngoingStatusmodal = ({ itemId, onClose, handleEndShift, handleReportDispute }) => {

    const modalRef = useRef();

    const handleEndShiftClick = () => {
        // Close the ongoing modal first
        onClose();
        // Store the job ID for the confirmation handler
        window.jobIdToEnd = itemId;
        // Use data-bs-toggle approach to show the end shift confirmation modal
        const triggerButton = document.createElement('button');
        triggerButton.setAttribute('data-bs-toggle', 'modal');
        triggerButton.setAttribute('data-bs-target', '#endshiftConfirmmodal');
        triggerButton.style.display = 'none';
        document.body.appendChild(triggerButton);
        triggerButton.click();
        document.body.removeChild(triggerButton);
    };

    const notifySuccess = (message) => {
        return showSuccessToast(message);
    };





    useEffect(() => {
      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          onClose();
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);
  
    if (!itemId) return null; // No modal when no job selected
  


    return (
        <>
            <div className="custom-modal-backdrop">
                <div className="custom-modal-content">
                    <button className="modal-btn" onClick={handleEndShiftClick}>End Shift</button>
                    <button className="modal-btn" onClick={() => handleReportDispute(itemId)}>Report Dispute</button>
                </div>
            </div>
            {/* <div className="modal fade" id="feedbackModal" tabIndex="-1" aria-labelledby="feedbackModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="feedbackModalLabel">Feedback</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to report a dispute?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Submit</button>
                        </div>
                    </div>
                </div>
            </div> */}
        </>
    )
}

export default OngoingStatusmodal