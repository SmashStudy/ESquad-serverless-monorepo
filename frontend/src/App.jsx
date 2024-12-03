import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home.jsx";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./index.css";
import PostListPage from "./pages/community/PostListPage.jsx";
import StudyListPage from "./pages/team/study/StudyListPage.jsx";
import BookListPage from "./pages/team/book/BookListPage.jsx";
import BookDetailPage from "./pages/team/book/BookDetailPage.jsx";
import StudyDetailPage from "./pages/team/study/StudyDetailPage.jsx";
import PostDetailsPage from "./pages/community/PostDetailsPage.jsx";
import TeamMainPage from "./pages/team/TeamMainPage.jsx";
import PostEditPage from "./pages/community/PostEditPage.jsx";
import GoogleLogin from "./components/google/GoogleLogin.jsx";
import AuthCallback from "./components/google/AuthCallback.jsx";
import GoogleLogout from "./components/google/GoogleLogout.jsx";
import UserProfile from "./components/user/UserProfile.jsx";
import UserStorageUsage from "./components/user/UserStorageUsage";
import Nickname from "./components/user/UserNickname.jsx";
import Layout from "./components/user/Layout.jsx";
import SignUp from "./components/google/SignUp.jsx";
import Confirm from "./components/google/EmailVerification.jsx"
import PrivateRoute from "./components/user/PrivateRoute.jsx";
import AdminPage from "./components/user/AdminPage.jsx";
import AdminRoute from "./components/google/AdminRoute.jsx";
import UnauthorizedPage from "./components/google/UnauthorizedPage.jsx";
import ConfirmPassword from "./components/user/ConfirmPassword.jsx";
import RequestPasswordReset from "./components/user/RequestPasswordReset.jsx"
import { decodeJWT } from "./utils/decodeJWT.js";



const theme = createTheme({
  palette: {
    primary: {
      main: "#9f51e8", // Home color
      light: "#ac71e5",
    },
    secondary: {
      main: "#0095ff", // Emphasis color
    },
    warning: {
      main: "#f51738",
    },
    background: {
      default: "#F0F0F0", // Background color
      paper: "#FFFFFF", // Sub color for cards
      gray: "#e0dddd",
    },
  },
  typography: {
    fontFamily: "AppleSDGothicNeo, Noto Sans KR, sans-serif",
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem("jwtToken"); // 로컬 스토리지에서 JWT 토큰 가져오기
      if (!token) {
        setIsLoggedIn(false); // 토큰이 없으면 로그인 상태 해제
        return;
      }
  
      try {
        // decodeJWT를 사용하여 토큰 디코딩
        const decoded = decodeJWT(token);
  
        if (!decoded) {
          throw new Error("유효하지 않은 JWT 토큰입니다.");
        }
  
        const now = Date.now() / 1000; // 현재 시간 (초 단위)
  
        if (decoded.exp && decoded.exp < now) {
          // 만료된 토큰인 경우
          console.log("토큰이 만료되었습니다.");
          localStorage.removeItem("jwtToken"); // 만료된 토큰 삭제
          setIsLoggedIn(false); // 로그인 상태 해제
        } else {
          // 유효한 토큰인 경우
          setIsLoggedIn(true); // 로그인 상태 유지
        }
      } catch (error) {
        console.error("토큰 유효성 확인 중 오류 발생:", error.message);
        setIsLoggedIn(false); // 오류 발생 시 로그인 상태 해제
      }
    };
  
    checkTokenValidity(); // 컴포넌트 로드 시 토큰 유효성 확인
  
    // 주기적으로 토큰 유효성 확인 (예: 5분마다)
    const interval = setInterval(() => {
      checkTokenValidity();
    }, 5 * 60 * 1000); // 5분마다 실행
  
    return () => clearInterval(interval); // 컴포넌트 언마운트 시 타이머 정리
  }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem("jwtToken"); // 로컬 스토리지에서 JWT 토큰 확인
  //   if (token) {
  //     setIsLoggedIn(true); // 토큰이 있으면 로그인 상태로 설정
  //   } 
  //   setIsLoggedIn(false); // 토큰이 없으면 로그인 상태 해제
  // }, []); // 컴포넌트가 처음 렌더링될 때만 실행

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* 토큰이 없으면 Google Login으로 리다이렉트 */}
          {!isLoggedIn && (
            <Route path="*" element={<Navigate to="/login" />} />
          )}

          <Route path="/login" element={<GoogleLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/logout" element={<GoogleLogout />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/reset" element={<RequestPasswordReset />} />
          <Route path="/confirm/password" element={<ConfirmPassword />} />


          {/* 보호된 경로 */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          >
            {/* user */}
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/profile/category" element={<UserStorageUsage />} />
            <Route path="/user/profile/nickname" element={<Nickname />} />
            <Route path="/user/profile/layout" element={<Layout />} />
            
            {/* admin */}
            <Route path="/admin" element={<AdminRoute><AdminPage /></ AdminRoute >}/>

            {/* 403 접근 금지 페이지 */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* community */}
            <Route path="community/questions" element={<PostListPage />} />
            <Route
              path="community/:boardType/:postId"
              element={<PostDetailsPage />}
            />
            <Route path="community/general" element={<PostListPage />} />
            <Route path="community/team-recruit" element={<PostListPage />} />

            {/* team */}
            <Route path="teams/:teamId" element={<TeamMainPage />}>
              {" "}
              {/* 팀 분석 페이지 */}
              <Route path="study" element={<StudyListPage />} />
              <Route path="study/:studyId" element={<StudyDetailPage />} />
              <Route path="book/search" element={<BookListPage />} />
              <Route path="book/:bookId" element={<BookDetailPage />} />
              <Route path="questions" element={<PostListPage />} />
              <Route path="questions/:postId" element={<PostDetailsPage />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              isLoggedIn ? <Navigate to="/" /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
