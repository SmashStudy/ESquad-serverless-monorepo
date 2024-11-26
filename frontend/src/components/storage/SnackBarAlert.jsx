import React from 'react';
import {Snackbar, Alert} from '@mui/material';
import PropTypes from 'prop-types';

const SnackbarAlert = ({open, message, severity, onClose}) => {
  return (
      <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={onClose}
          anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      >
        <Alert variant="filled" onClose={onClose} severity={severity}
               sx={{width: '100%'}}>
          {message}
        </Alert>
      </Snackbar>
  );
};

SnackbarAlert.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(['success', 'info', 'warning', 'error']).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SnackbarAlert;
