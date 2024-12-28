import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { OutputAreaProps } from '../types';

const OutputArea: React.FC<OutputAreaProps> = ({
  stitchedContent,
  errorOccurred,
  onCopy,
  onDownload
}) => {
  if (!stitchedContent) return null;

  return (
    <Box sx={{ marginTop: 3 }}>
      {errorOccurred ? (
        <Typography variant="body1" color="warning.main" sx={{ marginBottom: 1 }}>
          ⚠️ Some errors occurred while fetching content. Please check the output below.
        </Typography>
      ) : (
        <Typography variant="body1" color="success.main" sx={{ marginBottom: 1 }}>
          ✅ Content stitched successfully!
        </Typography>
      )}

      <Typography variant="h6" sx={{ marginBottom: 1 }}>
        Stitched Content:
      </Typography>

      <Box
        sx={{
          position: 'relative',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#fff',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '1rem'
        }}
      >
        <pre className="stitched-content">{stitchedContent}</pre>
        <Button
          variant="outlined"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
          onClick={onCopy}
        >
          Copy
        </Button>
      </Box>

      <Button
        variant="contained"
        color="success"
        sx={{ marginTop: 2 }}
        onClick={onDownload}
      >
        💾 Download Stitched Content
      </Button>
    </Box>
  );
};

export default OutputArea;