export function decodeJWT(token) {
    try {
        const base64Payload = token.split(".")[1];
        const base64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(
            decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(function (c) {
                        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join("")
            )
        );
        return payload;
    } catch (error) {
        console.error("Failed to decode JWT token", error);
        return null;
    }
}