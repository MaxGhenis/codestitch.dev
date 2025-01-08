import { ProcessPathOptions, GitHubError } from '../../../types/github';
import { fetchDirectory } from '../api-client';
import { processDirectoryContents } from './directory';

export async function processPath(options: ProcessPathOptions) {
  try {
    const contentList = await fetchDirectory(options.repoName, options.branch, options.path);
    return await processDirectoryContents({
      ...options,
      contentList
    });
  } catch (err) {
    const error = err as GitHubError;
    if (error.message.includes('not found')) {
      return `Error: Path '${options.path}' not found in branch '${options.branch}'. Please check the path and branch name are correct.\n`;
    }
    return `Error processing path '${options.path}' on branch '${options.branch}': ${error.message}\n`;
  }
}