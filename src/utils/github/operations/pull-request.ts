import { GitHubError } from '../../../types/github';
import { ghFetch, fetchPrDiff } from '../api-client';

interface PullRequestParams {
  repoName: string;
  prNumber: string;
}

export async function processPullRequest({ repoName, prNumber }: PullRequestParams) {
  try {
    const [owner, repo] = repoName.split('/');
    const prEndpoint = `repos/${owner}/${repo}/pulls/${prNumber}`;

    // fetch PR data
    const prRes = await ghFetch(prEndpoint);
    if (prRes.status !== 200) {
      return `Error fetching PR info: ${prRes.status}\n`;
    }
    const prData = await prRes.json();

    // fetch PR diff
    const diffRes = await fetchPrDiff(prEndpoint, {
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
    const error = err as GitHubError;
    return `Error processing pull request: ${error.message}\n`;
  }
}