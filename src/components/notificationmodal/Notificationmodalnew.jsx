import React, { useState, useEffect, useCallback } from "react";
import successLogo from "../../assets/images/success.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faCheckDouble,
    faChevronRight,
    faSpinner,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import ProfileImage from "../../assets/images/profile.png";
import "./Notificationmodal.css";
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from "../../config.js";

const Notificationmodal = () => {
    // State management
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [markingAsRead, setMarkingAsRead] = useState({});

    // Get user info from localStorage
    const currentUserId = localStorage.getItem("user_id");
    const currentUserRole = localStorage.getItem("user_role");

    // Format date for display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);

            // Check if date is today
            if (date.toDateString() === now.toDateString()) {
                return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }

            // Check if date is yesterday
            if (date.toDateString() === yesterday.toDateString()) {
                return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }

            // Otherwise return full date
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

    // Group notifications by date
    const groupNotificationsByDate = (notifications) => {
        const groups = {};

        notifications.forEach(notification => {
            const date = new Date(notification.created_at);
            const dateString = date.toDateString();

            if (!groups[dateString]) {
                groups[dateString] = [];
            }

            groups[dateString].push(notification);
        });

        return groups;
    };

    // Fetch notifications
    const fetchNotifications = useCallback(() => {
        if (!currentUserId) return;

        setIsLoading(true);
        setError(null);

        Axios.get(`${API_BASE_URL}/notifications/${currentUserId}/`)
            .then((response) => {
                if (response.data && response.data.data && response.data.data.notifications) {
                    setNotifications(response.data.data.notifications);
                    applyFilter(activeFilter, response.data.data.notifications);
                } else {
                    setError("Invalid response format from server");
                }
            })
            .catch((error) => {
                console.error("Error fetching notifications:", error);
                setError("Failed to load notifications. Please try again.");
                toast.error("Failed to load notifications");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [currentUserId, activeFilter]);

    // Apply filter to notifications
    const applyFilter = (filter, notificationsToFilter = notifications) => {
        switch (filter) {
            case "read":
                setFilteredNotifications(notificationsToFilter.filter(notification => notification.is_read));
                break;
            case "unread":
                setFilteredNotifications(notificationsToFilter.filter(notification => !notification.is_read));
                break;
            case "all":
            default:
                setFilteredNotifications(notificationsToFilter);
                break;
        }
    };

    // Handle filter change
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        applyFilter(filter);
    };

    // Mark notification as read
    const handleReadNotification = (notificationId) => {
        if (!notificationId || markingAsRead[notificationId]) return;

        // Update local state to show loading
        setMarkingAsRead(prev => ({ ...prev, [notificationId]: true }));

        Axios.post(`${API_BASE_URL}/notifications/notifications/${currentUserId}/${notificationId}/mark-as-read/`)
            .then((response) => {
                if (response.data && response.status === 200) {
                    // Update notification in state
                    const updatedNotifications = notifications.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, is_read: true }
                            : notification
                    );

                    setNotifications(updatedNotifications);
                    applyFilter(activeFilter, updatedNotifications);
                    toast.success("Notification marked as read");
                } else {
                    toast.error("Failed to mark notification as read");
                }
            })
            .catch((error) => {
                console.error("Error marking notification as read:", error);
                toast.error("Failed to mark notification as read");
            })
            .finally(() => {
                // Remove loading state
                setMarkingAsRead(prev => ({ ...prev, [notificationId]: false }));
            });
    };




    return (
        <div className="modal fade come-from-modal right" id="notificationModal" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header pb-0 border-0">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">Notifications</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body mb-0 pb-0">
                        <div className="row mb-2">
                            <div className="col-12 p-2">
                                <button type="button" className="btn btn-filter active">All</button>
                                <button type="button" className="btn btn-filter">Read</button>
                                <button type="button" className="btn btn-filter">Unread</button>
                            </div>
                        </div>
                        <div className="title">
                            <h3>Today</h3>
                        </div>
                        {
                            notifications && notifications.map((item, key) => {
                                return (
                                    <div className="row notify_details mb-3" key={key} onClick={() => handleReadNotification(item.id)}>
                                        <div className="col-7 labels title">
                                            <div className="profile_wrapper">
                                                <img src={successLogo} alt="" />
                                            </div>
                                            <p className="m-0" >{item.category}</p>
                                        </div>
                                        <div className="col-5 values">
                                            <p className="m-0 datetime">{item.created_at}</p>
                                        </div>
                                        <div className="col-12 mt-2 labels message">
                                            <p>
                                                {item.message}
                                            </p>
                                        </div>
                                        <div className="col-5 labels">
                                            <button type="button"> <FontAwesomeIcon icon={item.is_read ? faCheckDouble : faCheck} className="notify_icon" />{item.is_read ? "Read" : "Mark as Read"}  </button>
                                        </div>
                                        <div className="col-7 values">
                                            <a href="">View Applicant Details <FontAwesomeIcon icon={faChevronRight} className="notify_icon" /> </a>
                                        </div>
                                    </div>
                                )
                            })

                        }

                        {/* <div className="row notify_details mb-3" onClick={() => handleReadNotification()}>
                            <div className="col-7 labels title">
                                <div className="profile_wrapper">
                                    <img src={successLogo} alt="" />
                                </div>
                                <p className="m-0" >Job Request Confirmed</p>
                            </div>
                            <div className="col-5 values">
                                <p className="m-0 datetime">Today 8:15 AM</p>
                            </div>
                            <div className="col-12 mt-2 labels message">
                                <p>
                                    Your “Professional Grass Cutter” Shift has been
                                    successfully posted. Ensure your notification
                                    is on so you can be informed
                                    when an applicant apples for the shift.
                                </p>
                            </div>
                            <div className="col-5 labels">
                                <button type="button"> <FontAwesomeIcon icon={faCheckDouble} className="notify_icon" />  Mark as Read</button>
                            </div>
                            <div className="col-7 values">
                                <a href="">View Applicant Details <FontAwesomeIcon icon={faChevronRight} className="notify_icon" /> </a>
                            </div>
                        </div>
                        <div className="row notify_details mb-3">
                            <div className="col-7 labels title">
                                <div className="profile_wrapper">
                                    <img src={ProfileImage} alt="" />
                                </div>
                                <p className="m-0" >New Applicant Request</p>
                            </div>
                            <div className="col-5 values">
                                <p className="m-0 datetime" >Today 8:15 AM</p>
                            </div>
                            <div className="col-12 mt-2 labels message">
                                <p>
                                    Applicant “Jasminxx” has applied for your
                                    “Professional Grass Cutter” Shift. Kindly proceed to review applicant
                                    profile to accept and decline applicant request.
                                </p>
                            </div>
                            <div className="col-5 labels">
                                <button type="button"> <FontAwesomeIcon icon={faCheckDouble} className="notify_icon" />  Mark as Read</button>
                            </div>
                            <div className="col-7 values">
                                <a href="">View Applicant Details <FontAwesomeIcon icon={faChevronRight} className="notify_icon" /> </a>
                            </div>
                        </div>
                        <div className="row notify_details mb-3">
                            <div className="col-7 labels title">
                                <div className="profile_wrapper">
                                    <img src={ProfileImage} alt="" />
                                </div>
                                <p className="m-0" >Applicant Approved</p>
                            </div>
                            <div className="col-5 values">
                                <p className="m-0 datetime" >Today 8:15 AM</p>
                            </div>
                            <div className="col-12 mt-2 labels message">
                                <p>
                                    You’ve successfully approved applicant
                                    “Jasminxx” for the  “Professional Grass Cutter” Shift.
                                    The applicant will now proceed to the location you
                                    specified when the time is right.
                                </p>
                            </div>
                            <div className="col-5 labels">
                                <button type="button"> <FontAwesomeIcon icon={faCheckDouble} className="notify_icon" />  Mark as Read</button>
                            </div>
                            <div className="col-7 values">
                                <a href="">View Applicant Details <FontAwesomeIcon icon={faChevronRight} className="notify_icon" /> </a>
                            </div>
                        </div> */}
                    </div>
                    <div className="modal-footer border-0">
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notificationmodal