import { parseGitHubInput } from './parseGitHubInput';
import { shouldIncludeFile, shouldIncludeLine } from './filters';

/**
 * Main function to process multiple user input lines (URLs or patterns).
 * Returns stitched content and a boolean if errors occurred.
 */
export async function processGitHubContent({
  inputs,
  filePatterns,
  keepMatchingFiles,
  linePatterns,
  keepMatchingLines
}) {
  let allContent = '';
  let hadErrors = false;

  for (const inputLine of inputs) {
    const { inputType, repoName, extraInfo } = parseGitHubInput(inputLine);
    if (!inputType) {
      allContent += `\nInvalid input: ${inputLine}\n`;
      hadErrors = true;
      continue;
    }
    allContent += `\n--- Content from ${inputLine} ---\n`;

    try {
      switch (inputType) {
        case 'regex':
          // For brevity, just note we don't fully implement user-wide searching here
          allContent += 'Regex search not fully implemented (client-side)!\n';
          break;
        case 'repo': {
          const content = await processRepo({ repoName, filePatterns, keepMatchingFiles, linePatterns, keepMatchingLines });
          allContent += content;
          break;
        }
        case 'content': {
          const { branch, path } = extraInfo;
          const content = await processPath({ repoName, branch, path, filePatterns, keepMatchingFiles, linePatterns, keepMatchingLines });
          allContent += content;
          break;
        }
        case 'file': {
          const { branch, path } = extraInfo;
          const content = await processFile({ repoName, branch, path, linePatterns, keepMatchingLines });
          allContent += content;
          break;
        }
        case 'pr': {
          const prNumber = extraInfo;
          const content = await processPullRequest({ repoName, prNumber });
          allContent += content;
          break;
        }
        case 'issue': {
          const issueNumber = extraInfo;
          const content = await processIssue({ repoName, issueNumber });
          allContent += content;
          break;
        }
        default:
          allContent += 'Unknown input type.\n';
          hadErrors = true;
      }
    } catch (err) {
      allContent += `An error occurred: ${err.message}\n`;
      hadErrors = true;
    }
  }

  return { allContent, hadErrors };
}

/**
 * Example for a repository root
 */
async function processRepo({ repoName, filePatterns, keepMatchingFiles, linePatterns, keepMatchingLines }) {
  try {
    const { default_branch } = await fetchRepo(repoName);
    const contentList = await fetchDirectory(repoName, default_branch, '');
    return await processDirectoryContents({
      repoName,
      branch: default_branch,
      contentList,
      filePatterns,
      keepMatchingFiles,
      linePatterns,
      keepMatchingLines
    });
  } catch (err) {
    return `Error processing repository: ${err.message}\n`;
  }
}

/**
 * Example for a path in a repo branch
 */
async function processPath({ repoName, branch, path, filePatterns, keepMatchingFiles, linePatterns, keepMatchingLines }) {
  try {
    const contentList = await fetchDirectory(repoName, branch, path);
    return await processDirectoryContents({
      repoName,
      branch,
      contentList,
      filePatterns,
      keepMatchingFiles,
      linePatterns,
      keepMatchingLines
    });
  } catch (err) {
    return `Error processing path '${path}' on branch '${branch}': ${err.message}\n`;
  }
}

/**
 * Single file
 */
async function processFile({ repoName, branch, path, linePatterns, keepMatchingLines }) {
  try {
    const fileContent = await fetchFile(repoName, branch, path);
    const lines = fileContent.split('\n').filter((l) => shouldIncludeLine(l, linePatterns, keepMatchingLines));
    return `\n--- ${path} ---\n\n${lines.join('\n')}\n`;
  } catch (err) {
    return `Error processing file '${path}': ${err.message}\n`;
  }
}

/**
 * Recursively process a directory listing
 */
async function processDirectoryContents({
  repoName,
  branch,
  contentList,
  filePatterns,
  keepMatchingFiles,
  linePatterns,
  keepMatchingLines
}) {
  let result = '';
  for (const item of contentList) {
    if (item.type === 'dir') {
      try {
        const subContent = await fetchDirectory(repoName, branch, item.path);
        result += await processDirectoryContents({
          repoName,
          branch,
          contentList: subContent,
          filePatterns,
          keepMatchingFiles,
          linePatterns,
          keepMatchingLines
        });
      } catch (err) {
        result += `\nError processing directory ${item.path}: ${err.message}\n`;
      }
    } else if (item.type === 'file') {
      if (shouldIncludeFile(item.path, filePatterns, keepMatchingFiles)) {
        try {
          const content = await fetchFile(repoName, branch, item.path);
          const lines = content.split('\n').filter((l) => shouldIncludeLine(l, linePatterns, keepMatchingLines));
          result += `\n--- ${item.path} ---\n\n${lines.join('\n')}\n`;
        } catch (err) {
          result += `\nError processing ${item.path}: ${err.message}\n`;
        }
      }
    }
  }
  return result;
}

/**
 * Fetch a PR
 */
async function processPullRequest({ repoName, prNumber }) {
  try {
    const [owner, repo] = repoName.split('/');
    const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
    
    // fetch PR data
    const prRes = await ghFetch(prUrl);
    if (prRes.status !== 200) {
      return `Error fetching PR info: ${prRes.status}\n`;
    }
    const prData = await prRes.json();

    // fetch PR diff
    const diffRes = await ghFetch(prUrl, {
      headers: { Accept: 'application/vnd.github.v3.diff' }
    });
    if (diffRes.status !== 200) {
      return `Error fetching PR diff: ${diffRes.status}\n`;
    }
    const diffText = await diffRes.text();

    // Construct final output
    return [
      `# Pull Request #${prNumber}: ${prData.title}\n`,
      `**Author:** ${prData.user.login}  \n`,
      `**Created:** ${prData.created_at}  \n`,
      `**State:** ${prData.state}  \n`,
      `**Base:** ${prData.base.ref} ← **Head:** ${prData.head.ref}  \n\n`,
      '## Description\n\n',
      prData.body ?? '*No description provided*',
      '\n\n## Changes\n\n```diff\n',
      diffText,
      '\n```'
    ].join('');
  } catch (err) {
    return `Error processing pull request: ${err.message}\n`;
  }
}

/**
 * Fetch an issue
 */
async function processIssue({ repoName, issueNumber }) {
  try {
    const [owner, repo] = repoName.split('/');
    const issueUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
    
    const issueRes = await ghFetch(issueUrl);
    if (issueRes.status !== 200) {
      return `Error fetching issue: ${issueRes.status}\n`;
    }
    const issueData = await issueRes.json();

    // comments
    const commentsRes = await ghFetch(`${issueUrl}/comments`);
    let commentsData = [];
    if (commentsRes.status === 200) {
      commentsData = await commentsRes.json();
    }

    const lines = [];
    lines.push(`# ${issueData.title}\n`);
    lines.push(`**Author:** ${issueData.user.login}  \n`);
    lines.push(`**Created:** ${issueData.created_at}  \n`);
    lines.push(`**State:** ${issueData.state}  \n\n`);
    lines.push('## Original Post\n\n');
    lines.push(issueData.body ?? '*No description provided*');
    lines.push('\n\n---\n\n## Comments\n\n');

    for (const comment of commentsData) {
      lines.push(`### ${comment.user.login} - ${comment.created_at}\n\n`);
      lines.push(`${comment.body}\n\n---\n\n`);
    }
    return lines.join('');
  } catch (err) {
    return `Error processing issue: ${err.message}\n`;
  }
}

/* =====================================
   Lower-level helpers
===================================== */

function ghFetch(url, options = {}) {
  const token = process.env.REACT_APP_GITHUB_TOKEN;
  const headers = {
    ...options.headers
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  return fetch(url, { ...options, headers });
}

async function fetchRepo(repoName) {
  const [owner, repo] = repoName.split('/');
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const resp = await ghFetch(repoUrl);
  if (resp.status === 404) {
    throw new Error('Repo not found');
  } else if (resp.status !== 200) {
    throw new Error(`GitHub API error: ${resp.status}`);
  }
  return resp.json();
}

async function fetchDirectory(repoName, branch, path) {
  const [owner, repo] = repoName.split('/');
  const pathEncoded = encodeURIComponent(path);
  const base = `https://api.github.com/repos/${owner}/${repo}/contents`;
  const url = path
    ? `${base}/${pathEncoded}?ref=${branch}`
    : `${base}?ref=${branch}`;
  const resp = await ghFetch(url);
  if (resp.status === 404) {
    throw new Error(`Repository or path not found`);
  } else if (resp.status !== 200) {
    throw new Error(`GitHub API error: ${resp.status}`);
  }
  return resp.json();
}

async function fetchFile(repoName, branch, path) {
  const [owner, repo] = repoName.split('/');
  const pathEncoded = encodeURIComponent(path);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${pathEncoded}?ref=${branch}`;
  const resp = await ghFetch(url);
  if (resp.status === 404) {
    throw new Error('File not found');
  } else if (resp.status !== 200) {
    throw new Error(`GitHub API error: ${resp.status}`);
  }
  const data = await resp.json();
  if (data.size > 1000000) {
    return `File is too large to display (size: ${data.size} bytes)`;
  }
  // Check for binary
  const ext = path.split('.').pop().toLowerCase();
  const images = ['png','jpg','jpeg','gif','bmp'];
  const docs = ['pdf','doc','docx','xls','xlsx'];
  if (images.includes(ext)) {
    return `[Binary image file: ${path}]`;
  }
  if (docs.includes(ext)) {
    return `[Binary document file: ${path}]`;
  }

  try {
    const content = atob(data.content.replace(/\n/g, ''));
    return content;
  } catch (err) {
    return `Error decoding content: ${err.message}`;
  }
}