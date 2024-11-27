import axios from "axios";

const API_GATEWAY_URL = "https://api.esquad.click/local/notification";

export const fetchNotifications = async (
  userId,
  lastEvaluatedKey,
  showArchived
) => {
  const endpoint = showArchived
    ? `${API_GATEWAY_URL}/filter-saved`
    : `${API_GATEWAY_URL}/all`;

  const response = await axios.post(
    endpoint,
    {
      userId,
      lastEvaluatedKey,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const markNotificationsAsRead = async (userId, notificationIds) => {
  const response = await axios.post(
    `${API_GATEWAY_URL}/mark`,
    {
      userId,
      notificationIds,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

export const markNotificationAsSave = async (userId, id) => {
  const response = await axios.get(
    `${API_GATEWAY_URL}/save?userId=${encodeURIComponent(
      userId
    )}&id=${encodeURIComponent(id)}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const releaseSaveNotification = async (userId, id) => {
  const response = await axios.get(
    `${API_GATEWAY_URL}/release-save?userId=${encodeURIComponent(
      userId
    )}&id=${encodeURIComponent(id)}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
