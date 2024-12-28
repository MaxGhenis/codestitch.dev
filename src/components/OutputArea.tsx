import React from 'react';
import { Box, IconButton, Paper, Typography, Tooltip } from '@mui/material';
import { ContentCopy, Download } from '@mui/icons-material';
import { OutputAreaProps } from '../types';

const OutputArea: React.FC<OutputAreaProps> = ({
  stitchedContent,
  errorOccurred,
  onCopy,
  onDownload
}) => {
  if (!stitchedContent) return null;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        position: 'relative',
        backgroundColor: 'background.paper'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        position: 'sticky',
        top: 0,
        backgroundColor: 'background.paper',
        zIndex: 1,
        py: 1
      }}>
        <Typography variant="h6">
          Output
        </Typography>
        <Box>
          <Tooltip title="Copy to clipboard">
            <IconButton onClick={onCopy} size="small" sx={{ mr: 1 }}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download as Markdown">
            <IconButton onClick={onDownload} size="small">
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        className="code-scrollbar"
        sx={{
          maxHeight: '500px',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa',
          borderRadius: 1,
          p: 2,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
      >
        <pre>{stitchedContent}</pre>
      </Box>
    </Paper>
  );
};

export default OutputArea;