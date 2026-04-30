CREATE TABLE
IF NOT EXISTS users
(
    id BIGSERIAL PRIMARY KEY,
    clerk_user_id TEXT NOT NULL UNIQUE,
    github_login TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    clerk_user_id TEXT NOT NULL UNIQUE,
    github_login TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repositories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_repo_id BIGINT NOT NULL,
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT,
    private BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active',
    strict_mode BOOLEAN NOT NULL DEFAULT TRUE,
    ignore_styling BOOLEAN NOT NULL DEFAULT FALSE,
    security_scan BOOLEAN NOT NULL DEFAULT TRUE,
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, github_repo_id)
);

CREATE TABLE IF NOT EXISTS pull_requests (
    id BIGSERIAL PRIMARY KEY,
    repository_id BIGINT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    github_pull_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    branch TEXT,
    state TEXT NOT NULL DEFAULT 'open',
    diff_url TEXT,
    html_url TEXT,
    opened_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (repository_id, github_pull_number)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    pull_request_id BIGINT NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
    issue_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    suggested_fix TEXT NOT NULL,
    file_name TEXT,
    line_number INTEGER,
    code_snippet TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    github_review_id TEXT,
    github_comment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strict_mode BOOLEAN NOT NULL DEFAULT TRUE,
    ignore_styling BOOLEAN NOT NULL DEFAULT FALSE,
    security_scan BOOLEAN NOT NULL DEFAULT TRUE,
    auto_comments BOOLEAN NOT NULL DEFAULT TRUE,
    auto_fixes BOOLEAN NOT NULL DEFAULT TRUE,
    severity_threshold TEXT NOT NULL DEFAULT 'medium',
    llm_temperature NUMERIC(3, 1) NOT NULL DEFAULT 0.7,
    max_diff_size INTEGER NOT NULL DEFAULT 5000,
    review_delay INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    repository_id BIGINT REFERENCES repositories(id) ON DELETE SET NULL,
    pull_request_id BIGINT REFERENCES pull_requests(id) ON DELETE SET NULL,
    level TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_pull_requests_repository_id ON pull_requests(repository_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pull_request_id ON reviews(pull_request_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW
