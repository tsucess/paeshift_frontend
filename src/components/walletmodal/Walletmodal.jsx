import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Walletmodal.css";
import iconWallet from "../../assets/images/wallet.png";
import iconLogo from "../../assets/images/icon-logo.png";
import iconWema from "../../assets/images/wallet.png"; // ✅ Added this import
import ProfileImage from "../../assets/images/profile.png";

import Axios from "axios";
import getCurrentUser from "../../auth/getCurrentUser";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify";

const Walletmodal = ({ accountDetails }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState("");
  const [transactions, setTransactions] = useState([]);

  const currentUserId = localStorage.getItem("user_id");

  const notifyError = (msg) => toast.error(msg);

  // Navigate to wallet tab in settings
  const handleSeeMore = () => {
    // Close the modal first by finding and clicking the close button
    const closeButton = document.querySelector("#walletModal .btn-close");
    if (closeButton) {
      closeButton.click();
    }
    // Navigate to settings page with wallet tab (value: 2)
    setTimeout(() => {
      navigate("/settings", { state: { activeTab: 2 } });
    }, 100);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  useEffect(() => {
    // GET CURRENT USER PROFILE
    getCurrentUser(setProfile);
    console.log(profile)

    Axios.get(
      `${API_BASE_URL}/payment/users/${currentUserId}/wallet/transactions`
    )
      .then((response) => {
        if (response.data && response.data.data.results) {
          setTransactions(response.data.data.results);
        }
      })
      .catch((error) => {
        console.error("Error fetching Transactions:", error);
        notifyError("Failed to load Transaction data");
      });

    // ✅ Ensure focus goes somewhere safe after modal closes
    const walletModalEl = document.getElementById("walletModal");
    if (walletModalEl) {
      walletModalEl.addEventListener("hidden.bs.modal", () => {
        document.activeElement.blur(); // remove focus from hidden modal button
      });
    }

    return () => {
      if (walletModalEl) {
        walletModalEl.removeEventListener("hidden.bs.modal", () => { });
      }
    };
  }, [currentUserId]);

  return (
    <div
      className="modal fade come-from-modal right"
      id="walletModal"
      tabIndex="-1"  // ✅ Important for accessibility
      data-bs-keyboard="false"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h1 className="modal-title fs-5" id="wallet">
              Wallet
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body mb-0 pb-0">
            <div className="balance">
              <h4>Wallet Balance</h4>
              <h1>₦ {profile.wallet_balance}</h1>
              <p>{new Date().toLocaleString()}</p>
            </div>
            <div className="transactions">
              <div className="top_section">
                <div>
                  <h3>Wallet Transaction</h3>
                </div>
                <div>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleSeeMore(); }}>See More</a>
                </div>
              </div>
              <div className="bottom_section">
                {transactions && transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <div
                      className="transaction"
                      key={index}
                      onClick={() => viewPaymentDetails(transaction)}
                      data-bs-toggle="modal"
                      data-bs-target="#paymentDetailsModal"
                    >
                      <span className="profile_info">
                        <span className="profileWrapper">
                          <img
                            className="prof"
                            src={
                              transaction.transaction_type === "paystack"
                                ? iconWema
                                : iconLogo
                            }
                            alt={transaction.transaction_type}
                          />
                        </span>
                        <span>
                          <h4>Payment {transaction.reference}</h4>
                          <p className="date">
                            {formatDate(transaction.created_at)}
                          </p>
                        </span>
                      </span>
                      <h3
                        className={transaction.transaction_type === "credit" ? "credit-amount" : "debit-amount"}
                      >
                        ₦{transaction.amount}
                      </h3>
                    </div>
                  ))
                ) : (
                  <div className="no-transactions">
                    <p>No transaction records found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer border-0">
            {accountDetails ? (
              <button
                type="button"
                className="btn withdraw-btn"
                data-bs-toggle="modal"
                data-bs-target="#withdrawModal"
              >
                Withdraw
              </button>
            ) : (
              <button
                type="button"
                className="btn withdraw-btn"
                data-bs-toggle="modal"
                data-bs-target="#AccountModal"
              >
                Add Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Walletmodal;
