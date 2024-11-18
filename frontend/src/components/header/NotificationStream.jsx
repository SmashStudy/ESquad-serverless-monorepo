import { useEffect, useState } from "react";

const NotificationStream = ({ userId, endpoint }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const eventSource = new EventSource(`${endpoint}/notifications/stream?userId=${encodeURIComponent(userId)}`);

        eventSource.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            setNotifications((prev) => [...prev, notification]);
        };

        eventSource.onerror = () => {
            console.error("Error with SSE connection.");
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [userId, endpoint]);

    return (
        <div>
            <h2>Notifications</h2>
            <ul>
                {notifications.map((notif) => (
                    <li key={notif.id}>
                        {notif.message} <em>- {notif.sender}</em>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationStream;