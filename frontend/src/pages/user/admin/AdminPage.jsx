
import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";

import AdminFilePage from "./AdminFilePage.jsx";
import AdminDownloadPage from "./AdminDownloadPage.jsx";
import AdminUserPage from "./AdminUserPage.jsx";
import AdminDeletePage from "./AdminDeletePage";

const AdminPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container style={{ marginTop: "40px" }}>
      {/* Title */}
      <Box
        sx={{
          textAlign: "center",
          padding: "20px 0",
          backgroundColor: "#f5f5f5",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          style={{
            fontWeight: "bold",
            color: "black",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          관리자 페이지
        </Typography>
        <Typography
          variant="subtitle1"
          style={{
            fontSize: "16px",
            color: "#555",
          }}
        >
          시스템 관리 및 사용자 데이터를 제어할 수 있습니다
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab icon={<PersonIcon />} label="유저 관리" />
          <Tab icon={<InsertDriveFileIcon />} label="파일 관리" />
          <Tab icon={<CloudDownloadIcon />} label="다운로드 기록 관리" />
          <Tab icon={<DeleteIcon />} label="삭제 기록 관리" /> {/* 삭제 관리 탭 추가 */}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box style={{ marginTop: "20px" }}>
        {selectedTab === 0 && <AdminUserPage />}
        {selectedTab === 1 && <AdminFilePage />}
        {selectedTab === 2 && <AdminDownloadPage />}
        {selectedTab === 3 && <AdminDeletePage />}
      </Box>
    </Container>
  );
};

export default AdminPage;
