export function parseGitHubInput(line: string): {
  inputType: string | null;
  repoName: string | null;
  extraInfo: string | { branch: string; path: string } | null;
} {
  if (line.startsWith('regex:')) {
    const pattern = line.slice('regex:'.length).trim();
    return { inputType: 'regex', repoName: null, extraInfo: pattern };
  }

  let url = line.trim();
  if (url.startsWith('github.com/')) {
    url = 'https://' + url;
  }

  // Match repository with optional version/branch path
  const repoRegex = /^(?:https?:\/\/)?github\.com\/([^/]+\/[^/]+)(?:\/([^/]+)\/([^/]+)(?:\/(.+))?)?/;
  const match = url.match(repoRegex);
  
  if (!match) {
    return { inputType: null, repoName: null, extraInfo: null };
  }

  const [, repoName, type, branch, path] = match;
  const cleanRepoName = repoName.replace(/\.git$/, '');

  // Handle different URL types
  switch (type) {
    case 'pull':
      return { 
        inputType: 'pr', 
        repoName: cleanRepoName, 
        extraInfo: branch // PR number
      };
      
    case 'issues':
      return { 
        inputType: 'issue', 
        repoName: cleanRepoName, 
        extraInfo: branch // Issue number
      };
      
    case 'tree':
    case 'blob': {
      // Handle cases where branch contains slashes
      const fullPath = path ? `${path}` : '';
      return {
        inputType: type === 'tree' ? 'content' : 'file',
        repoName: cleanRepoName,
        extraInfo: {
          branch: branch,
          path: fullPath
        }
      };
    }
      
    default:
      if (!type) {
        return { 
          inputType: 'repo', 
          repoName: cleanRepoName, 
          extraInfo: null 
        };
      }
      return { inputType: null, repoName: null, extraInfo: null };
  }
}