import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import { showSuccessSwal, showErrorSwal } from "../../utils/SweetAlert";
import './AccountModal.css';
import Axios from "axios";


function AccountModal() {


    const currentUserId = localStorage.getItem("user_id");

    // All Notification
    const [formData, setFormData] = useState({
        bankname: "",
        accountnumber: ""
    });

    const [isLoading, setIsLoading] = useState(false);

    // Load existing account details when modal opens
    useEffect(() => {
        const loadAccountDetails = () => {
            if (currentUserId) {
                Axios.get(`${API_BASE_URL}/accountsapp/get-account-details?user_id=${currentUserId}`)
                    .then((response) => {
                        if (response.data && response.data.bank_name) {
                            setFormData({
                                bankname: response.data.bank_name,
                                accountnumber: response.data.account_number || ""
                            });
                        }
                    })
                    .catch((error) => {
                        console.log("No existing account details found");
                    });
            }
        };

        // Load when modal is shown
        const modal = document.getElementById('AccountModal');
        if (modal) {
            modal.addEventListener('show.bs.modal', loadAccountDetails);
            return () => {
                modal.removeEventListener('show.bs.modal', loadAccountDetails);
            };
        }
    }, [currentUserId]);

    const handleSaveAccount = (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.bankname || !formData.accountnumber) {
            showErrorSwal("Validation Error", "Please fill in all fields");
            return;
        }

        if (formData.accountnumber.length !== 10) {
            showErrorSwal("Validation Error", "Account number must be 10 digits");
            return;
        }

        setIsLoading(true);

        const accountData = {
            user_id: Number(currentUserId),
            account_number: formData.accountnumber,
            bank_name: formData.bankname
        };
        console.log(accountData);
        Axios.post(`${API_BASE_URL}/accountsapp/upload-account-details`, accountData)
            .then((response) => {
                console.log(response.data.message) // updated message
                showSuccessSwal("Success!", response.data.message);
                setIsLoading(false);
                // Close modal after success
                setTimeout(() => {
                    const modalElement = document.getElementById('AccountModal');
                    if (modalElement) {
                        const bsModal = window.bootstrap.Modal.getInstance(modalElement);
                        if (bsModal) {
                            bsModal.hide();
                        }
                    }
                    window.location.reload();
                }, 1500);
            })
            .catch((error) => {
                console.error(error);
                setIsLoading(false);
                showErrorSwal("Error", error.response?.data?.error || "Unable to submit account now, try again later");
            }
            );
    };


    return (
        <div className="modal fade" id="AccountModal" data-bs-keyboard="false" aria-hidden="true">

            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content rounded-4 p-4">
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-bold">
                            Account Details
                        </h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <div className="modal-body">

                        <div className="bg-light-purple p-3 rounded mb-3">
                            <h6 className="fw-bold text-purple">Add your Account Details</h6>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Bank</label>
                                <select
                                    className="form-select"
                                    name="bankname"
                                    value={formData.bankname}
                                    onChange={e => setFormData({ ...formData, bankname: e.target.value })}
                                >
                                    <option value="">Choose Bank</option>
                                    <option value="gtbank">GTBank</option>
                                    <option value="uba">UBA</option>
                                    <option value="accessbank">Access Bank</option>
                                    <option value="wemabank">Wema Bank</option>
                                    <option value="providusbank">Providus Bank</option>
                                    <option value="polaris">Polaris Bank</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Account Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Input account number"
                                    name="accountnumber"
                                    value={formData.accountnumber}
                                    onChange={e => setFormData({ ...formData, accountnumber: e.target.value })}
                                    required
                                    minLength={10}
                                    maxLength={10}
                                />
                            </div>

                        </div>

                    </div>

                    <div className="modal-footer border-0">
                        <div className="row w-100 p-0">
                            <div className="col-4">
                                <button data-bs-dismiss="modal" className="btn me-2 w-100 p-2 back-btn" disabled={isLoading}>Go Back</button>
                            </div>
                            <div className="col-8">
                                <button type="button" name="submit" className="btn w-100 p-2 submit-btn"
                                    onClick={handleSaveAccount}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : "Submit"}
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    )
}

export default AccountModal