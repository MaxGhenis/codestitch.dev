import { parseGitHubInput } from './parseGitHubInput';
import { shouldIncludeFile, shouldIncludeLine } from './contentFilters';

/**
 * Main function to process multiple lines of user input (URLs or patterns).
 * Returns stitched content and whether any errors occurred.
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
    allContent += `\n\n--- Content from ${inputLine} ---\n`;

    try {
      if (inputType === 'regex') {
        // Not implemented in detail below, but conceptually:
        allContent += 'Regex-based searches across user’s repos are difficult client-side.\n';
        // Typically you’d need a user’s token to list all their repos, then search them.
        // For brevity, we’ll just note it’s not implemented fully here.
      } else if (inputType === 'repo') {
        const content = await processRepo({ repoName, filePatterns, keepMatchingFiles, linePatterns, keepMatchingLines });
        allContent += content;
      } else if (inputType === 'content') {
        // “content” = directory path under a branch
        const { branch, path } = extraInfo;
        const content = await processPath({ repoName, branch, path, filePatterns, keepMatchingFiles, linePatterns, keepMatchingLines });
        allContent += content;
      } else if (inputType === 'file') {
        const { branch, path } = extraInfo;
        const content = await processFile({ repoName, branch, path, linePatterns, keepMatchingLines });
        allContent += content;
      } else if (inputType === 'pr') {
        const prNumber = extraInfo;
        const content = await processPullRequest({ repoName, prNumber });
        allContent += content;
      } else if (inputType === 'issue') {
        const issueNumber = extraInfo;
        const content = await processIssue({ repoName, issueNumber });
        allContent += content;
      }
    } catch (err) {
      allContent += `An error occurred: ${err.message}\n`;
      console.error(err);
      hadErrors = true;
    }
  }

  return { allContent, hadErrors };
}

/**
 * Fetch all content from a repository’s root.
 */
async function processRepo({ repoName, filePatterns, keepMatchingFiles, linePatterns, keepMatchingLines }) {
  try {
    // Repos have a default branch, but we don’t have that info up front in a standard way without separate fetch
    // We can assume 'main' or 'master' or do an extra request:
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
 * Fetch contents of a specific path in a repo, on a given branch.
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
 * Fetch a single file’s contents from GitHub.
 */
async function processFile({ repoName, branch, path, linePatterns, keepMatchingLines }) {
  try {
    const fileContent = await fetchFile(repoName, branch, path);
    const lines = fileContent.split('\n').filter((line) =>
      shouldIncludeLine(line, linePatterns, keepMatchingLines)
    );
    return `\n--- ${path} ---\n\n${lines.join('\n')}\n`;
  } catch (err) {
    return `Error processing file '${path}': ${err.message}\n`;
  }
}

/**
 * Handle directory listing + recursion.
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
      // Recursively fetch
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
      // Check file pattern
      if (shouldIncludeFile(item.path, filePatterns, keepMatchingFiles)) {
        try {
          const content = await fetchFile(repoName, branch, item.path);
          const lines = content.split('\n').filter((line) =>
            shouldIncludeLine(line, linePatterns, keepMatchingLines)
          );
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
 * Process a PR by fetching metadata and diff from the GitHub API.
 */
async function processPullRequest({ repoName, prNumber }) {
  try {
    // 1) Fetch the PR itself for metadata
    const [owner, repo] = repoName.split('/');
    const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
    const prRes = await ghFetch(prUrl, { method: 'GET' });
    if (prRes.status !== 200) {
      return `Error fetching PR info: ${prRes.status}\n`;
    }
    const prData = await prRes.json();

    // 2) Fetch the PR diff
    const diffRes = await ghFetch(prUrl, {
      method: 'GET',
      headers: { Accept: 'application/vnd.github.v3.diff' }
    });
    if (diffRes.status !== 200) {
      return `Error fetching PR diff: ${diffRes.status}\n`;
    }
    const diffText = await diffRes.text();

    // Construct a nice output
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
 * Process a GitHub issue by fetching the title, body, and comments.
 */
async function processIssue({ repoName, issueNumber }) {
  try {
    const [owner, repo] = repoName.split('/');
    const issueUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
    const issueRes = await ghFetch(issueUrl, { method: 'GET' });
    if (issueRes.status !== 200) {
      return `Error fetching issue: ${issueRes.status}\n`;
    }
    const issueData = await issueRes.json();

    // Comments
    const commentsRes = await ghFetch(`${issueUrl}/comments`, { method: 'GET' });
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

/* ===========================
   Lower-level fetch helpers
   =========================== */

/**
 * If you have a token in .env, you can do:
 *   const token = process.env.REACT_APP_GITHUB_TOKEN;
 */
function ghFetch(url, options = {}) {
  // For public data you can omit Authorization.
  // For private data, pass in a token.
  const token = process.env.REACT_APP_GITHUB_TOKEN;
  const headers = {
    ...options.headers
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  return fetch(url, { ...options, headers });
}

/**
 * Fetch a repository to get details like default_branch.
 */
async function fetchRepo(repoName) {
  const [owner, repo] = repoName.split('/');
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const resp = await ghFetch(repoUrl);
  if (resp.status !== 200) {
    throw new Error(`Error fetching repo: ${resp.status}`);
  }
  return resp.json();
}

/**
 * Fetch directory contents.
 */
async function fetchDirectory(repoName, branch, path) {
  const [owner, repo] = repoName.split('/');
  const pathEncoded = encodeURIComponent(path);
  // /contents/PATH?ref=BRANCH
  // If path is empty, it’s just /contents?ref=BRANCH
  const base = `https://api.github.com/repos/${owner}/${repo}/contents`;
  const url =
    path?.length > 0
      ? `${base}/${pathEncoded}?ref=${branch}`
      : `${base}?ref=${branch}`;

  const resp = await ghFetch(url);
  if (resp.status === 404) {
    throw new Error('Repository or path not found');
  }
  if (resp.status !== 200) {
    throw new Error(`GitHub API error: ${resp.status}`);
  }
  return resp.json(); // returns an array of items
}

/**
 * Fetch a single file’s content. The response is base64-encoded, so we decode it in JS.
 */
async function fetchFile(repoName, branch, path) {
  const [owner, repo] = repoName.split('/');
  const pathEncoded = encodeURIComponent(path);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${pathEncoded}?ref=${branch}`;
  const resp = await ghFetch(url);
  if (resp.status === 404) {
    throw new Error('File not found');
  }
  if (resp.status !== 200) {
    throw new Error(`GitHub API error: ${resp.status}`);
  }
  const data = await resp.json();
  if (data.size > 1000000) {
    return `File is too large to display (size: ${data.size} bytes)`;
  }

  // Check for binary extension
  const ext = path.split('.').pop().toLowerCase();
  const images = ['png','jpg','jpeg','gif','bmp'];
  const docs = ['pdf','doc','docx','xls','xlsx'];
  if (images.includes(ext)) {
    return `[Binary image file: ${path}]`;
  }
  if (docs.includes(ext)) {
    return `[Binary document file: ${path}]`;
  }

  // Attempt to decode the base64 content
  try {
    const content = atob(data.content.replace(/\n/g, ''));
    return content;
  } catch (err) {
    return `Error decoding content: ${err.message}`;
  }
}