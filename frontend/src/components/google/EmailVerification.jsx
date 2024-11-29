import React, { useState } from "react";
import { Box, Button, Typography, TextField, Alert, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!verificationCode) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: localStorage.getItem("email"), code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "인증에 실패했습니다.");
      }

      setSuccess("이메일 인증이 완료되었습니다!");
      setTimeout(() => navigate("/"), 2000); // 2초 후 홈으로 이동
    } catch (error) {
      console.error("인증 오류:", error);
      setError(error.message || "인증 중 문제가 발생했습니다.");
    }
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid
        item
        xs={12}
        lg={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "grey.100",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: 240,
            height: 240,
            backgroundImage: "linear-gradient(to top right, #7e57c2, #ec407a)",
            borderRadius: "50%",
            animation: "bounce 2s infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        />
      </Grid>
      <Grid
        item
        xs={12}
        lg={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "grey.100",
          padding: 4,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 500,
            padding: 4,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.300",
            backgroundColor: "white",
            boxShadow: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            이메일 인증
          </Typography>
          <Box
            component="form"
            onSubmit={handleVerifyCode}
            sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="인증 코드"
              variant="outlined"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary" sx={{ py: 1.5 }}>
              인증 완료
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default EmailVerification;