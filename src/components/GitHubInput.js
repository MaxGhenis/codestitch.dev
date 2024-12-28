import React from 'react';

const GitHubInput = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="github-urls">GitHub URLs/Patterns</label>
      <textarea
        id="github-urls"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter GitHub URLs (one per line) or regex patterns (e.g. regex:.*\\.py$).\nExamples:\nhttps://github.com/owner/repo/blob/main/file.py\nhttps://github.com/owner/repo/pull/123\nregex:.*\\.py$`}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
    </div>
  );
};

export default GitHubInput;