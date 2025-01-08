import { ProcessOptions, GitHubError } from '../../../types/github';
import { fetchRepo, fetchDirectory } from '../api-client';
import { processDirectoryContents } from './directory';

export async function processRepo(options: ProcessOptions) {
  try {
    const { default_branch } = await fetchRepo(options.repoName);
    const contentList = await fetchDirectory(options.repoName, default_branch, '');
    return await processDirectoryContents({
      ...options,
      branch: default_branch,
      contentList
    });
  } catch (err) {
    const error = err as GitHubError;
    return `Error processing repository: ${error.message}\n`;
  }
}