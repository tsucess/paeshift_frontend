import React from "react";
import iconWarning from "../../assets/images/warning.png"
import "./FeedbackConfirmmodal.css";

const FeedbackConfirmmodal = ({ onConfirm, onCancel, feedbackType = "feedback" }) => {
    const handleConfirmClick = () => {
        console.log('🔘 Submit Feedback button clicked');
        if (onConfirm) {
            console.log('📞 Calling onConfirm callback');
            onConfirm();
        } else {
            console.error('❌ onConfirm callback is not defined');
        }
    };

    const handleCancelClick = () => {
        console.log('🔘 Go Back button clicked');
        if (onCancel) {
            console.log('📞 Calling onCancel callback');
            onCancel();
        }
    };

    return (
        <div className="modal fade come-from-modal right text-center" id="feedbackConfirmModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body mb-0 pb-0">
                        <img src={iconWarning} alt="Confirmation" />
                        <div className="title">
                            <h1>Confirm Feedback?</h1>
                            <p>
                                Are you sure you want to submit this {feedbackType}? Once submitted, it cannot be changed.
                            </p>
                        </div>
                        <div className="row m-0 p-0">
                            <div className="col-4 px-1">
                                <button type="button" name='cancel' className="btn preview-btn" data-bs-dismiss="modal" onClick={handleCancelClick}>Go Back</button>
                            </div>
                            <div className="col-8">
                                <button type="button" className="btn proceed-btn" onClick={handleConfirmClick}>Submit Feedback</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FeedbackConfirmmodal

