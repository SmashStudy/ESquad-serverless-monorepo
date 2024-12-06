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
import { getUserApi } from "../../../utils/apiConfig.js";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchUsers();
  }, []);

  // 사용자 목록 가져오기
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

      // isAdmin 필드 설정
      const updatedUsers = data.users.map((user) => ({
        ...user,
        isAdmin: user.groups && user.groups.includes("admin"), // "admin" 그룹 확인
      }));

      setUsers(updatedUsers);
      setTotalUsers(data.totalUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  // 검색 기능
  const handleSearch = () => {
    const filteredUsers = users.filter((user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUsers(filteredUsers);
  };

  // 초기화 버튼
  const handleReset = () => {
    setSearchTerm("");
    fetchUsers();
  };

  // 정렬 기능
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

  // 활성화/비활성화 API 호출
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

      console.log("Status updated successfully");
      fetchUsers(); // 상태 변경 후 사용자 목록 갱신
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };
  

  // 그룹 추가/제거 API 호출
  const handleAdminGroupChange = async (email, action) => {
    try {
      const endpoint =
        action === "add"
          ? `${getUserApi()}/admin/group/add`
          : `${getUserApi()}/admin/group/remove`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating admin group:", errorData.message || "Unknown error");
        throw new Error(`Failed to ${action === "add" ? "add" : "remove"} admin group`);
      }

      console.log("Admin group change successful");
      fetchUsers(); // 상태 변경 후 사용자 목록 갱신
    } catch (error) {
      console.error(`Error updating admin group: ${error.message}`);
    }
  };

  // if (loading) {
  //   return (
  //     <Container style={{ textAlign: "center", marginTop: "20%" }}>
  //       <CircularProgress style={{ marginBottom: "20px" }} />
  //       <Typography variant="h6">사용자 정보를 불러오는 중입니다...</Typography>
  //     </Container>
  //   );
  // }

  return (
    <Container style={{ marginTop: "20px" }}>
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
                <strong>관리자 추가/해제</strong>
              </TableCell>
              <TableCell>
                <strong>활성화/비활성화</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.email}</TableCell>
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
                <TableCell>
                  {user.isAdmin ? (
                    <Tooltip title="관리자 해제">
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<RemoveCircleIcon />}
                        onClick={() => handleAdminGroupChange(user.email, "remove")}
                      >
                        해제
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip title="관리자 추가">
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PersonAddAltIcon />}
                        onClick={() => handleAdminGroupChange(user.email, "add")}
                      >
                        추가
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
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

export default AdminUserPage;
