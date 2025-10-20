import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import successLogo from "../../assets/images/success.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faCheckDouble,
    faChevronRight,
    faSpinner,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import "./Notificationmodal.css";
import 'react-toastify/dist/ReactToastify.css';

import { showErrorToast } from '../../utils/toastConfig';





import Axios from "axios";




import { format, parseISO, isToday, isYesterday, startOfDay } from 'date-fns';
import { API_BASE_URL } from "../../config";






const Notificationmodal = ({ setNewNotification, setReadCount, notificationData, refetchNotifications, pollingInterval = 10000 }) => {
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [markingAsRead, setMarkingAsRead] = useState({});
    const currentUserId = localStorage.getItem("user_id");

    // Track modal open state
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!currentUserId) {
            setModalOpen(false);
            return;
        }
        const modal = document.getElementById('notificationModal');
        if (!modal) return;
        const handleShow = () => setModalOpen(true);
        const handleHide = () => setModalOpen(false);
        modal.addEventListener('show.bs.modal', handleShow);
        modal.addEventListener('hide.bs.modal', handleHide);
        return () => {
            modal.removeEventListener('show.bs.modal', handleShow);
            modal.removeEventListener('hide.bs.modal', handleHide);
        };
    }, [currentUserId]);

    const fetchNotifications = async () => {
        if (!currentUserId) return [];
        try {
            const { data } = await Axios.get(`${API_BASE_URL}/notifications/${currentUserId}/`);
            return data?.data?.notifications || [];
        } catch (error) {
            // If unauthorized, user might be logged out
            if (error.response?.status === 401) {
                return [];
            }
            throw error;
        }
    };

    const {
        data: notifications = [],
        isLoading,
        error,
        refetch: refetchNotificationsLocal
    } = useQuery({
        queryKey: ['modalNotifications', currentUserId],
        queryFn: fetchNotifications,
        enabled: Boolean(currentUserId) && !notificationData,
        refetchInterval: currentUserId && modalOpen ? pollingInterval : false, // Only poll when modal is open and user is logged in
        retry: false // Don't retry on auth errors
    });

    // Use prop data if available, else use local query - memoized to prevent unnecessary re-renders
    const notificationsList = useMemo(() => {
        return notificationData?.notifications || notifications;
    }, [notificationData, notifications]);



  const notifyError = (message) => {
    return showErrorToast(message);
  };

    // Apply filter to notifications - memoized to prevent infinite re-renders
    const applyFilter = useCallback((filter, notificationsToFilter) => {
        if (!Array.isArray(notificationsToFilter)) {
            return [];
        }

        switch (filter) {
            case "read":
                return notificationsToFilter.filter(notification => notification.is_read);
            case "unread":
                return notificationsToFilter.filter(notification => !notification.is_read);
            case "all":
            default:
                return notificationsToFilter;
        }
    }, []);


    // Handle filter change
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };

    // Mark notification as read
    const handleReadNotification = (notificationId) => {
        if (!notificationId || markingAsRead[notificationId]) return;

        setMarkingAsRead(prev => ({ ...prev, [notificationId]: true }));

        Axios.post(`${API_BASE_URL}/notifications/notifications/${currentUserId}/${notificationId}/mark-as-read/`)
            .then((response) => {
                if (response.data && response.status === 200) {
                    // Refetch notifications for real-time update
                    if (typeof refetchNotifications === 'function') {
                        refetchNotifications();
                    } else {
                        refetchNotificationsLocal();
                    }
                } else {
                    notifyError("Failed to mark notification as read");
                }
            })
            .catch((error) => {
                console.error("Error marking notification as read:", error);
                notifyError("Failed to mark notification as read");
            })
            .finally(() => {
                setMarkingAsRead(prev => ({ ...prev, [notificationId]: false }));
            });
    };

    // Combine all state updates into a single useEffect to prevent cascading updates
    useEffect(() => {
        if (!currentUserId || !Array.isArray(notificationsList)) {
            return;
        }

        // Apply filter
        const filtered = applyFilter(activeFilter, notificationsList);
        setFilteredNotifications(filtered);

        // Update new notification count
        if (typeof setNewNotification === "function") {
            const unreadCount = notificationsList.filter(n => !n.is_read).length;
            setNewNotification(unreadCount);
            localStorage.setItem(`unread_notifications_${currentUserId}`, unreadCount);
        }

        // Update read count
        if (typeof setReadCount === "function") {
            const unreadCount = filtered.filter(n => !n.is_read).length;
            setReadCount(unreadCount);
        }
    }, [notificationsList, activeFilter, currentUserId]);

    // Initialize unread count from localStorage on component mount
    useEffect(() => {
        if (currentUserId && typeof setNewNotification === "function") {
            const savedUnreadCount = localStorage.getItem(`unread_notifications_${currentUserId}`);
            if (savedUnreadCount !== null) {
                setNewNotification(parseInt(savedUnreadCount, 10));
            }
        }
    }, [currentUserId]);

    // Group notifications by date
    const groupNotificationsByDate = (notifications) => {
        const grouped = {};

        notifications.forEach(notification => {
            const date = parseISO(notification.created_at);
            const dateKey = format(startOfDay(date), 'yyyy-MM-dd');

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(notification);
        });

        // Sort dates in descending order (newest first)
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        return sortedDates.map(dateKey => ({
            date: new Date(dateKey),
            dateString: dateKey,
            notifications: grouped[dateKey]
        }));
    };

    // Get display label for date
    const getDateLabel = (date) => {
        if (isToday(date)) {
            return 'Today';
        } else if (isYesterday(date)) {
            return 'Yesterday';
        } else {
            return format(date, 'EEEE, MMMM d, yyyy');
        }
    };



    // Don't render if user is not authenticated
    if (!currentUserId) {
        return null;
    }

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
                                <button
                                    type="button"
                                    className={`btn btn-filter ${activeFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('all')}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-filter ${activeFilter === 'read' ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('read')}
                                >
                                    Read
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-filter ${activeFilter === 'unread' ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('unread')}
                                >
                                    Unread
                                </button>
                            </div>
                        </div>
                        {/* <div className="title">
                            <h3>Today</h3>
                        </div> */}

                        {/* Loading state */}
                        {isLoading && (
                            <div className="text-center py-4">
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" />
                                <p className="mt-2">Loading notifications...</p>
                            </div>
                        )}

                        {/* Error state */}
                        {error && !isLoading && (
                            <div className="alert alert-danger" role="alert">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                {error}
                                <button
                                    className="btn btn-sm btn-outline-danger ms-2"
                                    onClick={refetchNotifications || refetchNotificationsLocal}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Empty state */}
                        {!isLoading && !error && filteredNotifications.length === 0 && (
                            <div className="text-center py-4">
                                <p>No notifications found.</p>
                            </div>
                        )}

                        {/* Notifications list */}
                        {!isLoading && !error && filteredNotifications.length > 0 && (
                            <>
                                {(() => {
                                    const groupedNotifications = groupNotificationsByDate(filteredNotifications);
                                    return groupedNotifications.map((group, groupIndex) => (
                                        <div key={groupIndex}>
                                            <div className="title">
                                                <h3>{getDateLabel(group.date)}</h3>
                                            </div>
                                            {group.notifications.map((item, itemIndex) => (
                                                <div
                                                    className={`row notify_details mb-3 ${item.is_read ? 'read' : 'unread'}`}
                                                    key={itemIndex}
                                                    onClick={() => !item.is_read && handleReadNotification(item.id)}
                                                >
                                                    <div className="col-7 labels title">
                                                        <div className="profile_wrapper">
                                                            <img src={successLogo} alt="" />
                                                        </div>
                                                        <p className="m-0" >{item.category}</p>
                                                    </div>
                                                    <div className="col-5 values">
                                                        <p className="m-0 datetime">
                                                            {format(parseISO(item.created_at), "HH:mm:ss")}
                                                        </p>
                                                    </div>
                                                    <div className="col-12 mt-2 labels message">
                                                        <p>{item.message}</p>
                                                    </div>
                                                    <div className="col-5 labels">
                                                        <button
                                                            type="button"
                                                            disabled={markingAsRead[item.id] || item.is_read}
                                                        >
                                                            {markingAsRead[item.id] ? (
                                                                <FontAwesomeIcon icon={faSpinner} spin className="notify_icon" />
                                                            ) : (
                                                                <FontAwesomeIcon
                                                                    icon={item.is_read ? faCheckDouble : faCheck}
                                                                    className="notify_icon"
                                                                />
                                                            )}
                                                            {item.is_read ? "Read" : "Mark as Read"}
                                                        </button>
                                                    </div>
                                                    {/* Only show link if item.link exists and is a non-empty string */}
                                                    {item.link && typeof item.link === 'string' && item.link.trim() !== '' && (
                                                      <div className="col-7 values">
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                          View Details <FontAwesomeIcon icon={faChevronRight} className="notify_icon" />
                                                        </a>
                                                      </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ));
                                })()}
                            </>
                        )}
                    </div>
                    <div className="modal-footer border-0">
                        <button
                            type="button"
                            className="btn primary-btn"
                            onClick={refetchNotifications || refetchNotificationsLocal}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Notificationmodal