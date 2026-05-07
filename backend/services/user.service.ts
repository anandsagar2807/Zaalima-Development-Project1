import CryptoJS from 'crypto-js';
import { requirePool } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PgUser {
    id: number;
    clerk_user_id: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
    github_id: string | null;
    github_login: string | null;
    github_avatar: string | null;
    github_access_token: string | null;
    github_connected: boolean;
    github_profile_url: string | null;
    github_public_repos: number;
    github_followers: number;
    github_following: number;
    github_connected_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserParams {
    email: string;
    name?: string;
    avatar?: string;
    githubId?: string;
    githubUsername?: string;
    githubAvatar?: string;
    githubAccessToken?: string;
    githubConnected?: boolean;
    githubProfileUrl?: string;
    githubPublicRepos?: number;
    githubFollowers?: number;
    githubFollowing?: number;
}

// ── Encryption helpers ───────────────────────────────────────────────────────

function encryptToken(token: string): string {
    return CryptoJS.AES.encrypt(token, env.encryptionKey).toString();
}

function decryptToken(encryptedToken: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, env.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// ── Row mapper ───────────────────────────────────────────────────────────────

function mapRowToUser(row: Record<string, unknown>): PgUser {
    return {
        id: Number(row.id),
        clerk_user_id: String(row.clerk_user_id ?? ''),
        email: row.email ? String(row.email) : null,
        name: row.name ? String(row.name) : null,
        avatar_url: row.avatar_url ? String(row.avatar_url) : null,
        github_id: row.github_id ? String(row.github_id) : null,
        github_login: row.github_login ? String(row.github_login) : null,
        github_avatar: row.github_avatar ? String(row.github_avatar) : null,
        github_access_token: row.github_access_token ? String(row.github_access_token) : null,
        github_connected: Boolean(row.github_connected ?? false),
        github_profile_url: row.github_profile_url ? String(row.github_profile_url) : null,
        github_public_repos: Number(row.github_public_repos ?? 0),
        github_followers: Number(row.github_followers ?? 0),
        github_following: Number(row.github_following ?? 0),
        github_connected_at: row.github_connected_at ? new Date(String(row.github_connected_at)) : null,
        created_at: new Date(String(row.created_at)),
        updated_at: new Date(String(row.updated_at)),
    };
}

// ── User operations ──────────────────────────────────────────────────────────

/**
 * Find a user by email address.
 */
export async function findUserByEmail(email: string): Promise<PgUser | null> {
    const pool = requirePool();
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1 LIMIT 1`,
        [email]
    );
    return result.rowCount ? mapRowToUser(result.rows[0]) : null;
}

/**
 * Find a user by primary key id.
 */
export async function findUserById(id: number): Promise<PgUser | null> {
    const pool = requirePool();
    const result = await pool.query(
        `SELECT * FROM users WHERE id = $1 LIMIT 1`,
        [id]
    );
    return result.rowCount ? mapRowToUser(result.rows[0]) : null;
}

/**
 * Find a user by GitHub ID.
 */
export async function findUserByGithubId(githubId: string): Promise<PgUser | null> {
    const pool = requirePool();
    const result = await pool.query(
        `SELECT * FROM users WHERE github_id = $1 LIMIT 1`,
        [githubId]
    );
    return result.rowCount ? mapRowToUser(result.rows[0]) : null;
}

/**
 * Create a new user. Returns the created user.
 */
export async function createUser(params: CreateUserParams): Promise<PgUser> {
    const pool = requirePool();
    const clerkUserId = `github_${params.githubId ?? Date.now()}`;
    const encryptedToken = params.githubAccessToken ? encryptToken(params.githubAccessToken) : null;

    const result = await pool.query(
        `
        INSERT INTO users (
            clerk_user_id, email, name, avatar_url,
            github_id, github_login, github_avatar, github_access_token,
            github_connected, github_profile_url,
            github_public_repos, github_followers, github_following,
            github_connected_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
        `,
        [
            clerkUserId,
            params.email,
            params.name ?? null,
            params.avatar ?? null,
            params.githubId ?? null,
            params.githubUsername ?? null,
            params.githubAvatar ?? null,
            encryptedToken,
            params.githubConnected ?? false,
            params.githubProfileUrl ?? null,
            params.githubPublicRepos ?? 0,
            params.githubFollowers ?? 0,
            params.githubFollowing ?? 0,
            params.githubConnected ? new Date() : null,
        ]
    );

    logger.info('User created', { userId: result.rows[0].id, email: params.email });
    return mapRowToUser(result.rows[0]);
}

/**
 * Update GitHub connection data for a user.
 */
export async function updateUserGitHub(
    id: number,
    data: {
        githubId?: string;
        githubUsername?: string;
        githubAvatar?: string;
        githubAccessToken?: string;
        githubConnected?: boolean;
        githubProfileUrl?: string;
        githubPublicRepos?: number;
        githubFollowers?: number;
        githubFollowing?: number;
        name?: string;
        avatar?: string;
    }
): Promise<PgUser | null> {
    const pool = requirePool();
    const encryptedToken = data.githubAccessToken ? encryptToken(data.githubAccessToken) : undefined;

    const result = await pool.query(
        `
        UPDATE users SET
            github_id = COALESCE($2, github_id),
            github_login = COALESCE($3, github_login),
            github_avatar = COALESCE($4, github_avatar),
            github_access_token = CASE
                WHEN $5::text IS NOT NULL THEN $5
                ELSE github_access_token
            END,
            github_connected = COALESCE($6, github_connected),
            github_profile_url = COALESCE($7, github_profile_url),
            github_public_repos = COALESCE($8, github_public_repos),
            github_followers = COALESCE($9, github_followers),
            github_following = COALESCE($10, github_following),
            name = COALESCE($11, name),
            avatar_url = COALESCE($12, avatar_url),
            github_connected_at = CASE
                WHEN $6 = true AND github_connected_at IS NULL THEN NOW()
                ELSE github_connected_at
            END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [
            id,
            data.githubId ?? null,
            data.githubUsername ?? null,
            data.githubAvatar ?? null,
            encryptedToken ?? null,
            data.githubConnected ?? null,
            data.githubProfileUrl ?? null,
            data.githubPublicRepos ?? null,
            data.githubFollowers ?? null,
            data.githubFollowing ?? null,
            data.name ?? null,
            data.avatar ?? null,
        ]
    );

    return result.rowCount ? mapRowToUser(result.rows[0]) : null;
}

/**
 * Disconnect GitHub for a user – clears all GitHub-related fields.
 */
export async function disconnectUserGitHub(id: number): Promise<PgUser | null> {
    const pool = requirePool();

    const result = await pool.query(
        `
        UPDATE users SET
            github_id = NULL,
            github_login = NULL,
            github_avatar = NULL,
            github_access_token = NULL,
            github_connected = false,
            github_profile_url = NULL,
            github_public_repos = 0,
            github_followers = 0,
            github_following = 0,
            github_connected_at = NULL,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rowCount ? mapRowToUser(result.rows[0]) : null;
}

/**
 * Decrypt a user's GitHub access token.
 */
export function decryptUserToken(encryptedToken: string): string {
    return decryptToken(encryptedToken);
}

// ── Log operations ───────────────────────────────────────────────────────────

/**
 * Create a log entry in the logs table.
 */
export async function createLog(params: {
    userId?: number;
    level?: string;
    event?: string;
    message: string;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    try {
        const pool = requirePool();
        await pool.query(
            `
            INSERT INTO logs (user_id, level, event, message, metadata, created_at)
            VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
            `,
            [
                params.userId ?? null,
                params.level ?? 'info',
                params.event ?? null,
                params.message,
                params.metadata ? JSON.stringify(params.metadata) : '{}',
            ]
        );
    } catch (error) {
        // Log failures should not crash the app
        logger.error('Failed to create log entry', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
