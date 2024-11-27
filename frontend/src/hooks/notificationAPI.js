import axios from "axios";

const API_GATEWAY_URL = "https://api.esquad.click/local/notification";

export const fetchAll = async ({ lastEvaluatedKey = null, user }) => {
  try {
    const endpoint = `${API_GATEWAY_URL}/all`;

    const response = await axios.post(
      endpoint,
      {
        userId: user.email,
        lastEvaluatedKey, // Include pagination key if provided
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error) {
    throw "처리에 실패했습니다.";
  }
};

export const fetchAllSaved = async ({ user, key }) => {
  try {
    const response = await axios.post(
      `${API_GATEWAY_URL}/filter-saved`,
      {
        userId: user.email,
        ...(key && { lastEvaluatedKey: key }),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Saved notifications: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (err) {
    throw "처리에 실패했습니다.";
  }
};

export const markAllAsRead = async ({
  notifications,
  user,
  setNotifications,
  setUnReadCount,
}) => {
  const notificationIds = notifications
    .filter((notification) => notification.isRead === "0") // Filter unread notifications
    .map((notification) => notification.id); // Extract IDs

  if (notificationIds.length > 0) {
    try {
      const response = await axios.post(
        `${API_GATEWAY_URL}/mark`,
        { notificationIds, userId: user.email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.isRead === "1"
              ? notification
              : { ...notification, isRead: "1" }
          )
        );
        setUnReadCount((prevCount) =>
          Math.max(prevCount - notificationIds.length, 0)
        );
      }
    } catch (error) {
      throw "처리에 실패했습니다.";
    }
  } else {
    alert("모든 알림이 모두 읽음 처리된 상태입니다!");
  }
};

export const markAsSave = async ({ user, notificationId }) => {
  try {
    const url = `${API_GATEWAY_URL}/save`;
    const queryParams = `?userId=${encodeURIComponent(
      user.email
    )}&id=${encodeURIComponent(notificationId)}`;
    const fullUrl = `${url}${queryParams}`;

    const response = await axios.get(fullUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    throw "알림 처리에 실패했습니다.";
  }
};

export const releaseSaved = async ({ user, notificationId }) => {
  try {
    const url = `${API_GATEWAY_URL}/release-save`;
    const queryParams = `?userId=${encodeURIComponent(
      user.email
    )}&id=${encodeURIComponent(notificationId)}`;
    const fullUrl = `${url}${queryParams}`;

    const response = await axios.get(fullUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    throw "알림 저장 해제에 실패했습니다.";
  }
};
