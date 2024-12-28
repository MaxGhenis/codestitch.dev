import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function AdvancedFilters({
  filePatterns,
  setFilePatterns,
  fileFilterMode,
  setFileFilterMode,
  linePatterns,
  setLinePatterns,
  lineFilterMode,
  setLineFilterMode
}) {
  return (
    <Accordion sx={{ marginTop: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Advanced Filtering Options
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary">
          You can filter which files and lines are included by regex. 
          For example, <code>.*\\.py$</code> for Python files, or 
          <code>TODO:</code> for lines containing TODO.
        </Typography>
        {/* File patterns */}
        <TextField
          label="File Path Patterns"
          placeholder="Example:\n.*\\.py$\n.*\\.md$"
          multiline
          minRows={2}
          fullWidth
          value={filePatterns}
          onChange={(e) => setFilePatterns(e.target.value)}
          sx={{ marginTop: 2 }}
        />
        <FormControl fullWidth sx={{ marginTop: 1 }}>
          <InputLabel>File Filter Mode</InputLabel>
          <Select
            value={fileFilterMode}
            label="File Filter Mode"
            onChange={(e) => setFileFilterMode(e.target.value)}
          >
            <MenuItem value="Include matching files">Include matching files</MenuItem>
            <MenuItem value="Exclude matching files">Exclude matching files</MenuItem>
          </Select>
        </FormControl>

        {/* Line patterns */}
        <TextField
          label="Line Content Patterns"
          placeholder="Example:\nTODO:\nFIXME:"
          multiline
          minRows={2}
          fullWidth
          value={linePatterns}
          onChange={(e) => setLinePatterns(e.target.value)}
          sx={{ marginTop: 3 }}
        />
        <FormControl fullWidth sx={{ marginTop: 1 }}>
          <InputLabel>Line Filter Mode</InputLabel>
          <Select
            value={lineFilterMode}
            label="Line Filter Mode"
            onChange={(e) => setLineFilterMode(e.target.value)}
          >
            <MenuItem value="Include matching lines">Include matching lines</MenuItem>
            <MenuItem value="Exclude matching lines">Exclude matching lines</MenuItem>
          </Select>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );
}