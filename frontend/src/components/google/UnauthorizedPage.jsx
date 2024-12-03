import React from "react";
import { Typography, Container, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Container style={{ textAlign: "center", marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom>
        접근 금지
      </Typography>
      <Typography variant="body1" gutterBottom>
        이 페이지에 접근할 권한이 없습니다.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
      >
        홈으로 이동
      </Button>
    </Container>
  );
};

export default UnauthorizedPage;
