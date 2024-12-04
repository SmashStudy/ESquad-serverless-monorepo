import React from "react";
import {Box, CircularProgress, Typography, useTheme} from "@mui/material";

const Loading = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                textAlign: "center",
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <img
                src="https://s3-esquad-public.s3.us-east-1.amazonaws.com/esquad-logo-nbk.png"
                alt="Loading"
                style={{ width: "100px", height: "100px", marginBottom: "16px" }}
            />
            <CircularProgress
                sx={{
                    color: theme.palette.primary.main, // Customize spinner color
                    marginBottom: "16px",
                }}
            />
            <Typography variant="h6" sx={{ color: theme.palette.primary.light }}>
                불러오는 중입니다..
            </Typography>
        </Box>
    );
};

export default Loading;
