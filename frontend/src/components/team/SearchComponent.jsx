import {Box, Button, InputBase, useTheme} from "@mui/material";
import React, {useState} from "react";

const SearchComponent = ({ isSmallScreen, isMediumScreen , placeholderText, buttonVariant, buttonBackgroundColor}) => {
    const theme = useTheme();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [showPostDetails, setShowPostDetails] = useState(false);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, width: '90%' }}>
            <InputBase
                placeholder={placeholderText}
                sx={{
                    width: '100%',
                    p: 1,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                }}
            />
            <Button variant={buttonVariant} sx={{ fontSize: 'medium', backgroundColor: {buttonBackgroundColor} }}>검색</Button>
        </Box>
    );
};

export default SearchComponent;