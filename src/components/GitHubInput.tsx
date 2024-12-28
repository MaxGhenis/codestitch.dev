import React from 'react';
import { TextField } from '@mui/material';
import { ComponentProps } from '../types';

const GitHubInput: React.FC<ComponentProps> = ({ value, onChange }) => {
  return (
    <TextField
      label="GitHub URLs/Patterns"
      multiline
      minRows={3}
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter GitHub URLs or regex:.*\\.py$\nOne per line.\nExamples:\ngithub.com/owner/repo/blob/main/file.py\nregex:.*\\.py$`}
      sx={{ marginTop: 2 }}
    />
  );
};

export default GitHubInput;