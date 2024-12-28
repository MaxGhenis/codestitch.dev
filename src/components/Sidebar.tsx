import React from 'react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>About CodeStitch</h2>
      <p>
        CodeStitch helps you combine and filter content from GitHub:
      </p>
      <ul>
        <li>Files, directories, PRs, issues</li>
        <li>Regex-based path and line filtering</li>
        <li>Include/exclude modes</li>
      </ul>
      <h4>GitHub URL Examples</h4>
      <ul>
        <li>
          <code>github.com/owner/repo/blob/branch/file.py</code>
        </li>
        <li>
          <code>github.com/owner/repo/tree/branch/dir</code>
        </li>
        <li>
          <code>regex:.*\\.py$</code>
        </li>
        <li>
          <code>github.com/owner/repo/pull/123</code>
        </li>
        <li>
          <code>github.com/owner/repo/issues/456</code>
        </li>
      </ul>
      <p>
        Created by <a href="https://github.com/maxghenis" target="_blank" rel="noreferrer">Max Ghenis</a><br/>
        Repo: <a href="https://github.com/maxghenis/codestitch.dev" target="_blank" rel="noreferrer">codestitch.dev</a>
      </p>
    </div>
  );
};

export default Sidebar;