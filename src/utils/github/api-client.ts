import { GitHubOptions } from '../../types/github';

const SERVERLESS_URL = 'https://www.codestitch.dev/api/github-proxy'; // Use primary custom domain

export function ghFetch(url: string, options: GitHubOptions = {}) {
  const headers = {
    ...options.headers,
  };

  // Proxy the request through the serverless function
  const proxyUrl = `${SERVERLESS_URL}?endpoint=${encodeURIComponent(url.replace('https://api.github.com/', ''))}`;
  return fetch(proxyUrl, { ...options, headers });
}

export async function fetchRepo(repoName: string) {
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

export async function fetchDirectory(repoName: string, branch: string, path: string) {
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

export async function fetchFile(repoName: string, branch: string, path: string) {
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
  const ext = path.split('.').pop()?.toLowerCase() || '';
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
    if (err instanceof Error) {
      return `Error decoding content: ${err.message}`;
    }
    return 'Error decoding content';
  }
}