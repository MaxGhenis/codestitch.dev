import { ProcessOptions, ProcessPathOptions, ProcessFileOptions, ProcessContentOptions, GitHubError } from '../../types/github';
import { fetchRepo, fetchDirectory, fetchFile } from './api-client';
import { shouldIncludeFile, shouldIncludeLine } from '../filters';

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

export async function processPath(options: ProcessPathOptions) {
  try {
    const contentList = await fetchDirectory(options.repoName, options.branch, options.path);
    return await processDirectoryContents({
      ...options,
      contentList
    });
  } catch (err) {
    const error = err as GitHubError;
    return `Error processing path '${options.path}' on branch '${options.branch}': ${error.message}\n`;
  }
}

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