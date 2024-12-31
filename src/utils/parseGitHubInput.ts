interface ParseResult {
  inputType: string | null;
  repoName: string | null;
  extraInfo: string | { branch: string; path: string } | null;
}

export function parseGitHubInput(line: string): ParseResult {
  if (line.startsWith('regex:')) {
    const pattern = line.slice('regex:'.length).trim();
    return { inputType: 'regex', repoName: null, extraInfo: pattern };
  }

  let url = line.trim();
  if (url.startsWith('github.com/')) {
    url = 'https://' + url;
  }

  const repoRegex = /^(?:https?:\/\/)?github\.com\/([^/]+\/[^/]+)/;
  const matchRepo = url.match(repoRegex);
  if (!matchRepo) {
    return { inputType: null, repoName: null, extraInfo: null };
  }

  const repoName = matchRepo[1].replace(/\.git$/, '');
  const remaining = url.slice(matchRepo[0].length);

  if (!remaining || remaining === '/') {
    return { inputType: 'repo', repoName, extraInfo: null };
  }

  const decodeBranchAndPath = (input: string): { branch: string; path: string } => {
    const potentialPathIndex = input.indexOf('/', input.indexOf('/') + 1);
    if (potentialPathIndex === -1) {
      return {
        branch: decodeURIComponent(input),
        path: ''
      };
    }
    
    const branch = decodeURIComponent(input.substring(0, potentialPathIndex));
    const path = input.substring(potentialPathIndex + 1);
    return { branch, path };
  };

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
    const { branch, path } = decodeBranchAndPath(treePart);
    return { inputType: 'content', repoName, extraInfo: { branch, path } };
  }
  if (remaining.startsWith('/blob/')) {
    const blobPart = remaining.slice('/blob/'.length);
    const { branch, path } = decodeBranchAndPath(blobPart);
    return { inputType: 'file', repoName, extraInfo: { branch, path } };
  }

  return { inputType: null, repoName: null, extraInfo: null };
}