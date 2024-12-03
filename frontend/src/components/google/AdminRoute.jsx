import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { getUserApi } from "../../utils/apiConfig.js";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await fetch(`${getUserApi()}/role`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to check user role");
        }

        const data = await response.json();
        setIsAdmin(data.role === "admin");
        setLoading(false);
      } catch (error) {
        console.error("Error verifying admin:", error);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    // 로딩 화면 표시
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "white",
        }}
      >
        <img
          src="https://s3-esquad-public.s3.us-east-1.amazonaws.com/esquad-logo-nbk.png"
          alt="Esquad Logo"
          style={{ width: "120px", marginBottom: "20px" }}
        />
        <CircularProgress size={50} thickness={4} sx={{ color: "#6200ee" }} />
        <Typography
          variant="body1"
          sx={{ color: "#555", fontSize: "16px", marginTop: "20px" }}
        >
          인증 중입니다. 잠시만 기다려 주세요...
        </Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" />; // 403 페이지로 리디렉션
  }

  return children;
};

export default AdminRoute;
