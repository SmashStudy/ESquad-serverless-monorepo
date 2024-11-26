export function formatTimeAgo(isoDate) {
    const now = new Date();
    const createdAt = new Date(isoDate);
    const diffInSeconds = Math.floor((now - createdAt) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
        return "지금 막";
    } else if (minutes < 60) {
        return `${minutes} 분 전`;
    } else if (hours < 24) {
        return `${hours} 시간 전`;
    } else {
        return `${days} 일 전`;
    }
}