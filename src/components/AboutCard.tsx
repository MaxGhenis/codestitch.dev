import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function AboutCard() {
  return (
    <Card variant="outlined" sx={{ marginTop: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          About CodeStitch
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          CodeStitch helps you combine and filter content from GitHub:
        </Typography>
        <ul style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <li>Files, directories, PRs, issues</li>
          <li>Regex-based path and line filtering</li>
          <li>Include/exclude modes</li>
        </ul>
        <Typography variant="subtitle2" color="text.secondary">
          GitHub URL Examples:
        </Typography>
        <ul style={{ marginTop: 0 }}>
          <li><code>github.com/owner/repo/blob/branch/file.py</code></li>
          <li><code>github.com/owner/repo/tree/branch/dir</code></li>
          <li><code>regex:.*\\.py$</code></li>
          <li><code>github.com/owner/repo/pull/123</code></li>
          <li><code>github.com/owner/repo/issues/456</code></li>
        </ul>
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          Created by <a href="https://github.com/maxghenis" style={{ color: '#673ab7' }} target="_blank" rel="noreferrer">Max Ghenis</a>
          <br />
          Repo: <a href="https://github.com/maxghenis/codestitch.dev" style={{ color: '#673ab7' }} target="_blank" rel="noreferrer">codestitch.dev</a>
        </Typography>
      </CardContent>
    </Card>
  );
}