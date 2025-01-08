import { ProcessContentOptions, GitHubError } from '../../../types/github';
import { fetchDirectory, fetchFile } from '../api-client';
import { shouldIncludeFile, shouldIncludeLine } from '../../filters';

export async function processDirectoryContents(options: ProcessContentOptions): Promise<string> {
  let result = '';
  for (const item of options.contentList) {
    if (item.type === 'dir') {
      try {
        const subContent = await fetchDirectory(options.repoName, options.branch, item.path);
        result += await processDirectoryContents({
          ...options,
          contentList: subContent
        });
      } catch (err) {
        const error = err as GitHubError;
        result += `\nError processing directory ${item.path}: ${error.message}\n`;
      }
    } else if (item.type === 'file') {
      if (shouldIncludeFile(item.path, options.filePatterns, options.keepMatchingFiles)) {
        try {
          const content = await fetchFile(options.repoName, options.branch, item.path);
          const lines = content.split('\n').filter((l) =>
            shouldIncludeLine(l, options.linePatterns, options.keepMatchingLines)
          );
          result += `\n--- ${item.path} ---\n\n${lines.join('\n')}\n`;
        } catch (err) {
          const error = err as GitHubError;
          result += `\nError processing ${item.path}: ${error.message}\n`;
        }
      }
    }
  }
  return result;
}