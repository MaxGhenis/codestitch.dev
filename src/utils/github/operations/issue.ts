import { GitHubError } from '../../../types/github';
import { ghFetch } from '../api-client';

interface IssueParams {
  repoName: string;
  issueNumber: string;
}

export async function processIssue({ repoName, issueNumber }: IssueParams) {
  try {
    const [owner, repo] = repoName.split('/');
    const issueEndpoint = `repos/${owner}/${repo}/issues/${issueNumber}`;

    const issueRes = await ghFetch(issueEndpoint);
    if (issueRes.status !== 200) {
      return `Error fetching issue: ${issueRes.status}\n`;
    }
    const issueData = await issueRes.json();

    // comments
    const commentsEndpoint = `${issueEndpoint}/comments`;
    const commentsRes = await ghFetch(commentsEndpoint);
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
    const error = err as GitHubError;
    return `Error processing issue: ${error.message}\n`;
  }
}