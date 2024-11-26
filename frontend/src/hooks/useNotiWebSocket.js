import { useEffect, useRef } from "react";

const domainName = 'ws.noti.api.esquad.click';
const useWebSocket = (userId, onMessageReceived) => {
    const socketRef = useRef(null);

    useEffect(() => {
        const connectToWebSocket = () => {
            if (
                socketRef.current &&
                (socketRef.current.readyState === WebSocket.OPEN ||
                    socketRef.current.readyState === WebSocket.CONNECTING)
            ) {
                console.log("WebSocket is already active. Skipping new connection.");
                return;
            }

            const address = `wss:/${domainName}?userId=${encodeURIComponent(userId)}`;
            const ws = new WebSocket(address);
            console.log("Creating a new WebSocket connection.");

            ws.onopen = () => {
                console.log("WebSocket 연결 성공");
                const fetchNotificationsMessage = JSON.stringify({
                    action: "countUnReadNotifications",
                    userId: userId,
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

        connectToWebSocket();

        return () => {
            if (socketRef.current) {
                console.log("Closing WebSocket connection.");
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [userId, onMessageReceived]);
};

export default useWebSocket;