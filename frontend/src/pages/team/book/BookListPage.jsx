import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    Grid,
    Fab,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material';
import SearchComponent from "../../components/team/SearchComponent.jsx";
import AddIcon from "@mui/icons-material/Add";
import StudyCreatgionDialog from "../../components/team/StudyCreationDialog.jsx";
import {useNavigate, useParams} from "react-router-dom";

const BookListPage = ({ isSmallScreen, isMediumScreen }) => {
    const theme = useTheme();
    const params = useParams();
    const navigate = useNavigate();
    const [books, setBooks] = useState([
        {"id": 2, "isbn": '8012231', "title": '노인과 바다1', "writer": "kelin Macrke", "description": "책에 대한 소개소개소개소개소개소개소개소개", "publish": '샘샘', "src": "/src/assets/book-profile-man-and-sea.jpg"},
        {"id": 7, "isbn": '46821', "title": '노인과 바다2', "writer": "kelin Macrke", "description": "책에 대한 소개소개소개소개소개소개소개소개", "publish": '샘샘', "src": "/src/assets/book-profile-man-and-sea.jpg"},
        {"id": 94, "isbn": '5838', "title": '노인과 바다3', "writer": "kelin Macrke", "description": "책에 대한 소개소개소개소개소개소개소개소개", "publish": '샘샘', "src": "/src/assets/book-profile-man-and-sea.jpg"},
        {"id": 22, "isbn": '3dl328', "title": '노인과 바다4', "writer": "kelin Macrke", "description": "책에 대한 소개소개소개소개소개소개소개소개", "publish": '샘샘', "src": "/src/assets/book-profile-man-and-sea.jpg"},
        {"id": 19, "isbn": '855e25f23', "title": '노인과 바다5', "writer": "kelin Macrke", "description": "책에 대한 소개소개소개소개소개소개소개소개", "publish": '샘샘', "src": "/src/assets/book-profile-man-and-sea.jpg"},
        {"id": 127, "isbn": 'd55425d58', "title": '노인과 바다6', "writer": "kelin Macrke", "description": "책에 대한 소개소개소개소개소개소개소개소개", "publish": '샘샘', "src": "/src/assets/book-profile-man-and-sea.jpg"},
        {"id": 76, "isbn": '89432d1d8', "title": '노인과 바다7', "writer": "kelin Macrke", "description": "책에 대한 소개소개소개소개소개소개소개소개", "publish": '샘샘', "src": "/src/assets/book-profile-man-and-sea.jpg"},
        {"id": 99, "isbn": '052545', "title": '노인과 바다8', "writer": "kelin Macrke", "description": "책에 대한 소개소개소개소개소개소개소개소개", "publish": '샘샘', "src": "/src/assets/book-profile-man-and-sea.jpg"},
    ])
    const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);

    const handleWriteButtonClick = () => {
        setIsStudyModalOpen(true);
    };

    const handleCloseStudyModal = () => {
        setIsStudyModalOpen(false);
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 3,
                    gap: 2,
                }}
            >
                <SearchComponent
                    isMediumScreen={isMediumScreen}
                    isSmallScreen={isSmallScreen}
                    buttonVariant="contained"
                    placeholderText='새로운 스터디를 열 도서를 검색해보세요'
                    buttonBackgroundColor={theme.palette.primary.main}
                />
            </Box>

            {/* Posts List as Cards in a Grid */}
            <Grid container spacing={3} sx={{ width: '100%', pr: 2 }}>
                {books.map((book, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            button
                            onClick={() =>
                                navigate(`/teams/${params.teamId}/book/search/${book.id}`, {
                                    state: { book }
                                })
                            }
                            sx={{
                                cursor: 'pointer',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <CardContent sx={{ height: '80%' }}>
                                <Box
                                    component="img"
                                    src="/src/assets/book-profile-man-and-sea.jpg"
                                    alt="Book Cover"
                                    sx={{
                                        border: '1px solid',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'fit',
                                        mb: 2,
                                    }}
                                />
                                <Typography variant="h6" fontWeight="bold">
                                    {book.title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {book.writer}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
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

            {/* Floating Button for Team Study Creation */}
            <Fab
                color={theme.palette.secondary.main}
                aria-label="add"
                sx={{
                    position: 'absolute',// Changed to absolute to make Fab relative to parent Box
                    bottom: 16,
                    right: 16,
                }}
                onClick={handleWriteButtonClick}
            >
                <AddIcon />
            </Fab>

            {/* Post Creation Modal */}
            <StudyCreatgionDialog open={isStudyModalOpen} onClose={handleCloseStudyModal} />
        </>
    );
};

export default BookListPage;
