import { ProcessFileOptions, GitHubError } from '../../../types/github';
import { fetchFile } from '../api-client';
import { shouldIncludeLine } from '../../filters';

export async function processFile(options: ProcessFileOptions) {
  try {
    const fileContent = await fetchFile(options.repoName, options.branch, options.path);
    const lines = fileContent.split('\n').filter((l) =>
      shouldIncludeLine(l, options.linePatterns, options.keepMatchingLines)
    );
    return `\n--- ${options.path} ---\n\n${lines.join('\n')}\n`;
  } catch (err) {
    const error = err as GitHubError;
    return `Error processing file '${options.path}': ${error.message}\n`;
  }
}