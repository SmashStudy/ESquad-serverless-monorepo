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

const RequestPasswordReset = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${getUserApi()}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send password reset email.");
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
              비밀번호 찾기
            </Typography>
            <form onSubmit={handleRequestCode}>
              <TextField
                label="이메일 주소"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                인증 코드 요청
              </Button>
            </form>
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                이메일로 인증 코드가 전송되었습니다.
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

export default RequestPasswordReset;
