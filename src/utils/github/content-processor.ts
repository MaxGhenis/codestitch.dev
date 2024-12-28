// src/utils/github/content-processor.ts
import { GitHubContentOptions, GitHubError } from '../../types/github';
import { processRepo, processPath, processFile } from './repo-operations';
import { processPullRequest } from './pr-operations';
import { processIssue } from './issue-operations';
import { parseGitHubInput } from '../parseGitHubInput';

export async function processGitHubContent({
  inputs,
  filePatterns,
  keepMatchingFiles,
  linePatterns,
  keepMatchingLines
}: GitHubContentOptions) {
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
          allContent += 'Regex search not fully implemented (client-side)!\n';
          break;
        case 'repo': {
          if (!repoName) break;
          const content = await processRepo({
            repoName,
            filePatterns,
            keepMatchingFiles,
            linePatterns,
            keepMatchingLines
          });
          allContent += content;
          break;
        }
        case 'content': {
          if (!repoName || !extraInfo || typeof extraInfo === 'string') break;
          const { branch, path } = extraInfo;
          const content = await processPath({
            repoName,
            branch,
            path,
            filePatterns,
            keepMatchingFiles,
            linePatterns,
            keepMatchingLines
          });
          allContent += content;
          break;
        }
        case 'file': {
          if (!repoName || !extraInfo || typeof extraInfo === 'string') break;
          const { branch, path } = extraInfo;
          const content = await processFile({
            repoName,
            branch,
            path,
            linePatterns,
            keepMatchingLines
          });
          allContent += content;
          break;
        }
        case 'pr': {
          if (!repoName || typeof extraInfo !== 'string') break;
          const content = await processPullRequest({ repoName, prNumber: extraInfo });
          allContent += content;
          break;
        }
        case 'issue': {
          if (!repoName || typeof extraInfo !== 'string') break;
          const content = await processIssue({ repoName, issueNumber: extraInfo });
          allContent += content;
          break;
        }
        default:
          allContent += 'Unknown input type.\n';
          hadErrors = true;
      }
    } catch (err) {
      const error = err as GitHubError;
      allContent += `An error occurred: ${error.message}\n`;
      hadErrors = true;
    }
  }

  return { allContent, hadErrors };
}