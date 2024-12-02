import React, { useState } from "react";
import { Typography, Button } from "@mui/material";

const BookDescription = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleDescription = () => {
        setIsExpanded((prev) => !prev);
    };

    const maxLength = 100;
    const isLongDescription = description.length > maxLength;

    return (
        <div>
            {/* 설명 텍스트 */}
            <Typography variant="body1" color="textSecondary" lineHeight={1.8}>
                {isLongDescription && !isExpanded
                    ? `${description.slice(0, maxLength)}...`
                    : description || "책 소개 정보가 없습니다."}
            </Typography>

            {/* 토글 버튼 */}
            {isLongDescription && (
                <Button
                    variant="text"
                    size="small"
                    color="primary"
                    onClick={toggleDescription}
                    sx={{ marginTop: 1 }}
                >
                    {isExpanded ? "접기" : "더보기"}
                </Button>
            )}
        </div>
    );
};

export default BookDescription;
