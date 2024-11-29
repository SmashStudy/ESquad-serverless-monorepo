import { useEffect, useRef } from "react";
import { getNotificationWebsocketApi } from "../utils/apiConfig.js";

/**
 * Custom hook for managing a WebSocket connection.
 * @param {Function} onMessageReceived - Callback to handle incoming WebSocket messages.
 * @param {Object} options - Optional configurations.
 * @param {Function} setUnReadCount - Function to update unread count state.
 * @param {Function} setNotifications - Function to update notifications state.
 */

const NOTIFICATION_WEBSOCKET_API = getNotificationWebsocketApi();

const useNotiWebSocket = ({ user, onMessageReceived }) => {
  const socketRef = useRef(null);

  const connectToWebSocket = () => {
    if (!user?.email) {
      return;
    }

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const address = `${NOTIFICATION_WEBSOCKET_API}?userId=${encodeURIComponent(
      user?.email
    )}`;
    const ws = new WebSocket(address);

    ws.onopen = () => {
      const fetchNotificationsMessage = JSON.stringify({
        action: "countUnReadNotifications",
        userId: user?.email,
      });
      ws.send(fetchNotificationsMessage);
    };

    ws.onmessage = (message) => {
      const obj = JSON.parse(message.data);
      onMessageReceived(obj);
    };

    ws.onclose = () => {
      socketRef.current = null;
    };

    ws.onerror = (event) => {
      console.error("WebSocket occurred error: ", event);
      socketRef.current = null;
    };

    socketRef.current = ws;
  };

  useEffect(() => {
    if (user?.email) {
      connectToWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);

  return { connectToWebSocket };
};

export default useNotiWebSocket;
