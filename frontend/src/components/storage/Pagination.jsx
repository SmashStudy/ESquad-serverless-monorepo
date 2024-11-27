import React from 'react';
import {Box, Button} from '@mui/material';
import PropTypes from 'prop-types';

const Pagination = ({currentPage, totalPages, onPageChange}) => {
  return (
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
        >
          이전
        </Button>
        <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
        >
          다음
        </Button>
      </Box>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
