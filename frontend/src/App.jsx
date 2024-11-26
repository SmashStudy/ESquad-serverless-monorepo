import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React, { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthCallback from "./components/google/AuthCallback.jsx";
import GoogleLogout from "./components/google/GoogleLogout.jsx";
import GoogleLogin from "./components/google/GoolgeLogin.jsx";
import Category from "./components/user/UserCategory.jsx";
import Nickname from "./components/user/UserNickname.jsx";
import UserProfile from "./components/user/UserProfile.jsx";
import "./index.css";
import PostDetailsPage from "./pages/community/PostDetailsPage.jsx";
import PostEditPage from "./pages/community/PostEditPage.jsx";
import PostListPage from "./pages/community/PostListPage.jsx";
import Home from "./pages/home/Home.jsx";
import BookDetailPage from "./pages/team/book/BookDetailPage.jsx";
import BookListPage from "./pages/team/book/BookListPage.jsx";
import StudyDetailPage from "./pages/team/study/StudyDetailPage.jsx";
import StudyListPage from "./pages/team/study/StudyListPage.jsx";
import TeamMainPage from "./pages/team/TeamMainPage.jsx";

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
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/google" element={<GoogleLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/logout" element={<GoogleLogout />} />

          <Route path="/" element={<Home />}>
            {/* user */}
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/profile/category" element={<Category />} />
            <Route path="/user/profile/nickname" element={<Nickname />} />

            {/* community */}
            <Route path="community/questions" element={<PostListPage />} />
            <Route
              path="community/questions/:postId"
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
              <Route path="book/search/:bookId" element={<BookDetailPage />} />
              <Route path="questions" element={<PostListPage />} />
              <Route path="questions/:postId" element={<PostDetailsPage />} />
              <Route path="questions/:postId/edit" element={<PostEditPage />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              isLoggedIn ? <Navigate to="/" /> : <Navigate to="/google" />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
