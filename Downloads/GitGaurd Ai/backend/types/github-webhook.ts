export type GitHubPullRequestWebhookPayload = {
    action?: string
    repository?: {
        name?: string
        full_name?: string
        owner?: {
            login?: string
        }
    }
    pull_request?: {
        number?: number
        diff_url?: string
        html_url?: string
    }
}

export type PullRequestContext = {
    owner: string
    repo: string
    pullNumber: number
    diffUrl?: string
    htmlUrl?: string
}
