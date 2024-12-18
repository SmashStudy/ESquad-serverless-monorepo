import * as React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

function LinearProgressWithLabel(props) {
  return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '50%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} sx= {{
            height: 8,
            borderRadius: 5
          }}
          />
        </Box>
        <Box sx={{ minWidth: 35}}>
          <Typography variant="body2" color="text.secondary"
          sx = {{fontWeight: 'bold'}}>{`${Math.round(
              props.value,
          )}%`}</Typography>
        </Box>
      </Box>
  );
}

export default LinearProgressWithLabel;
