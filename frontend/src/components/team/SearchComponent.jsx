import {Box, Button, InputBase} from "@mui/material";
import React, {useState} from "react";

const SearchComponent = ({ onSearchChange, placeholderText, buttonVariant, buttonBackgroundColor }) => {

    const [searchTerm, setSearchTerm] = useState('');
    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };
  
    const handleSearch = () => {
      onSearchChange(searchTerm);
    };
  
    const handleKeyUp = (e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, width: '100%' }}>
            <InputBase
                placeholder={placeholderText}
                value={searchTerm}
                onChange = {handleInputChange}
                sx={{
                    width: '100%',
                    p: 1,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                }}
            />
            <Button
                variant={buttonVariant}
                onClick={handleSearch}
                onKeyUp={handleKeyUp}
                sx={{
                    fontSize: 'medium',
                    backgroundColor: {buttonBackgroundColor}
                }}
            >
                검색
            </Button>

        </Box>
    );
};

export default SearchComponent;