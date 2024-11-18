import { useEffect, useState } from "react";

const useNotificationWebSocket = (url) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const socket = new WebSocket(url);

        socket.onopen = () => console.log("WebSocket connected");
        socket.onmessage = (event) => {
            console.log(event);
            setMessages((prev) => [...prev, JSON.parse(event.data)]);
        }
        socket.onclose = () => console.log("WebSocket disconnected");
        socket.onerror = (error) => console.error("WebSocket error:", error);

        return () => socket.close();
    }, [url]);

    return [messages];
};

export default useNotificationWebSocket;