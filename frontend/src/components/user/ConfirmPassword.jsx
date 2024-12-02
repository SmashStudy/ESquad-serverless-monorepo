import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { getUserApi } from "../../utils/apiConfig";


const ConfirmPassword = () => {
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${getUserApi()}/confirm/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, confirmationCode, newPassword }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid item xs={12} lg={6} sx={{ backgroundColor: "grey.100" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: 4,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 400,
              textAlign: "center",
              padding: 4,
              border: "1px solid grey.300",
              borderRadius: 2,
              backgroundColor: "white",
              boxShadow: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              비밀번호 재설정
            </Typography>
            <form onSubmit={handlePasswordReset}>
              <TextField
                label="이메일 주소"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ my: 2 }}
              />
              <TextField
                label="인증 코드"
                variant="outlined"
                fullWidth
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required
                sx={{ my: 2 }}
              />
              <TextField
                label="새 비밀번호"
                variant="outlined"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                sx={{ my: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1.5 }}
              >
                비밀번호 재설정
              </Button>
            </form>
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                비밀번호가 성공적으로 변경되었습니다.
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ConfirmPassword;
