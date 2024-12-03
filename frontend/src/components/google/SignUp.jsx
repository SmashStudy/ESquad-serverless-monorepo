import React, { useState } from "react";
import { Box, Button, Typography, Grid, TextField, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {getUserApi} from "../../utils/apiConfig.js";
import { keyframes } from "@mui/system";

const API_URL = "https://jg3x4yqtfb.execute-api.us-east-1.amazonaws.com/local";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false); // 인증 단계 확인
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { name, nickname, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`${getUserApi()}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, nickname, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message && data.message.includes("Nickname is already taken")) {
          throw new Error("이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.");
        }
        throw new Error(data.error || "회원가입에 실패했습니다.");
      }

      setSuccess("회원가입이 성공적으로 완료되었습니다! 이메일 인증 코드를 확인하세요.");
      setError("");
      setIsVerificationStep(true); // 인증 단계로 이동
    } catch (error) {
      setError(error.message || "회원가입 중 문제가 발생했습니다.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const { email } = formData;

    if (!verificationCode) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${getUserApi()}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "인증에 실패했습니다.");
      }

      setSuccess("이메일 인증이 완료되었습니다! 로그인 페이지로 이동합니다.");
      setError("");

      // 인증 완료 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(error.message || "인증 중 문제가 발생했습니다.");
    }
  };

  const verticalMove = keyframes`
  0%, 100% {
    transform: translateY(0); // 원래 위치
  }
  50% {
    transform: translateY(-50px); // 위로 50px 이동
  }`;

  return (
    <Grid
      container
      sx={{
        height: "100vh",
        backgroundImage: "linear-gradient(to top right, #E2A9F3, #5858FA)", // 전체 배경
      }}
    >
      {/* 왼쪽 섹션 */}
      <Grid
        item
        xs={12}
        lg={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
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
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "50%",
          }}
        />
      </Grid>

      {/* 오른쪽 섹션 */}
      <Grid
        item
        xs={12}
        lg={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          {/* 회원가입 또는 인증 로직 */}
          {isVerificationStep ? (
            <>
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
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
                <Button type="submit" variant="contained" color="primary">
                  인증 완료
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                회원가입
              </Typography>
              <Box
                component="form"
                onSubmit={handleSignUp}
                sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="이메일"
                  value={formData.email}
                  onChange={handleChange("email")}
                  required
                />
                <TextField
                  label="비밀번호"
                  type="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  required
                />
                <TextField
                  label="비밀번호 확인"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  required
                />
                <TextField
                  label="이름"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                />
                <TextField
                  label="닉네임"
                  value={formData.nickname}
                  onChange={handleChange("nickname")}
                  required
                />
                <Button type="submit" variant="contained" color="primary">
                  회원가입
                </Button>
              </Box>
            </>
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Typography sx={{ mt: 2 }}>
            이미 계정이 있으신가요?{" "}
            <Button variant="text" onClick={() => navigate("/login")}>
              로그인
            </Button>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default SignUp;
