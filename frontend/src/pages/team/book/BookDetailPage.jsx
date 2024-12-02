import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Fab,
    Divider,
    Card,
    CardContent,
    CardMedia,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { useLocation, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import StudyCreationDialog from "../../../components/team/StudyCreationDialog.jsx";
import BookDescription from "./BookDescription"; // 추가한 컴포넌트 임포트

const BookDetailPage = () => {
    const theme = useTheme();
    const location = useLocation();
    const book = location.state.book; // 현재 책 데이터
    console.log(`${JSON.stringify(book)}`);
    const params = useParams();
    const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);

    // 추천 도서 목록 (더미 데이터)
    const recommendedBooks = [
        {
            id: 1,
            maintitle: "스프링 부트와 AWS로 혼자 구현하는 웹 서비스",
            authors: "이동욱",
            imgPath: "https://shopping-phinf.pstatic.net/main_3243625/32436253723.20230928091945.jpg",
        },
        {
            id: 2,
            maintitle: "자바 ORM 표준 JPA 프로그래밍",
            authors: "김영한",
            imgPath: "https://shopping-phinf.pstatic.net/main_3243600/32436007738.20221229072907.jpg",
        },
        {
            id: 3,
            maintitle: "Effective Java",
            authors: "Joshua Bloch",
            imgPath: "https://shopping-phinf.pstatic.net/main_3249133/32491337942.20221229071653.jpg",
        },
    ];

    const handleWriteButtonClick = () => {
        setIsStudyModalOpen(true);
    };

    const handleCloseStudyModal = () => {
        setIsStudyModalOpen(false);
    };

    return (
        <Box sx={{ padding: theme.spacing(3), maxWidth: "1400px", margin: "auto" }}>
            {/* 책 상세 정보 */}
            <Grid container spacing={4}>
                {/* 책 이미지 */}
                <Grid item xs={12} md={4}>
                    <Box
                        component="img"
                        src={book.imgPath}
                        alt={book.maintitle}
                        sx={{
                            width: "100%",
                            maxHeight: "700px",
                            height: "620px",
                            width:'442px',
                            objectFit: "contain", // 내용이 영역 안에 들어가도록
                            borderRadius: theme.spacing(1),
                            boxShadow: theme.shadows[2],
                            border: "1px solid #ddd",
                        }}
                    />
                </Grid>

                {/* 책 정보 */}
                <Grid item xs={12} md={8}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
    {book.maintitle}
</Typography>

{/* 부제목 (옵션: 부제목이 없을 경우 "부제 없음") */}
{book.subTitle && (
    <Typography variant="h6" color="textSecondary" gutterBottom>
        {book.subTitle || "부제 없음"}
    </Typography>
)}

{/* 저자 정보 (옵션: 저자 정보가 없을 경우 "저자 정보 없음") */}
<Typography variant="subtitle1" color="textSecondary" gutterBottom>
    {book.authors || "저자 정보 없음"}
</Typography>

{/* 구분선 */}
<Divider sx={{ my: 2 }} />

{/* 책 소개 */}
<Typography variant="h6" fontWeight="medium" gutterBottom>
    책 소개
</Typography>
<BookDescription description={book.description || ""} />
                    
                    {/* 추천 도서 섹션 */}
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        추천 도서
                    </Typography>
                    <Grid container spacing={2}>
                        {recommendedBooks.map((recBook) => (
                            <Grid item xs={12} sm={6} md={4} key={recBook.id}>
                                <Card
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        boxShadow: theme.shadows[2],
                                        padding: theme.spacing(2),
                                        "&:hover": { boxShadow: theme.shadows[4] },
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        sx={{ height: 140, objectFit: "cover" }}
                                        image={recBook.imgPath}
                                        alt={recBook.maintitle}
                                    />
                                    <CardContent sx={{ height: 90, objectFit: "cover" }}>
                                        <Typography variant="body1" fontWeight="bold" gutterBottom>
                                            {recBook.maintitle}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {recBook.authors}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            

            {/* 스터디 생성 버튼 */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: "fixed",
                    bottom: theme.spacing(4),
                    right: theme.spacing(4),
                    backgroundColor: theme.palette.secondary.main,
                    "&:hover": { backgroundColor: theme.palette.secondary.dark },
                }}
                onClick={handleWriteButtonClick}
            >
                <AddIcon />
            </Fab>

            {/* 스터디 생성 모달 */}
            <StudyCreationDialog
                open={isStudyModalOpen}
                onClose={handleCloseStudyModal}
                selectedTeamId={params.teamId}
                selectedBook={book}
            />
        </Box>
    );
};

export default BookDetailPage;
