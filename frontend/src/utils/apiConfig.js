const environment = import.meta.env.VITE_ENVIRONMENT || 'local';

export const getStorageApi = () => `https://api.esquad.click/${environment}/files`;
export const getUserApi = () => `https://api.esquad.click/${environment}/users`;
export const getChatApi = () => `https://api.esquad.click/${environment}/chat`;
export const getCommunityApi = () => `https://api.esquad.click/${environment}/community`;
export const getNotificationApi = () => `https://api.esquad.click/${environment}/notification`
export const getTeamApi = () => 'https://api.esquad.click/dev/teams'
export const getStreamApi = () => `https://api.esquad.click/${environment}/stream`
export const getStreamingApi = () => environment === 'local' ? 'https://localhost:9000/' : 'https://live.dev.esquad.click/';


export const getNotificationWebsocketApi = () => environment === 'local' ?
    'wss://cjf00kxsf3.execute-api.us-east-1.amazonaws.com/local'
    : 'wss://u0ly4j754b.execute-api.us-east-1.amazonaws.com/dev'
