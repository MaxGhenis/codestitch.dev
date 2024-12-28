// src/components/LinePatternInput.tsx
import React from 'react';
import { ComponentProps } from '../types';

const LinePatternInput: React.FC<ComponentProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="line-patterns">Line Content Patterns</label>
      <textarea
        id="line-patterns"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Regex patterns for filtering lines by content (one per line).\nExample:\nTODO:\nFIXME:`}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
    </div>
  );
};

export default LinePatternInput;