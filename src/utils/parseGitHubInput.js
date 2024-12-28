// A simple approach that tries to replicate the Python parse logic

export function parseGitHubInput(line) {
    // Check for 'regex:' prefix
    if (line.startsWith('regex:')) {
      const pattern = line.slice('regex:'.length).trim();
      return { inputType: 'regex', repoName: null, extraInfo: pattern };
    }
  
    // Normalize if needed
    let url = line;
    if (url.startsWith('github.com/')) {
      url = 'https://' + url;
    }
  
    // Basic regex to match "github.com/owner/repo"
    const repoRegex = /^(?:https?:\/\/)?github\.com\/([^/]+\/[^/]+)/;
    const matchRepo = url.match(repoRegex);
    if (!matchRepo) {
      return { inputType: null, repoName: null, extraInfo: null };
    }
  
    const repoName = matchRepo[1];
    const remaining = url.slice(matchRepo[0].length);
  
    // Check for patterns
    // e.g. /pull/123, /issues/456, /tree/branch/path, /blob/branch/path
    if (!remaining || remaining === '/') {
      return { inputType: 'repo', repoName, extraInfo: null };
    }
    if (remaining.startsWith('/pull/')) {
      const prNumber = remaining.replace('/pull/', '').replace('/', '');
      return { inputType: 'pr', repoName, extraInfo: prNumber };
    }
    if (remaining.startsWith('/issues/')) {
      const issueNumber = remaining.replace('/issues/', '').replace('/', '');
      return { inputType: 'issue', repoName, extraInfo: issueNumber };
    }
    if (remaining.startsWith('/tree/')) {
      const treePart = remaining.slice('/tree/'.length);
      const [branch, ...rest] = treePart.split('/');
      const path = rest.join('/');
      return { inputType: 'content', repoName, extraInfo: { branch, path } };
    }
    if (remaining.startsWith('/blob/')) {
      const blobPart = remaining.slice('/blob/'.length);
      const [branch, ...rest] = blobPart.split('/');
      const path = rest.join('/');
      return { inputType: 'file', repoName, extraInfo: { branch, path } };
    }
  
    // Default
    return { inputType: null, repoName: null, extraInfo: null };
  }