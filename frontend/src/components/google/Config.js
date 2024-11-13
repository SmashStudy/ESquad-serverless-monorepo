export const COGNITO_CONFIG = {
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  logoutUri: import.meta.env.VITE_COGNITO_LOGOUT_URI,
  domain: import.meta.env.VITE_COGNITO_DOMAIN,
  scope: import.meta.env.VITE_COGNITO_SCOPE,
  responseType: import.meta.env.VITE_COGNITO_RESPONSE_TYPE,
  logoutRedirectUri: import.meta.env.VITE_COGNITO_LOGOUT_URI
};
