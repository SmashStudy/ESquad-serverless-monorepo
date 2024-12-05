import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("jwtToken"); // 토큰 확인

  if (!token) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    return <Navigate to="/login" />;
  }

  // 토큰이 있으면 요청한 페이지로 이동
  return children;
};

export default PrivateRoute;
