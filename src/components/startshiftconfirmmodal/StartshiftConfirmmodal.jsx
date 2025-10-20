import React, { useState, useEffect } from "react";
import iconWarning from "../../assets/images/warning.png"
import "./StartshiftConfirmmodal.css"; 

const StartshiftConfirmmodal = ({ onConfirm, onCancel }) => {

    return (
        <div className="modal fade come-from-modal right text-center" id="startshiftConfirmModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body mb-0 pb-0">
                        <img src={iconWarning} alt="Warning" />
                        <div className="title">
                            <h1>Start Shift?</h1>
                            <p>
                                Are you sure you want to start this shift now? Doing this you ascertain that the applicant is already at the set location and is ready to begin this job.
                            </p>
                        </div>
                        <div className="row m-0 p-0">
                            <div className="col-4 px-1">
                                <button type="button" name='submit' className="btn preview-btn" data-bs-dismiss="modal">Go Back</button>
                            </div>
                            <div className="col-8">
                                <button type="submit" className="btn proceed-btn" onClick={onConfirm}>Start Shift</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default StartshiftConfirmmodal

