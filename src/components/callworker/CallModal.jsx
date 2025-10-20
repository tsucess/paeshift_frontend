import React from 'react'
import { Modal, Button } from 'react-bootstrap';
import './CallModal.css';


const CallModal = () => {
  return (
    <div className="modal fade" id="callModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content call-modal-content text-white">
          <div className="modal-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <img
                  src="https://via.placeholder.com/60"
                  alt="Profile"
                  className="rounded-circle"
                  width="60"
                  height="60"
                />
                <div>
                  <h5 className="fw-bold mb-0">Esther Grace</h5>
                  <small>Connecting</small>
                </div>
              </div>
              <button className="btn btn-danger rounded-circle call-cancel-btn">
                <i className="bi bi-telephone-x-fill fs-5"></i>
              </button>
            </div>

            <div className="bg-light text-dark rounded-4 p-3 d-flex justify-content-around">
              <div className="text-center">
                <button className="icon-circle bg-secondary mb-2">
                  <i className="bi bi-pause-circle fs-4"></i>
                </button>
                <small>Hold</small>
              </div>
              <div className="text-center">
                <button className="icon-circle bg-secondary mb-2">
                  <i className="bi bi-mic-mute fs-4"></i>
                </button>
                <small>Mute</small>
              </div>
              <div className="text-center">
                <button className="icon-circle bg-primary text-white mb-2">
                  <i className="bi bi-volume-up-fill fs-4"></i>
                </button>
                <small>Speaker</small>
              </div>
              <div className="text-center">
                <button className="icon-circle bg-secondary mb-2">
                  <i className="bi bi-arrows-angle-expand fs-4"></i>
                </button>
                <small>Minimize</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CallModal