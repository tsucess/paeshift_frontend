import React from "react";
import iconSuccess from "../../assets/images/success.png"
import "./PaymentSuccessmodal.css";

const PaymentSuccessmodal = ({ jobData = {} }) => {
    return (
        <div className="modal fade come-from-modal right text-center" id="paymentSuccessModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body mb-0 pb-0">
                        <img src={iconSuccess} alt="Success Logo" />
                        <div className="title">
                            <h1>Payment Successful!</h1>
                            <p>
                                You've successfully made payment for your job post. Your job is now active and will be visible to potential applicants.
                            </p>
                        </div>
                        <div className="row m-0 p-0">
                            <div className="col-12 px-1">
                                <a href={`/jobdetails/${jobData?.id || ''}`} className="btn view-job-btn">
                                    View Job Details
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaymentSuccessmodal
