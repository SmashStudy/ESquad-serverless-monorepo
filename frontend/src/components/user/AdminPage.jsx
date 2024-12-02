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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";
import { getUserApi } from "../../utils/apiConfig";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
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

    fetchUsers();
  }, []);

  const handleSearch = () => {
    const filteredUsers = users.filter((user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUsers(filteredUsers);
  };

  const handleReset = () => {
    setSearchTerm("");
    setLoading(true);
    setUsers([]);
    setTotalUsers(0);
    const fetchUsers = async () => {
      try {
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

    fetchUsers();
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedUsers = [...users].sort((a, b) => {
      if (key === "lastLogin") {
        const dateA = new Date(a.lastLogin);
        const dateB = new Date(b.lastLogin);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setUsers(sortedUsers);
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress style={{ marginTop: "20px" }} />
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: "20px" }}>
      {/* 제목 */}
      <Typography
        variant="h3"
        gutterBottom
        style={{
          fontWeight: "bold",
          color: "#1976d2",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        관리자 페이지
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
          <SearchIcon />
        </IconButton>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
        >
          초기화
        </Button>
      </Box>

      {/* 총 사용자 수 */}
      <Typography
        variant="subtitle1"
        gutterBottom
        style={{ fontSize: "16px", color: "#555" }}
      >
        총 사용자: <strong>{totalUsers}명</strong>
      </Typography>

      {/* 사용자 목록 테이블 */}
      <TableContainer
        component={Paper}
        style={{
          maxHeight: "600px", // 테이블의 최대 높이 설정
          overflowY: "auto", // 스크롤 추가
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
              <TableCell onClick={() => handleSort("lastLogin")} style={{ cursor: "pointer" }}>
                <strong>마지막 로그인</strong> <SortIcon />
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
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "기록 없음"}
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
