import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { findUserById, decryptUserToken } from '../services/user.service';
import { logger } from '../utils/logger';

export async function getPullRequestsController(req: AuthRequest, res: Response) {
  try {
    const user = await findUserById(req.userId!);

    if (!user || !user.github_connected || !user.github_access_token) {
      return res.status(400).json({ error: 'GitHub account not connected' });
    }

    const accessToken = decryptUserToken(user.github_access_token);
    const { severity, type, autofix, repo } = req.query;

    // Fetch user's repositories first
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=10&sort=updated', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const repos = (await reposResponse.json()) as any[];
    const pullRequests: any[] = [];

    // Fetch PRs from each repository
    for (const repository of repos.slice(0, 5)) {
      try {
        const prsResponse = await fetch(
          `https://api.github.com/repos/${repository.full_name}/pulls?state=all&per_page=5`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        if (prsResponse.ok) {
          const prs = (await prsResponse.json()) as any[];

          for (const pr of prs) {
            pullRequests.push({
              id: String(pr.id),
              number: pr.number,
              title: pr.title,
              repository: repository.name,
              author: pr.user.login,
              status: pr.state === 'open' ? 'open' : pr.merged_at ? 'merged' : 'closed',
              severity: 'medium',
              type: 'feature',
              issuesFound: 0,
              hasAutoFix: false,
              createdAt: new Date(pr.created_at).toLocaleString(),
              branch: pr.head.ref,
              html_url: pr.html_url,
            });
          }
        }
      } catch (error) {
        logger.error('Failed to fetch PRs for repo', { repo: repository.name, error });
      }
    }

    // Apply filters
    let filteredPRs = pullRequests;
    if (severity) {
      filteredPRs = filteredPRs.filter(pr => pr.severity === severity);
    }
    if (type) {
      filteredPRs = filteredPRs.filter(pr => pr.type === type);
    }
    if (autofix !== undefined) {
      const autofixBool = autofix === 'true';
      filteredPRs = filteredPRs.filter(pr => pr.hasAutoFix === autofixBool);
    }
    if (repo) {
      filteredPRs = filteredPRs.filter(pr => pr.repository === repo);
    }

    res.json({ pullRequests: filteredPRs });
  } catch (error) {
    logger.error('Failed to fetch pull requests', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch pull requests' });
  }
}

export async function getPullRequestController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Mock single PR data
    const pullRequest = {
      id,
      number: 123,
      title: 'Add user authentication',
      repository: 'gitguard-ai',
      author: 'john-doe',
      status: 'open',
      severity: 'medium',
      type: 'feature',
      issuesFound: 3,
      hasAutoFix: true,
      createdAt: '2 hours ago',
      branch: 'feature/auth',
      description: 'Implements JWT-based authentication system',
      filesChanged: 12,
      additions: 450,
      deletions: 120,
    };

    res.json({ pullRequest });
  } catch (error) {
    logger.error('Failed to fetch pull request', { error, userId: req.userId, prId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch pull request' });
  }
}
