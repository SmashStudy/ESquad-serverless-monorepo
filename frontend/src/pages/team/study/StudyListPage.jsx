import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SearchComponent from "../../../components/team/SearchComponent.jsx";
import LiveStreamWindow from "../../stream/LiveStreamWindow.jsx";
import axios from "axios";
import { getStudyList } from "../../../utils/team/studyApi.js";
import { getUserApi } from "../../../utils/apiConfig.js";
import { format } from "date-fns";

const StudyListPage = ({ isSmallScreen, isMediumScreen }) => {
  const theme = useTheme();
  const params = useParams();
  const navigate = useNavigate();
  const teamId = params.teamId;

  const [studys, setStudys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  // 스터디 리스트 데이터 가져오기
  useEffect(() => {
    const fetchStudyList = async () => {
      try {
        setLoading(true);
        const studyList = await getStudyList(encodeURIComponent(teamId));
        setStudys(studyList);
      } catch (err) {
        console.error("스터디 목록을 가져오는 중 에러 발생:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyList();
  }, [teamId]);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("jwtToken");

        if (!token) {
          throw new Error("로그인이 필요합니다.");
        }

        const response = await axios.get(`${getUserApi()}/get-user-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserInfo(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserInfo();
  }, []);

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e);
  };

  const filterStudiesByStatus = (status) => {
    const now = new Date();
    if (status === "전체") return studys;
    if (status === "진행중") {
      return studys.filter((study) => new Date(study.endDate) > now);
    }
    if (status === "종료") {
      return studys.filter((study) => new Date(study.endDate) <= now);
    }
    return studys;
  };

  const filteredStudies = filterStudiesByStatus(selectedFilter).filter((study) =>
    study.studyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Filters and Search */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          mb: 3,
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {["전체", "진행중", "종료"].map((filter) => (
            <Button
              key={filter}
              variant="text"
              aria-label={`${filter} 필터`}
              sx={{
                fontSize: "medium",
                fontWeight: "bold",
                borderBottom: selectedFilter === filter ? "3px solid" : "none",
                borderColor: theme.palette.primary.main,
                color:
                  selectedFilter === filter
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                "&:hover": { color: theme.palette.primary.dark },
              }}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </Button>
          ))}
        </Box>
        <SearchComponent
          onSearchChange={handleSearchChange}
          isSmallScreen={isSmallScreen}
          isMediumScreen={isMediumScreen}
          placeholderText="찾아보고픈 스터디가 있나요?"
        />
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 3,
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            스터디 데이터를 불러오는 중입니다...
          </Typography>
        </Box>
      ) : error ? (
        <Typography align="center" color="error" sx={{ mt: 3 }}>
          데이터를 가져오는 중 문제가 발생했습니다.
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ width: "100%", px: 2 }}>
          {filteredStudies.map((study) => (
            <Grid item xs={12} sm={6} md={4} key={study.PK}>
              <Card
                onClick={() =>
                  navigate(
                    `/teams/${encodeURIComponent(teamId)}/study/${encodeURIComponent(
                      study.PK
                    )}`,
                    { state: { study, teamId } }
                  )
                }
                sx={{
                  cursor: "pointer",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 2,
                  "&:hover": { boxShadow: theme.shadows[4] },
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {study.studyName}
                  </Typography>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <img
                      src={study.imgPath}
                      alt="Study"
                      style={{
                        maxWidth: "100%",
                        borderRadius: 8,
                        height: "20vh",
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {study.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color:
                        new Date(study.endDate) > new Date()
                          ? "success.main"
                          : "error.main",
                      fontWeight: "bold",
                    }}
                  >
                    {new Date(study.endDate) > new Date() ? "진행중" : "종료"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(
                      new Date(study.startDate),
                      "yyyy-MM-dd"
                    )} ~ {format(new Date(study.endDate), "yyyy-MM-dd")}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  {userInfo && (
                    <LiveStreamWindow
                      nickname={userInfo.nickname}
                      studyId={study.PK}
                    />
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          my: 3,
        }}
      >
        <Button variant="outlined" sx={{ mx: 1 }}>
          이전
        </Button>
        {[1, 2, 3, 4, 5].map((page) => (
          <Button key={page} variant="text" sx={{ mx: 1 }}>
            {page}
          </Button>
        ))}
        <Button variant="outlined" sx={{ mx: 1 }}>
          다음
        </Button>
      </Box>
    </>
  );
};

export default StudyListPage;
