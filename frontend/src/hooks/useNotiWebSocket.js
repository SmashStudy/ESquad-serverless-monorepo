import { useEffect, useRef } from "react";

/**
 * Custom hook for managing a WebSocket connection.
 * @param {Function} onMessageReceived - Callback to handle incoming WebSocket messages.
 * @param {Object} options - Optional configurations.
 * @param {Function} setUnReadCount - Function to update unread count state.
 * @param {Function} setNotifications - Function to update notifications state.
 */

const useNotiWebSocket = ({ user, onMessageReceived }) => {

  const socketRef = useRef(null);

  const connectToWebSocket = () => {
    if(!user?.email) {
      console.error("WebSocket connection failed: User email is undefined.");
      return;
    }

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket is already active. Skipping new connection.");
      return;
    }

    // const address = `wss://ws.noti.api.esquad.click?userId=${encodeURIComponent(
    //   user.email
    // )}`;
    const address = `wss://cjf00kxsf3.execute-api.us-east-1.amazonaws.com/local?userId=${encodeURIComponent(
        user?.email
    )}`;
    const ws = new WebSocket(address);
    console.log("Creating a new WebSocket connection.");

    ws.onopen = () => {
      console.log("WebSocket 연결 성공");
      const fetchNotificationsMessage = JSON.stringify({
        action: "countUnReadNotifications",
        userId: user?.email,
      });
      ws.send(fetchNotificationsMessage);
    };

    ws.onmessage = (message) => {
      const obj = JSON.parse(message.data);
      console.log(`Received messages from websocket: ${JSON.stringify(obj)}`);
      onMessageReceived(obj);
    };

    ws.onclose = () => {
      console.log("WebSocket 연결 종료");
      socketRef.current = null;
    };

    ws.onerror = (event) => {
      console.error("WebSocket 에러 발생:", event);
      socketRef.current = null;
    };

    socketRef.current = ws;
  };

  useEffect(() => {
    // Only connect when user is available
    if (user?.email) {
      connectToWebSocket();
    }

    return () => {
      // Cleanup on component unmount
      if (socketRef.current) {
        socketRef.current.close();
        console.log("WebSocket 연결 해제");
      }
    };
  }, [user]);

  return { connectToWebSocket };
};

export default useNotiWebSocket;
