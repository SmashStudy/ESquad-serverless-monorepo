import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { getUserApi } from "../../utils/apiConfig";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getUserApi()}/admin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filteredUsers = users.filter((user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUsers(filteredUsers);
  };

  const handleReset = () => {
    setSearchTerm("");
    fetchUsers();
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedUsers = [...users].sort((a, b) => {
      if (key === "lastLogin" || key === "creationDate") {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setUsers(sortedUsers);
    setSortConfig({ key, direction });
  };

  const handleStatusChange = async (email, action) => {
    try {
      const response = await fetch(`${getUserApi()}/admin/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const data = await response.json();
      console.log(data.message);
      fetchUsers(); // 상태 변경 후 사용자 목록 갱신
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  if (loading) {
    return (
      <Container style={{ textAlign: "center", marginTop: "20%" }}>
        <CircularProgress style={{ marginBottom: "20px" }} />
        <Typography variant="h6">사용자 정보를 불러오는 중입니다...</Typography>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: "40px" }}>
      {/* 제목 */}
      <Typography
        variant="h4"
        gutterBottom
        style={{
          fontWeight: "initial",
          color: "black",
          textAlign: "center",
          marginBottom: "30px",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
        }}
      >
        관리자 페이지
      </Typography>

      {/* 총 사용자 수 */}
      <Typography
        variant="subtitle1"
        gutterBottom
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          textAlign: "center",
          color: "#444",
          marginBottom: "20px",
        }}
      >
        총 사용자: <span style={{ color: "#1976d2" }}>{totalUsers}명</span>
      </Typography>

      {/* 검색 및 초기화 */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        style={{ marginBottom: "20px" }}
      >
        <TextField
          label="검색 (이메일)"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, marginRight: "10px" }}
        />
        <IconButton onClick={handleSearch} color="primary">
          <Tooltip title="검색">
            <SearchIcon />
          </Tooltip>
        </IconButton>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          style={{
            borderColor: "#1976d2",
            color: "#1976d2",
          }}
        >
          초기화
        </Button>
      </Box>

      {/* 사용자 목록 테이블 */}
      <TableContainer
        component={Paper}
        style={{
          maxHeight: "600px",
          overflowY: "auto",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>
                <strong>이메일</strong> <SortIcon />
              </TableCell>
              <TableCell onClick={() => handleSort("accountStatus")} style={{ cursor: "pointer" }}>
                <strong>계정 상태</strong> <SortIcon />
              </TableCell>
              <TableCell onClick={() => handleSort("creationDate")} style={{ cursor: "pointer" }}>
                <strong>가입 일자</strong> <SortIcon />
              </TableCell>
              <TableCell onClick={() => handleSort("lastLogin")} style={{ cursor: "pointer" }}>
                <strong>마지막 업데이트</strong> <SortIcon />
              </TableCell>
              <TableCell>
                <strong>작업</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.email}</TableCell>
                {/* 계정 상태별 색상 표시 */}
                <TableCell>
                  <Chip
                    label={user.accountStatus}
                    style={{
                      backgroundColor: user.accountStatus === "활성화됨" ? "green" : "red",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                </TableCell>
                <TableCell>
                  {user.creationDate
                    ? new Date(user.creationDate).toLocaleString()
                    : "기록 없음"}
                </TableCell>
                <TableCell>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "기록 없음"}
                </TableCell>
                {/* 활성화/비활성화 버튼 */}
                <TableCell>
                  {user.accountStatus === "활성화됨" ? (
                    <Tooltip title="비활성화">
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<RemoveCircleIcon />}
                        onClick={() => handleStatusChange(user.email, "disable")}
                      >
                        비활성화
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip title="활성화">
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PersonAddAltIcon />}
                        onClick={() => handleStatusChange(user.email, "enable")}
                      >
                        활성화
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminPage;
