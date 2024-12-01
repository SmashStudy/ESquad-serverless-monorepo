const environment = import.meta.env.VITE_ENVIRONMENT || 'local';

export const getStorageApi = () => `https://api.esquad.click/${environment}/files`;
export const getUserApi = () => `https://api.esquad.click/${environment}/users`;
export const getChatApi = () => `https://api.esquad.click/${environment}/chat`;
export const getCommunityApi = () => `https://api.esquad.click/${environment}/community`;
export const getNotificationApi = () => `https://api.esquad.click/${environment}/notification`;
export const getTeamApi = () => 'https://api.esquad.click/teams';
export const getStreamApi = () => `https://api.esquad.click/${environment}/stream`

export const getNotificationWebsocketApi = () => environment === 'local' ? 'wss://cjf00kxsf3.execute-api.us-east-1.amazonaws.com/local' : 'wss://ws.noti.api.esquad.click'
