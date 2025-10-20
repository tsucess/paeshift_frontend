import React, { useState, useEffect } from "react";
import flutterLogo from "../../assets/images/flutterwave.png"
import paystackLogo from "../../assets/images/paystack.png"
import "./PaymentMethodmodal.css";

import Axios from "axios";
import { ToastContainer } from 'react-toastify';
import { toastContainerProps } from '../../utils/toastConfig';
import 'react-toastify/dist/ReactToastify.css';

import PaymentSuccessmodal from "../paymentsuccessmodal/PaymentSuccessmodal.jsx";











const PaymentMethodmodal = ({paymentJobData = {}, initiatePayment }) => {
    // Add default empty objects to prevent undefined errors
    const [refNumber, setRefNumber] = useState('');
    const [reservationNo, setReserveNumber] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paidJobData, setPaidJobData] = useState({});
    const [actualJobData, setActualJobData] = useState(paymentJobData);

    // Check for job data from props
    useEffect(() => {
        if (paymentJobData && Object.keys(paymentJobData).length > 0) {
            setActualJobData(paymentJobData);
        } else if (window.paymentJobData) {
            setActualJobData(window.paymentJobData);
        }
    }, [paymentJobData]);

    useEffect(() => {
        // Generate a unique reference number with prefix and timestamp
        const timestamp = new Date().getTime();
        const randomPart = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
        const uniqueRef = `PAY_${timestamp}_${randomPart}`;

        // Generate a reservation code (at least 6 characters as required by the schema)
        const reserveRef = `RES_${Math.floor(100000 + Math.random() * 900000)}`; // 6-digit number with prefix

        setRefNumber(uniqueRef);
        setReserveNumber(reserveRef);

    }, []);



   





    return (
        <>
            <div className="modal fade come-from-modal right" id="paymentMethodModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header border-0">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">Choose Payment Method</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body mb-0 pb-0">
                            <div className="title">
                                <h3>Total Cost: ₦{actualJobData?.rate || window.paymentJobData?.rate || paymentJobData?.rate || '0'}</h3>
                                {(actualJobData?.title || window.paymentJobData?.title || paymentJobData?.title) && (
                                    <p className="job-title">Job: {actualJobData?.title || window.paymentJobData?.title || paymentJobData?.title}</p>
                                )}
                            </div>
                            <div className="row mt-3 px-3">
                                <button
                                    type="button"
                                    className="payment_btn"
                                    onClick={() => initiatePayment("flutterwave", actualJobData, refNumber, reservationNo, setProcessingPayment, setPaidJobData)}
                                    disabled={processingPayment}
                                    data-bs-dismiss="modal"
                                >
                                    <div className="col-12 applicants">
                                        <div className="card_top">
                                            <span>
                                                <img className="prof" src={flutterLogo} alt="Flutter Wave" />
                                            </span>
                                            <span>
                                                <h3>Flutter Wave</h3>
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                            <div className="row mt-3 px-3">
                                <button
                                    type="button"
                                    className="payment_btn"
                                    onClick={() => initiatePayment("paystack", actualJobData, refNumber, reservationNo, setProcessingPayment, setPaidJobData)}
                                    disabled={processingPayment}
                                    data-bs-dismiss="modal"
                                >
                                    <div className="col-12 applicants">
                                        <div className="card_top">
                                            <span>
                                                <img className="prof" src={paystackLogo} alt="Pay Stack" />
                                            </span>
                                            <span>
                                                <h3>Pay Stack</h3>
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                            {processingPayment && (
                                <div className="processing-payment">
                                    <p>Processing payment, please wait...</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-0">
                        </div>
                    </div>
                </div>
            </div>

            <PaymentSuccessmodal jobData={paidJobData || actualJobData || window.paymentJobData || paymentJobData} />
            <ToastContainer {...toastContainerProps} />
        </>
    )
}

export default PaymentMethodmodal