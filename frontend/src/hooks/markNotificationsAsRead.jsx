import axios from "axios";

const markNotificationsAsRead = async (notificationIds, endpoint) => {
    try {
        await axios.post(`${endpoint}/notifications/mark-as-read`, { notificationIds });
        alert("Notifications marked as read!");
    } catch (error) {
        console.error("Error marking notifications as read:", error);
    }
};

export default markNotificationsAsRead;