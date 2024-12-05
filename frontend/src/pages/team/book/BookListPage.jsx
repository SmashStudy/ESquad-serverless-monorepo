import React, { useEffect, useState } from "react";
import {
    AppBar,
    Box,
    Button,
    Toolbar,
    Typography,
    Card,
    CardContent,
    Grid,
    CardMedia,
    Pagination,
    Container,
    TextField,
} from "@mui/material";
import { useTheme, styled } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {searchBooks} from "../../../utils/team/bookApi.js";

// 날짜 포맷 함수
const formatDate = (dateStr) => {
    if (!dateStr) return "날짜 미상";
    return `${dateStr.slice(0, 4)}년 ${dateStr.slice(4, 6)}월 ${dateStr.slice(6, 8)}일`;
};

// 부제목 추출 함수
const extractSubtitle = (title) => {
    if (!title) return { maintitle: "제목 없음", subtitle: "부제 없음" };

    const bracketMatch = title.match(/\((.*?)\)/);
    if (bracketMatch) {
        return { maintitle: title.replace(bracketMatch[0], "").trim(), subtitle: bracketMatch[1] };
    }

    const colonIndex = title.indexOf(":");
    if (colonIndex !== -1) {
        return { maintitle: title.slice(0, colonIndex).trim(), subtitle: title.slice(colonIndex + 1).trim() };
    }

    return { maintitle: title, subtitle: "부제 없음" };
};

// 도서 데이터 매핑 함수
const mapBooks = (books) =>
    books.map((book) => {
        const { maintitle, subtitle } = extractSubtitle(book.title);
        return {
            maintitle,
            subtitle,
            authors: book.authors ? book.authors.join(", ") : "저자 미상",
            publisher: book.publisher || "출판사 미상",
            publishedDate: formatDate(book.publishedDate),
            imgPath: book.imgPath || "이미지 없음",
            isbn: book.isbn || "ISBN 없음",
            description: book.description
                ? book.description.replace(/<[^>]*>/g, "")
                : "설명 없음",
        };
    });

// 포인트 색상 (보라색 강조)
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.shadows[3],
}));

const BookListPage = () => {
    const theme = useTheme();
    const params = useParams();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedBooks = books.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(books.length / itemsPerPage);

    // 검색 실행 함수
    const executeSearch = async () => {
        if (!query.trim()) return; // 검색어가 비어있으면 실행하지 않음
        setLoading(true);
        try {
            const books = await searchBooks(query);
            const mappedBooks = mapBooks(books);
            setBooks(mappedBooks);
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <Box sx={{ height: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* 헤더 */}
            <StyledAppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        도서 검색
                    </Typography>
                    <TextField
                        variant="outlined"
                        placeholder="검색어를 입력하세요"
                        size="small"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && executeSearch()}
                        sx={{
                            marginRight: 2,
                            backgroundColor: "white",
                            borderRadius: 1,
                            width: "300px",
                        }}
                    />
                    <Button variant="contained" onClick={executeSearch}>
                        검색
                    </Button>
                </Toolbar>
            </StyledAppBar>

            {/* 본문 */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 2,
                    backgroundColor: theme.palette.background.default,
                }}
            >
                {loading ? (
                    <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                        로딩 중...
                    </Typography>
                ) : (
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >
                        {paginatedBooks.map((book, index) => (
                            <Grid item key={index}>
                                <Card
                                    onClick={() =>
                                        navigate(`/teams/${params.teamId}/book/${book.isbn}`, {
                                            state: { book },
                                        })
                                    }
                                    sx={{
                                        width: 250,
                                        height: 325,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        boxShadow: 3,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        transition: "transform 0.2s ease-in-out",
                                        "&:hover": {
                                            transform: "scale(1.02)",
                                            boxShadow: 5,
                                        },
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={book.imgPath}
                                        alt={book.maintitle}
                                        sx={{ height: 180, objectFit: "cover" }}
                                    />
                                    <CardContent sx={{ padding: 2, flexGrow: 1 }}>
                                        <Typography variant="h6" component="div" fontWeight="bold" gutterBottom>
                                            {book.maintitle}
                                        </Typography>
                                        {book.subtitle !== "부제 없음" && (
                                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                {book.subtitle}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" color="text.secondary">
                                            저자: {book.authors}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            출판사: {book.publisher}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* 푸터 */}
            <Box
                sx={{
                    width: "100%",
                    backgroundColor: theme.palette.background.paper,
                    padding: 2,
                    boxShadow: 3,
                }}
            >
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{ display: "flex", justifyContent: "center" }}
                />
            </Box>
        </Box>
    );
};

export default BookListPage;
