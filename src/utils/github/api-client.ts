import { GitHubOptions } from '../../types/github';

const SERVERLESS_URL = 'https://www.codestitch.dev/api/github-proxy';

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
    throw new Error('Repository not found');
  } else if (resp.status !== 200) {
    const error = await resp.json();
    throw new Error(`GitHub API error: ${resp.status} - ${error.message || 'Unknown error'}`);
  }
  return resp.json();
}

export async function fetchDirectory(repoName: string, branch: string, path: string) {
  try {
    const [owner, repo] = repoName.split('/');
    const pathEncoded = path ? encodeURIComponent(path) : '';
    const branchEncoded = encodeURIComponent(branch);
    const base = `https://api.github.com/repos/${owner}/${repo}/contents`;
    const url = path
      ? `${base}/${pathEncoded}?ref=${branchEncoded}`
      : `${base}?ref=${branchEncoded}`;
    
    console.log('Fetching directory:', url);
    const resp = await ghFetch(url);
    
    if (resp.status === 404) {
      throw new Error(`Repository, branch, or path not found`);
    } else if (resp.status !== 200) {
      const error = await resp.json();
      throw new Error(`GitHub API error: ${resp.status} - ${error.message || 'Unknown error'}`);
    }
    return resp.json();
  } catch (error) {
    console.error('Error in fetchDirectory:', error);
    throw error;
  }
}

export async function fetchFile(repoName: string, branch: string, path: string) {
  try {
    const [owner, repo] = repoName.split('/');
    const pathEncoded = encodeURIComponent(path);
    const branchEncoded = encodeURIComponent(branch);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${pathEncoded}?ref=${branchEncoded}`;
    
    console.log('Fetching file:', url);
    const resp = await ghFetch(url);
    
    if (resp.status === 404) {
      throw new Error('File or branch not found');
    } else if (resp.status !== 200) {
      const error = await resp.json();
      throw new Error(`GitHub API error: ${resp.status} - ${error.message || 'Unknown error'}`);
    }
    
    const data = await resp.json();
    
    if (data.size > 1000000) {
      return `File is too large to display (size: ${data.size} bytes)`;
    }
    
    // Check for binary files
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
  } catch (error) {
    console.error('Error in fetchFile:', error);
    throw error;
  }
}