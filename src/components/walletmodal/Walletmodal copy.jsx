import React, { useState, useEffect } from "react";
import "./Walletmodal.css";
import Stars from "../../assets/images/stars.png";
import iconWallet from "../../assets/images/wallet.png";
import iconWema from "../../assets/images/wallet.png";
import iconLogo from "../../assets/images/icon-logo.png";
import Axios from "axios";
import { faBarsProgress } from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import ProfileImage from "../../assets/images/profile.png"


import getCurrentUser from "../../auth/getCurrentUser";
import { API_BASE_URL } from "../../config";

const Walletmodal = ({ accountDetails }) => {

    let [profile, setProfile] = useState("");
    let [transactions, setTransactions] = useState([]);

    const userId = localStorage.getItem("user_id");
    const userrole = localStorage.getItem("user_role");
    const token = localStorage.getItem("access_token");




    const currentUserId = localStorage.getItem("user_id");


    // Format date for display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Date formatting error:", error);
            return dateString;
        }
    };


    useEffect(() => {
        // GET CURRENT USER PROFILE 
        getCurrentUser(setProfile);


        Axios.get(`${API_BASE_URL}/payment/users/${currentUserId}/wallet/transactions`)
            .then((response) => {
                if (response.data && response.data.data.results) {
                    setTransactions(response.data.data.results);
                }
            })
            .catch((error) => {
                console.error("Error fetching Transactions:", error);
                notifyError("Failed to load Transaction data");
            });

    }, [])



    return (
        <div className="modal fade come-from-modal right" id="walletModal" data-bs-keyboard="false" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h1 className="modal-title fs-5" id="wallet">Wallet</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body mb-0 pb-0">
                        <div className="balance">
                            <h4>Wallet Balance</h4>
                            <h1>₦ {profile.wallet_balance}</h1>
                            <p>January 6, 2025 . 11:35 AM</p>
                        </div>
                        <div className="transactions">
                            <div className="top_section">
                                <div><h3>Wallet Transaction</h3></div>
                                <div><a href="#">See More</a></div>
                            </div>
                            <div className="bottom_section">
                                {transactions && transactions.length > 0 ? (
                                    transactions.map((transaction, index) => (
                                        <div className="transaction" key={index} onClick={() => viewPaymentDetails(transaction)} data-bs-toggle="modal" data-bs-target="#paymentDetailsModal">
                                            <span className="profile_info">
                                                <span className="profileWrapper">
                                                    <img
                                                        className="prof"
                                                        src={transaction.transaction_type === "paystack" ? iconWema : iconLogo}
                                                        alt={transaction.transaction_type}
                                                    />
                                                </span>
                                                <span>
                                                    <h4>Payment {transaction.reference}</h4>
                                                    <p className="date">{formatDate(transaction.created_at)}</p>
                                                </span>
                                            </span>
                                            <h3 className={transaction.status === "Completed" ? "credit-amount" : "debit-amount"}>
                                                ₦{transaction.amount}
                                            </h3>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-transactions">
                                        <p>No transaction records found</p>
                                    </div>
                                )}
                                {/* <div className="transaction">
                                    <span className="profile_info">
                                        <span className="profileWrapper">
                                            <img className="prof" src={ProfileImage} alt="profile" />
                                        </span>
                                        <span>
                                            <h4>Eniola Lucas</h4>
                                            <p className="date">20 December 2024, 08:24 PM</p>
                                        </span>
                                    </span>
                                    <h3 className="credit-amount">+ #23,400</h3>
                                </div>
                                <div className="transaction">
                                    <span className="profile_info">
                                        <span className="profileWrapper">
                                            <img className="prof" src={iconLogo} alt="profile" />
                                        </span>
                                        <span>
                                            <h4>Platform Fee</h4>
                                            <p className="date">20 December 2024, 08:24 PM</p>
                                        </span>
                                    </span>
                                    <h3 className="debit-amount">- #234</h3>
                                </div>
                                <div className="transaction">
                                    <span className="profile_info">
                                        <span className="profileWrapper">
                                            <img className="prof" src={ProfileImage} alt="profile" />
                                        </span>
                                        <span>
                                            <h4>Eniola Lucas</h4>
                                            <p className="date">20 December 2024, 08:24 PM</p>
                                        </span>
                                    </span>
                                    <h3 className="credit-amount">+ #23,400</h3>
                                </div>
                                <div className="transaction">
                                    <span className="profile_info">
                                        <span className="profileWrapper">
                                            <img className="prof" src={iconLogo} alt="profile" />
                                        </span>
                                        <span>
                                            <h4>Platform Fee</h4>
                                            <p className="date">20 December 2024, 08:24 PM</p>
                                        </span>
                                    </span>
                                    <h3 className="debit-amount">- #234</h3>
                                </div> */}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer border-0">
                        {
                            accountDetails ?
                                <button type="button" className="btn withdraw-btn" data-bs-toggle="modal" data-bs-target="#withdrawModal">Withdraw</button>
                                :
                                <button type="button" className="btn withdraw-btn" data-bs-toggle="modal" data-bs-target="#AccountModal">Add Account</button>
                        }
                        {/* <button type="button" className="btn withdraw-btn" onClick={() => handleWithdraw()}>Withdraw</button> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Walletmodal