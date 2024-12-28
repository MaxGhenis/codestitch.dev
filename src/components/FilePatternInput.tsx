import React from 'react';
import { ComponentProps } from '../types';

const FilePatternInput: React.FC<ComponentProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="file-patterns">File Path Patterns</label>
      <textarea
        id="file-patterns"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Regex patterns for filtering files by path (one per line).\nExample:\n.*\\.py$\n.*\\.md$`}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
    </div>
  );
};

export default FilePatternInput;