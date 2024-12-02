import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Grid, TextField, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { initializeCognitoConfig, getCognitoConfig } from "./Config.js";
import { getUserApi } from "../../utils/apiConfig.js";
import { keyframes } from "@mui/system";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for password reset flow
  const [resetEmail, setResetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // Step: 1 (email), 2 (verification)
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const navigate = useNavigate();

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
      const response = await fetch(`${getUserApi()}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "User is not confirmed. Please confirm your email first.") {
          localStorage.setItem("email", email);
          navigate("/confirm");
          return;
        }
        throw new Error(data.error || "로그인에 실패했습니다.");
      }

      setSuccess("로그인에 성공했습니다!");
      setError("");

      const { accessToken, idToken } = data;
      localStorage.setItem("jwtToken", idToken);

      window.location.href = "/";
    } catch (error) {
      console.error("로그인 오류:", error);
      setError(error.message || "로그인 중 문제가 발생했습니다.");
    }
  };

  const handleOpenResetDialog = () => {
    setIsResetDialogOpen(true);
    setResetEmail("");
    setResetError("");
    setResetSuccess(false);
    setResetStep(1);
  };

  const handleCloseResetDialog = () => {
    setIsResetDialogOpen(false);
  };

  const handlePasswordReset = async () => {
    setResetError("");
    setResetSuccess(false);

    if (resetStep === 1) {
      // Step 1: Request password reset (send verification code)
      if (!resetEmail) {
        setResetError("이메일을 입력해주세요.");
        return;
      }

      try {
        const response = await fetch(`${getUserApi()}/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        });

        if (!response.ok) {
          throw new Error("비밀번호 재설정 이메일 전송에 실패했습니다.");
        }

        setResetSuccess(true); // Show success message
        setTimeout(() => {
          setResetStep(2); // Proceed to next step after showing the success message
          setResetSuccess(false); // Hide success message
       }, 1000);
      } catch (error) {
        console.error("비밀번호 재설정 오류:", error);
        setResetError(error.message || "비밀번호 재설정 중 문제가 발생했습니다.");
      }
    } else if (resetStep === 2) {
      // Step 2: Verify code and reset password
      if (!verificationCode || !newPassword) {
        setResetError("인증 코드와 새 비밀번호를 입력해주세요.");
        return;
      }

      try {
        const response = await fetch(`${getUserApi()}/confirm/password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail, confirmationCode: verificationCode, newPassword }),
        });

        if (!response.ok) {
          throw new Error("비밀번호 재설정에 실패했습니다.");
        }

        setResetSuccess(true); // Show success message
        setTimeout(() => {
          setIsResetDialogOpen(false); // Close dialog
          navigate("/login"); // Redirect to login page
        }, 1000); // 2 seconds delay to show the success message
      } catch (error) {
        console.error("비밀번호 재설정 오류:", error);
        setResetError(error.message || "비밀번호 재설정 중 문제가 발생했습니다.");
      }
    }
  };
  const verticalMove = keyframes`
  0%, 100% {
    transform: translateY(0); // 원래 위치
  }
  50% {
    transform: translateY(-50px); // 위로 50px 이동
  }
`;

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
          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button variant="text" onClick={handleOpenResetDialog}>
              비밀번호를 잊으셨나요?
            </Button>
          </Box>
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

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onClose={handleCloseResetDialog}>
        <DialogTitle>비밀번호 재설정</DialogTitle>
        <DialogContent
          sx={{
            width: "400px", // DialogContent의 너비를 설정
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {resetStep === 1 && (
            <>
              <TextField
                label="이메일"
                variant="outlined"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                sx={{
                  mt: 2,
                  width: "100%", // TextField가 DialogContent의 너비에 맞도록 설정
                  "& .MuiInputBase-input": {
                    
                    padding: "12px", // 입력창 패딩
                  },
                }}
              />
              {resetError && <Alert severity="error" sx={{ mt: 2 }}>{resetError}</Alert>}
              {resetSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  비밀번호 재설정 이메일이 발송되었습니다.
                </Alert>
              )}
            </>
          )}
          {resetStep === 2 && (
            <>
              <TextField
                label="인증 코드"
                variant="outlined"
                fullWidth
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                sx={{ mt: 2 }}
              />
              <TextField
                label="새 비밀번호"
                variant="outlined"
                fullWidth
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                sx={{ mt: 2 }}
              />
              {resetError && <Alert severity="error" sx={{ mt: 2 }}>{resetError}</Alert>}
              {resetSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  비밀번호가 성공적으로 재설정되었습니다.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>취소</Button>
          <Button onClick={handlePasswordReset} color="primary">
            {resetStep === 1 ? "전송" : "재설정"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Right Section */}
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
      animation: `${verticalMove} 2s infinite ease-in-out`,
    }}
  />
</Grid>
    </Grid>
  );
};

export default Login;
