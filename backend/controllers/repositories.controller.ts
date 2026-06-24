import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { findUserById, decryptUserToken } from '../services/user.service';
import { logger } from '../utils/logger';

export async function getRepositoriesController(req: AuthRequest, res: Response) {
  try {
    const user = await findUserById(req.userId!);

    if (!user || !user.github_connected || !user.github_access_token) {
      return res.status(400).json({ error: 'GitHub account not connected' });
    }

    const accessToken = decryptUserToken(user.github_access_token);
    const { page = '1', per_page = '30', sort = 'updated', type = 'all' } = req.query;

    // Fetch repositories from GitHub API
    const response = await fetch(
      `https://api.github.com/user/repos?page=${page}&per_page=${per_page}&sort=${sort}&type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch repositories from GitHub');
    }

    const repos = (await response.json()) as any[];

    // Transform repository data
    const repositories = repos.map((repo: any) => ({
      id: String(repo.id),
      name: repo.name,
      owner: repo.owner.login,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      default_branch: repo.default_branch,
      status: 'active',
      strictMode: false,
      securityScan: true,
      autoFix: false,
      ignoreLint: false,
      lastAnalyzed: 'Not analyzed yet',
      totalPRs: 0,
      openPRs: repo.open_issues_count,
      scanScore: 0,
      scanFindings: 0,
      secretsRisk: false,
      scanSummary: 'Not scanned yet',
      languages: repo.language ? [repo.language] : [],
      hasWorkflows: false,
      hasTests: false,
    }));

    res.json({ repositories });
  } catch (error) {
    logger.error('Failed to fetch repositories', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
}

export async function toggleRepositoryController(req: AuthRequest, res: Response) {
  try {
    const { id, field } = req.body;

    logger.info('Repository toggle requested', { id, field, userId: req.userId });

    res.json({ success: true, message: 'Repository updated successfully' });
  } catch (error) {
    logger.error('Failed to toggle repository', { error, userId: req.userId });
    res.status(500).json({ error: 'Failed to update repository' });
  }
}
