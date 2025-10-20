// WithdrawModal.jsx
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from "react";

import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
// import { FaTimes } from 'react-icons/fa';
// import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Axios from "axios";
import { API_BASE_URL } from "../../config";
// import { toast, Bounce, ToastContainer } from 'react-toastify';
// import Swal from 'sweetalert2';
// import successIcon from "../../assets/images/success.png";
import { showSuccessSwal } from '../../utils/SweetAlert';
import './WithdrawModal.css';



import getCurrentUser from "../../auth/getCurrentUser";




const WithdrawModal = ({ accountDetails = {} }) => {


  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('wema');
  let [profile, setProfile] = useState("");
  const currentUserId = localStorage.getItem("user_id");


  // const notifySuccess = (message) => toast.success(message, {
  //   position: "top-center",
  //   autoClose: 500,
  //   hideProgressBar: false,
  //   closeOnClick: false,
  //   pauseOnHover: true,
  //   draggable: true,
  //   progress: undefined,
  //   theme: "light",
  //   transition: Bounce,
  // });
  // const notifyError = (message) => toast.error(message, {
  //   position: "top-center",
  //   autoClose: 500,
  //   hideProgressBar: false,
  //   closeOnClick: false,
  //   pauseOnHover: true,
  //   draggable: true,
  //   progress: undefined,
  //   theme: "light",
  //   transition: Bounce,
  // });



//   // Helper: Show SweetAlert2 success dialog
//   const showSuccessSwal = (title, text) => {
//     Swal.fire({
//       title,
//       text,
//       imageUrl: successIcon,
//       imageWidth: 80,
//       imageHeight: 80,
//       imageAlt: "Success",
//       showConfirmButton: false,
//       timer: 1500,
//       customClass: {
//         image: 'swal-custom-image',
//         popup: 'swal-custom-popup',
//         title: 'swal-custom-title',
//         htmlContainer: 'swal-custom-html',
//       },
//       background: '#FFFFFF',
//     });
//   };
//   // Custom SweetAlert2 styles
//   // You can move this to a CSS/SCSS file if preferred
//   const swalCustomStyles = document.createElement('style');
//   swalCustomStyles.innerHTML = `
//   .swal-custom-popup {
//     border-radius: 24px !important;
//     padding: 24px !important;
//     background-color: #FFFFFF !important;
//   }
// `;
//   if (!document.getElementById('swal-custom-styles')) {
//     swalCustomStyles.id = 'swal-custom-styles';
//     document.head.appendChild(swalCustomStyles);
//   }












  useEffect(() => {
    // GET CURRENT USER PROFILE 
    getCurrentUser(setProfile);

  }, [])


  // console.log(accountDetails);

  const handleWithdraw = () => {
    // Validate account details exist
    if (!accountDetails || !accountDetails.bank_name || !accountDetails.account_number) {
      showSuccessSwal("Account Details Required", "Please add your bank account details in settings before withdrawing.");
      return;
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      showSuccessSwal("Invalid Amount", "Please enter a valid withdrawal amount.");
      return;
    }

    const withdrawData = {
      user_id: currentUserId, // fixed key
      amount: amount,
      // account_number: accountDetails.account_number
    };
    Axios.post(`${API_BASE_URL}/payment/users/wallet/withdraw`, withdrawData)
      .then((response) => {
        showSuccessSwal("Withdrawal Successful!", `Your wallet withdraw of ${amount}.00 has been successfully submitted and it’s currently being process. kindly exercise patience while the payment is processed.`);
        setTimeout(() => {
          window.location.reload()
        }, 1000);
      })
      .catch((error) => {
        // notifyError(error.response.data.message)
        console.log(error)
      }

      );
  };

  // const closeModals = () => {
  //         document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  //         document.body.classList.remove('modal-open');
  //     };


  return (
    // <!-- Withdraw Modal -->
    <div className="modal fade" id="withdrawModal" tabIndex="-1" aria-labelledby="withdrawModalLabel" >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold" id="withdrawModalLabel">Withdraw from ({profile.wallet_balance})</h5>
            <button type="button" className="btn-close"
              // onClick={()=>closeModals()} 
              data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <h6 className="fw-bold text-purple mb-3">Withdraw to Bank:</h6>
            {accountDetails && accountDetails.bank_name ? (
              <div className="border d-flex justify-content-between align-items-center mb-2 bank-name">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src="https://images.africanfinancials.com/ng-wemaba-logo-200x200.png"
                    alt="Wema Bank"
                    style={{ width: 40, height: 40 }}
                  />
                  <div>
                    <div className="fw-bold text-purple">{accountDetails?.bank_name}</div>
                    <small>{accountDetails?.account_number ? `**** **** ${accountDetails?.account_number.slice(-4)}` : ''}</small>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning mb-3" role="alert">
                <strong>No bank account added!</strong> Please add your bank account details in settings before withdrawing.
              </div>
            )}
            {/* <div className="border rounded p-3 d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-3">
                <div>
                  <div className="fw-bold text-purple">No bank added</div>
                </div>
              </div>

            </div> */}
            {/* <button
              variant="light"
              className="w-100 text-purple border rounded mb-3"
              style={{ backgroundColor: '#f0e6ff', fontWeight: '600' }}
            >
              Add New Bank Account
            </button> */}
            {/* <button type="button" className="btn withdraw-btn" data-bs-toggle="modal" data-bs-target="#AccountModal">Add Account</button> */}
            <div className="mb-2">
              <label htmlFor="withdrawAmount" className="form-label fw-bold">Amount</label>
              <input
                type="text"
                placeholder="Type Desired Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-control amount"
              />
            </div>
          </div>
          <div className="modal-footer border-0">
            <button
              data-bs-dismiss="modal"
              type="button"
              variant="primary"
              className="btn w-100 rounded fw-bold p-3"
              style={{
                backgroundColor: (accountDetails && accountDetails.bank_name) ? '#6a00a0' : '#ccc',
                border: 'none',
                color: '#fff',
                cursor: (accountDetails && accountDetails.bank_name) ? 'pointer' : 'not-allowed'
              }}
              onClick={handleWithdraw}
              disabled={!accountDetails || !accountDetails.bank_name}
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>
      {/* <ToastContainer /> */}
    </div>
  );
};

export default WithdrawModal;
