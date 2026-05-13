import CryptoJS from 'crypto-js';
import { User, IUser } from '../models/User';
import { Log } from '../models/Log';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── User operations ──────────────────────────────────────────────────────────

/**
 * Find a user by email address.
 */
export async function findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
}

/**
 * Find a user by primary key id.
 */
export async function findUserById(id: string | number): Promise<IUser | null> {
    return await User.findById(id);
}

/**
 * Find a user by GitHub ID.
 */
export async function findUserByGithubId(githubId: string): Promise<IUser | null> {
    return await User.findOne({ github_id: githubId });
}

/**
 * Create a new user. Returns the created user.
 */
export async function createUser(params: CreateUserParams): Promise<IUser> {
    const encryptedToken = params.githubAccessToken ? encryptToken(params.githubAccessToken) : undefined;

    const user = new User({
        email: params.email.toLowerCase(),
        name: params.name,
        avatar_url: params.avatar,
        github_id: params.githubId,
        github_login: params.githubUsername,
        github_avatar: params.githubAvatar,
        github_access_token: encryptedToken,
        github_connected: params.githubConnected ?? false,
        github_profile_url: params.githubProfileUrl,
        github_public_repos: params.githubPublicRepos ?? 0,
        github_followers: params.githubFollowers ?? 0,
        github_following: params.githubFollowing ?? 0,
        github_connected_at: params.githubConnected ? new Date() : undefined,
    });

    await user.save();
    logger.info('User created', { userId: user._id, email: params.email });
    return user;
}

/**
 * Update GitHub connection data for a user.
 */
export async function updateUserGitHub(
    id: string | number,
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
): Promise<IUser | null> {
    const encryptedToken = data.githubAccessToken ? encryptToken(data.githubAccessToken) : undefined;

    const updateData: any = {};
    if (data.githubId !== undefined) updateData.github_id = data.githubId;
    if (data.githubUsername !== undefined) updateData.github_login = data.githubUsername;
    if (data.githubAvatar !== undefined) updateData.github_avatar = data.githubAvatar;
    if (encryptedToken !== undefined) updateData.github_access_token = encryptedToken;
    if (data.githubConnected !== undefined) updateData.github_connected = data.githubConnected;
    if (data.githubProfileUrl !== undefined) updateData.github_profile_url = data.githubProfileUrl;
    if (data.githubPublicRepos !== undefined) updateData.github_public_repos = data.githubPublicRepos;
    if (data.githubFollowers !== undefined) updateData.github_followers = data.githubFollowers;
    if (data.githubFollowing !== undefined) updateData.github_following = data.githubFollowing;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar_url = data.avatar;

    // Set github_connected_at if connecting for the first time
    if (data.githubConnected === true) {
        const user = await User.findById(id);
        if (user && !user.github_connected_at) {
            updateData.github_connected_at = new Date();
        }
    }

    return await User.findByIdAndUpdate(id, updateData, { new: true });
}

/**
 * Disconnect GitHub for a user – clears all GitHub-related fields.
 */
export async function disconnectUserGitHub(id: string | number): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
        id,
        {
            github_id: undefined,
            github_login: undefined,
            github_avatar: undefined,
            github_access_token: undefined,
            github_connected: false,
            github_profile_url: undefined,
            github_public_repos: 0,
            github_followers: 0,
            github_following: 0,
            github_connected_at: undefined,
        },
        { new: true }
    );
}

/**
 * Decrypt a user's GitHub access token.
 */
export function decryptUserToken(encryptedToken: string): string {
    return decryptToken(encryptedToken);
}

// ── Log operations ───────────────────────────────────────────────────────────

/**
 * Create a log entry in the logs collection.
 */
export async function createLog(params: {
    userId?: string;
    level?: string;
    event?: string;
    message: string;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    try {
        const log = new Log({
            user_id: params.userId,
            level: params.level ?? 'info',
            event: params.event ?? 'general',
            message: params.message,
            metadata: params.metadata ?? {},
        });
        await log.save();
    } catch (error) {
        // Log failures should not crash the app
        logger.error('Failed to create log entry', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
