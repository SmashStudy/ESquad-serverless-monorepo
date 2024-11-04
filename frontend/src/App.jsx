import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Home from "./pages/home/Home.jsx";
import Join from "./pages/join/Join.jsx";
import Login from "./pages/login/Login.jsx";
import StudyPage from "./pages/team/study/StudyPage.jsx";
import { UserProvider } from '/src/components/form/UserContext.jsx';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './index.css';
import PostListPage from "./pages/community/PostListPage.jsx";
import StudyListPage from "./pages/team/study/StudyListPage.jsx";
import BookListPage from "./pages/team/book/BookListPage.jsx";
import BookDetailPage from "./pages/team/book/BookDetailPage.jsx";
import StudyDetailPage from "./pages/team/study/StudyDetailPage.jsx";
import PostDetailsPage from "./pages/community/PostDetailsPage.jsx";

const theme = createTheme({
    palette: {
        primary: {
            main: '#9f51e8', // Home color
            light: '#ac71e5',
        },
        secondary: {
            main: '#0095ff', // Emphasis color
        },
        warning: {
            main: '#f51738',
        },
        background: {
            default: '#F0F0F0', // Background color
            paper: '#FFFFFF', // Sub color for cards
            gray: '#e0dddd',
        },
    },
    typography: {
        fontFamily: 'AppleSDGothicNeo, Noto Sans KR, sans-serif',
    },
});

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    // Set login state based on token in localStorage
    // useEffect(() => {
    //     const token = localStorage.getItem('jwt');
    //     if (token) {
    //         setIsLoggedIn(true);
    //     }
    // }, [isLoggedIn]);
    //
    // const ProtectedRoute = ({ children }) => {
    //     const token = localStorage.getItem('jwt');
    //     if (!token) {
    //         return <Navigate to="/login" />;
    //     }
    //     return children;
    // };
    //
    // const RedirectIfLoggedIn = ({ children }) => {
    //     const token = localStorage.getItem('jwt');
    //     if (token) {
    //         return <Navigate to="/" />;
    //     }
    //     return children;
    // };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {/*<UserProvider>*/}
                <BrowserRouter>
                    <Routes>
                        {/* Redirect logged-in users away from the login page */}
                        <Route path="/login" element={
                            // <RedirectIfLoggedIn>
                                <Login setIsLoggedIn={setIsLoggedIn} />
                            // </RedirectIfLoggedIn>
                        } />
                        <Route path="/join" element={<Join />} />


                        {/* Protect routes that require authentication */}
                        <Route path="/" element={
                            // <ProtectedRoute>
                                <Home />
                            // </ProtectedRoute>
                        }>

                            {/* community */}
                            <Route path="community/questions" element={<PostListPage />} />
                                <Route path=":postId" element={<PostDetailsPage />} />
                            <Route path="community/general" element={<PostListPage />} />
                            <Route path="community/team-recruit" element={<PostListPage />} />


                            {/* team */}
                            <Route path="teams/:teamId" element={<StudyPage />}>
                                <Route path="study" element={<StudyListPage />} />
                                    <Route path=":studyId" element={<StudyDetailPage />} />
                                <Route path="book/search" element={<BookListPage />} />
                                    <Route path=":bookId" element={<BookDetailPage />} />
                                <Route path="questions" element={<StudyPage />} />
                            </Route>
                        </Route>

                        {/* Redirect unknown routes to home if authenticated, else to login */}
                        <Route path="*" element={
                            isLoggedIn ? <Navigate to="/" /> : <Navigate to="/login" />
                        } />
                    </Routes>
                </BrowserRouter>
            {/*</UserProvider>*/}
        </ThemeProvider>
    );
}

export default App;
