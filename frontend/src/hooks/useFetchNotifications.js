import { useState } from "react";
import { fetchNotifications} from "./notificationAPI.js";

const useFetchNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    const fetchNotification = async (showArchived = false, key = null) => {
        if (isFetching) return;

        setIsFetching(true);
        try {
            const data = await fetchNotifications(userId, key, showArchived);
            setNotifications((prev) => [...(prev || []), ...(data.items || [])]);
            setLastEvaluatedKey(data.lastEvaluatedKey || null);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setIsFetching(false);
        }
    };

    return {
        notifications,
        lastEvaluatedKey,
        isFetching,
        fetchNotification,
        setNotifications,
    };
};

export default useFetchNotifications;