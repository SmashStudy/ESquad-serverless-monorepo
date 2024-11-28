import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Grid, TextField, Alert } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { initializeCognitoConfig, getCognitoConfig } from "./Config.js";

const API_URL = "https://jg3x4yqtfb.execute-api.us-east-1.amazonaws.com/local";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // React Router's navigate function

  useEffect(() => {
    const loadConfig = async () => {
      try {
        await initializeCognitoConfig();
        const cognitoConfig = getCognitoConfig();
        setConfig(cognitoConfig);
      } catch (error) {
        console.error("환경 변수 로드 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleGoogleLogin = () => {
    if (!config) {
      console.error("Cognito Config가 초기화되지 않았습니다.");
      return;
    }

    const { clientId, redirectUri, domain, scope, responseType } = config;

    const cognitoGoogleLoginUrl = `https://${domain}/oauth2/authorize?client_id=${clientId}&response_type=${responseType}&scope=${scope}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;

    window.location.href = cognitoGoogleLoginUrl;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "로그인에 실패했습니다.");
      }

      setSuccess("로그인에 성공했습니다!");
      setError("");
      
      const { accessToken, idToken, refreshToken } = data;
      localStorage.setItem("jwtToken", idToken);

      window.location.href = "/";
    } catch (error) {
      console.error("로그인 오류:", error);
      setError(error.message || "로그인 중 문제가 발생했습니다.");
    }
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left Section */}
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
            position: "relative",
          }}
        >
          <Box sx={{ textAlign: "center", marginBottom: 3 }}>
            <img
              src="https://s3-esquad-public.s3.us-east-1.amazonaws.com/esquad-logo-bk.png"
              alt="Esquad Logo"
              style={{ width: "100px", height: "auto" }}
            />
          </Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Welcome Back to Esquad
          </Typography>
          <Box
            component="form"
            onSubmit={handleSignIn}
            sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="이메일"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="비밀번호"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary" sx={{ py: 1.5 }}>
              로그인
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
          <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<FcGoogle />}
              sx={{
                py: 1.5,
                borderColor: "grey.400",
                "&:hover": { backgroundColor: "grey.100" },
              }}
              onClick={handleGoogleLogin}
            >
              구글로 로그인
            </Button>
          </Box>
          <Typography sx={{ mt: 4 }}>
            아직 계정이 없으신가요?{" "}
            <Button variant="text" onClick={() => navigate("/signup")}>
              회원가입
            </Button>
          </Typography>
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        lg={6}
        sx={{
          display: { xs: "none", lg: "flex" },
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "grey.100",
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
      </Grid>
    </Grid>
  );
};

export default Login;
