import React, { useEffect, useState } from "react";
import iconLogo from "../../assets/images/icon-logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./PaymentDetailsmodal.css";
import logoSm from "../../assets/images/logo-sm.png";
import Axios from "axios";

const PaymentDetailsmodal = ({ payment, jobId }) => {
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        if (jobId) {
            Axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/jobs/job/${jobId.id}/payment-details`)
                .then((response) => {
                    setPaymentDetails(response.data);
                })
                .catch(error => console.error(error));
        }
    }, [jobId]);


    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            console.error("Date formatting error:", error);
            return dateString;
        }
    };

    // Format time for display
    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Time formatting error:", error);
            return "";
        }
    };

    // PDF invoice download handler with design matching the modal
    const handleDownloadInvoice = () => {
        const currentPayment = payment || paymentDetails;
        if (!currentPayment) return;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPosition = margin;

        // Add background color for header
        doc.setFillColor(250, 250, 250);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Add logo
        const img = new window.Image();
        img.src = logoSm;
        img.onload = function () {
            doc.addImage(img, "PNG", pageWidth - 40, 8, 30, 8);

            // Title
            doc.setFontSize(24);
            doc.setTextColor(26, 26, 26);
            doc.setFont(undefined, 'bold');
            doc.text("Invoice Receipt", margin, yPosition + 15);

            // Date Generated
            doc.setFontSize(10);
            doc.setTextColor(102, 102, 102);
            doc.setFont(undefined, 'normal');
            doc.text(`Date Generated: ${formatDate(new Date())}`, margin, yPosition + 25);

            yPosition = 50;

            // Payment Method Section with background
            doc.setFillColor(249, 249, 249);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
            doc.setDrawColor(240, 240, 240);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, 25);

            doc.setFontSize(11);
            doc.setTextColor(26, 26, 26);
            doc.setFont(undefined, 'bold');
            doc.text("Payment Method", margin + 5, yPosition + 8);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.setTextColor(102, 102, 102);
            doc.text(currentPayment.payment_method || "Payment", margin + 5, yPosition + 15);
            doc.text(currentPayment.reference || "N/A", margin + 5, yPosition + 22);

            // Amount on the right
            doc.setFontSize(10);
            doc.setTextColor(102, 102, 102);
            doc.text("Amount", pageWidth - margin - 40, yPosition + 8);
            doc.setFontSize(16);
            doc.setTextColor(94, 0, 150);
            doc.setFont(undefined, 'bold');
            const amountValue = String(currentPayment.amount || 0).trim();
            doc.text(`N${amountValue}`, pageWidth - margin - 40, yPosition + 18);

            yPosition += 35;

            // Transaction Details Section
            doc.setFontSize(12);
            doc.setTextColor(26, 26, 26);
            doc.setFont(undefined, 'bold');
            doc.text("Transaction Details", margin, yPosition);

            yPosition += 8;

            // Transaction details rows
            const serviceChargedAmount = String(currentPayment.amount || 0).trim();
            const platformFeeAmount = String(currentPayment.service_fee || 0.00).trim();
            const transactionDetails = [
                ["Transaction ID", currentPayment.reference || currentPayment.id],
                ["Transaction Date", formatDate(currentPayment.created_at)],
                ["Transaction Time", formatTime(currentPayment.created_at)],
                ["Service Charged", `N${serviceChargedAmount}`],
                ["Platform Fee", `N${platformFeeAmount}`]
            ];

            doc.setFontSize(10);
            const valueStartX = pageWidth - margin - 5;

            transactionDetails.forEach((detail, index) => {
                doc.setTextColor(102, 102, 102);
                doc.setFont(undefined, 'normal');
                doc.text(detail[0] + ":", margin + 5, yPosition + (index * 7));

                doc.setTextColor(26, 26, 26);
                doc.setFont(undefined, 'bold');
                doc.text(detail[1], valueStartX, yPosition + (index * 7), { align: 'right' });
            });

            yPosition += transactionDetails.length * 7 + 10;

            // Job Details Section (if available)
            if (currentPayment.job) {
                doc.setFontSize(12);
                doc.setTextColor(26, 26, 26);
                doc.setFont(undefined, 'bold');
                doc.text("Job Details", margin, yPosition);

                yPosition += 8;

                const jobDetails = [
                    ["Job Title", currentPayment.job.title || "N/A"],
                    ["Job Date", currentPayment.job.date ? formatDate(currentPayment.job.date) : "N/A"],
                    ["Job Start Time", currentPayment.job.start_time || "N/A"],
                    ["Job End Time", currentPayment.job.end_time || "N/A"],
                    ["Job Duration", currentPayment.job.duration || "N/A"]
                ];

                doc.setFontSize(10);
                jobDetails.forEach((detail, index) => {
                    doc.setTextColor(102, 102, 102);
                    doc.setFont(undefined, 'normal');
                    doc.text(detail[0] + ":", margin + 5, yPosition + (index * 7));

                    doc.setTextColor(26, 26, 26);
                    doc.setFont(undefined, 'bold');
                    doc.text(detail[1], valueStartX, yPosition + (index * 7), { align: 'right' });
                });

                yPosition += jobDetails.length * 7 + 10;
            }

            // Worker Details Section (if available)
            if (currentPayment.job && currentPayment.job.workers && currentPayment.job.workers.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(26, 26, 26);
                doc.setFont(undefined, 'bold');
                doc.text("Worker Details", margin, yPosition);

                yPosition += 8;

                doc.setFontSize(10);
                currentPayment.job.workers.forEach((worker, index) => {
                    doc.setTextColor(102, 102, 102);
                    doc.setFont(undefined, 'normal');
                    doc.text(`Worker ${index + 1}:`, margin + 5, yPosition + (index * 7));

                    doc.setTextColor(26, 26, 26);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${worker.name || "N/A"} - N${worker.amount || "0.00"}`, valueStartX, yPosition + (index * 7), { align: 'right' });
                });

                yPosition += currentPayment.job.workers.length * 7 + 10;
            }

            // Footer
            doc.setFontSize(9);
            doc.setTextColor(153, 153, 153);
            doc.setFont(undefined, 'normal');
            doc.text("Thank you for using PaeShift", pageWidth / 2, pageHeight - 15, { align: 'center' });
            doc.text(`Invoice ID: ${currentPayment.reference || currentPayment.id}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

            doc.save(`invoice_${currentPayment.reference || currentPayment.id}.pdf`);
        };
    };

    // Share invoice handler
    const handleShareInvoice = () => {
        const currentPayment = payment || paymentDetails;
        if (!currentPayment) return;

        const shareText = `Invoice Receipt\nTransaction ID: ${currentPayment.reference || currentPayment.id}\nAmount: ₦${currentPayment.amount}\nDate: ${formatDate(currentPayment.created_at)}`;

        if (navigator.share) {
            navigator.share({
                title: "Invoice Receipt",
                text: shareText
            }).catch(err => console.log("Share failed:", err));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                alert("Invoice details copied to clipboard!");
            }).catch(err => console.error("Copy failed:", err));
        }
    };

    const currentPayment = payment || paymentDetails;

    return (
        <div className="modal fade come-from-modal right" id="paymentDetailsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content invoice-receipt-modal">
                    <div className="modal-header invoice-header">
                        <h2 className="modal-title">Invoice Receipt</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <div className="modal-body invoice-body">
                        {currentPayment ? (
                            <>
                                {/* Logo Section */}
                                <div className="invoice-logo-section">
                                    <img src={logoSm} alt="PaeShift Logo" className="invoice-logo" />
                                </div>

                                {/* Payment Method & Amount */}
                                <div className="invoice-payment-section">
                                    <div className="payment-method-badge">
                                        <span className="payment-method-icon">💳</span>
                                        <div className="payment-method-info">
                                            <p className="payment-method-name">{currentPayment.payment_method || "Payment"}</p>
                                            <p className="payment-method-detail">{currentPayment.reference || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="payment-amount">
                                        <p className="amount-label">Amount</p>
                                        <p className="amount-value">₦{currentPayment.amount}</p>
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                <div className="invoice-details-section">
                                    <div className="detail-row">
                                        <span className="detail-label">Transaction ID</span>
                                        <span className="detail-value">{currentPayment.reference || currentPayment.id}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Transaction Date:</span>
                                        <span className="detail-value">{formatDate(currentPayment.created_at)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Transaction Time:</span>
                                        <span className="detail-value">{formatTime(currentPayment.created_at)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Service Charged:</span>
                                        <span className="detail-value">₦{currentPayment.amount}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Platform Fee:</span>
                                        <span className="detail-value">₦{currentPayment.service_fee || 0.00}</span>
                                    </div>
                                </div>

                                {/* Job Details */}
                                {currentPayment.job && (
                                    <div className="invoice-job-section">
                                        <div className="detail-row">
                                            <span className="detail-label">Job Title:</span>
                                            <span className="detail-value">{currentPayment.job.title || "N/A"}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Job Date:</span>
                                            <span className="detail-value">{currentPayment.job.date ? formatDate(currentPayment.job.date) : "N/A"}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Job Start Time:</span>
                                            <span className="detail-value">{currentPayment.job.start_time || "N/A"}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Job End Time:</span>
                                            <span className="detail-value">{currentPayment.job.end_time || "N/A"}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Job Contract Duration:</span>
                                            <span className="detail-value">{currentPayment.job.duration || "N/A"}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Worker Details */}
                                {currentPayment.job && currentPayment.job.workers && (
                                    <div className="invoice-workers-section">
                                        {currentPayment.job.workers.map((worker, index) => (
                                            <div key={index} className="worker-row">
                                                <span className="worker-label">Worker {index + 1}:</span>
                                                <span className="worker-value">{worker.name || "N/A"} (₦{worker.amount || "0.00"})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="loading-state">
                                <p>Loading payment details...</p>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer invoice-footer">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={handleShareInvoice}
                        >
                            Share
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleDownloadInvoice}
                        >
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailsmodal;
