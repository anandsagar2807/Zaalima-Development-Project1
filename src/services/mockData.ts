// Mock data for GitGuard AI Dashboard

export interface Repository {
    id: string
    name: string
    owner: string
    status: "active" | "paused"
    strictMode: boolean
    securityScan: boolean
    autoFix: boolean
    ignoreLint: boolean
    lastAnalyzed: string
    totalPRs: number
    openPRs: number
    scanScore?: number
    scanFindings?: number
    secretsRisk?: boolean
    scanSummary?: string
    languages?: string[]
    hasWorkflows?: boolean
    hasTests?: boolean
}

export interface PullRequest {
    id: string
    title: string
    repository: string
    status: "open" | "merged" | "closed" | "pending"
    issuesFound: number
    severity: "critical" | "high" | "medium" | "low"
    reviewedAt: string
    author: string
    branch: string
    hasAutoFix: boolean
    type: "security" | "performance" | "bug" | "style"
}

export interface AIReview {
    id: string
    fileName: string
    issueType: "bug" | "security" | "performance" | "style" | "best-practice"
    severity: "critical" | "high" | "medium" | "low"
    title: string
    description: string
    suggestedFix: string
    lineNumber: number
    codeSnippet: string
    status: "pending" | "applied" | "dismissed"
    prId: string
}

export interface SecurityIssue {
    id: string
    type: "vulnerability" | "secret" | "dependency" | "token" | "sql-injection" | "xss"
    severity: "critical" | "high" | "medium" | "low"
    title: string
    description: string
    repository: string
    prNumber: string
    detectedAt: string
    status: "open" | "fixed" | "ignored"
}

export interface PerformanceIssue {
    id: string
    type: "slow-loop" | "memory" | "api-call" | "query"
    title: string
    description: string
    repository: string
    prNumber: string
    impact: "high" | "medium" | "low"
    performanceScore: number
    detectedAt: string
}

export interface WebhookLog {
    id: string
    event: string
    status: "success" | "pending" | "failed"
    repository: string
    prNumber: string
    timestamp: string
    duration: string
    details: string
}

export interface RuleSetting {
    id: string
    name: string
    description: string
    enabled: boolean
    category: "bug" | "security" | "performance" | "style" | "best-practice"
}

export interface AppSettings {
    severityThreshold: string
    autoComments: boolean
    autoFixes: boolean
    llmTemperature: number
    maxDiffSize: number
    reviewDelay: number
}

export interface Analytics {
    totalPRs: number
    issuesDetected: number
    securityWarnings: number
    performanceWarnings: number
    avgResponseTime: number
    autoFixes: number
}

// Repository mock data
export const mockRepositories: Repository[] = [
    {
        id: "1",
        name: "frontend-app",
        owner: "gitguard",
        status: "active",
        strictMode: true,
        securityScan: true,
        autoFix: true,
        ignoreLint: false,
        lastAnalyzed: "2 minutes ago",
        totalPRs: 156,
        openPRs: 12,
    },
    {
        id: "2",
        name: "backend-api",
        owner: "gitguard",
        status: "active",
        strictMode: false,
        securityScan: true,
        autoFix: true,
        ignoreLint: false,
        lastAnalyzed: "15 minutes ago",
        totalPRs: 89,
        openPRs: 5,
    },
    {
        id: "3",
        name: "mobile-app",
        owner: "gitguard",
        status: "paused",
        strictMode: false,
        securityScan: true,
        autoFix: false,
        ignoreLint: true,
        lastAnalyzed: "1 hour ago",
        totalPRs: 45,
        openPRs: 3,
    },
    {
        id: "4",
        name: "shared-utils",
        owner: "gitguard",
        status: "active",
        strictMode: true,
        securityScan: false,
        autoFix: true,
        ignoreLint: false,
        lastAnalyzed: "30 minutes ago",
        totalPRs: 23,
        openPRs: 2,
    },
    {
        id: "5",
        name: "docs-site",
        owner: "gitguard",
        status: "active",
        strictMode: false,
        securityScan: false,
        autoFix: false,
        ignoreLint: true,
        lastAnalyzed: "45 minutes ago",
        totalPRs: 67,
        openPRs: 8,
    },
    {
        id: "6",
        name: "auth-service",
        owner: "gitguard",
        status: "active",
        strictMode: true,
        securityScan: true,
        autoFix: true,
        ignoreLint: false,
        lastAnalyzed: "5 minutes ago",
        totalPRs: 34,
        openPRs: 4,
    },
]

// Pull Requests mock data
export const mockPullRequests: PullRequest[] = [
    {
        id: "1",
        title: "feat: Add user authentication flow",
        repository: "frontend-app",
        status: "open",
        issuesFound: 3,
        severity: "high",
        reviewedAt: "2 minutes ago",
        author: "sarah.dev",
        branch: "feature/auth",
        hasAutoFix: true,
        type: "security",
    },
    {
        id: "2",
        title: "fix: Memory leak in data processing",
        repository: "backend-api",
        status: "merged",
        issuesFound: 0,
        severity: "low",
        reviewedAt: "15 minutes ago",
        author: "mike.code",
        branch: "fix/memory-leak",
        hasAutoFix: false,
        type: "performance",
    },
    {
        id: "3",
        title: "refactor: Optimize database queries",
        repository: "backend-api",
        status: "open",
        issuesFound: 7,
        severity: "critical",
        reviewedAt: "1 hour ago",
        author: "alex.dev",
        branch: "refactor/db-queries",
        hasAutoFix: true,
        type: "performance",
    },
    {
        id: "4",
        title: "docs: Update API documentation",
        repository: "docs-site",
        status: "open",
        issuesFound: 1,
        severity: "low",
        reviewedAt: "3 hours ago",
        author: "emma.write",
        branch: "docs/api-update",
        hasAutoFix: false,
        type: "style",
    },
    {
        id: "5",
        title: "feat: Add notification system",
        repository: "frontend-app",
        status: "pending",
        issuesFound: 5,
        severity: "medium",
        reviewedAt: "5 hours ago",
        author: "john.dev",
        branch: "feature/notifications",
        hasAutoFix: true,
        type: "bug",
    },
    {
        id: "6",
        title: "fix: SQL injection vulnerability",
        repository: "auth-service",
        status: "open",
        issuesFound: 2,
        severity: "critical",
        reviewedAt: "10 minutes ago",
        author: "security.team",
        branch: "fix/sql-injection",
        hasAutoFix: true,
        type: "security",
    },
]

// AI Reviews mock data
export const mockAIReviews: AIReview[] = [
    {
        id: "1",
        fileName: "src/components/AuthForm.tsx",
        issueType: "security",
        severity: "critical",
        title: "Potential XSS vulnerability",
        description: "User input is being rendered without proper sanitization. This could allow malicious scripts to be executed.",
        suggestedFix: `// Before
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// After
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userInput) 
}} />`,
        lineNumber: 45,
        codeSnippet: "<div dangerouslySetInnerHTML={{ __html: userInput }} />",
        status: "pending",
        prId: "1",
    },
    {
        id: "2",
        fileName: "src/hooks/useDataFetch.ts",
        issueType: "performance",
        severity: "high",
        title: "Missing dependency in useEffect",
        description: "The useEffect hook is missing 'userId' in its dependency array, which may cause stale data issues.",
        suggestedFix: `// Before
useEffect(() => {
  fetchData(userId);
}, []);

// After
useEffect(() => {
  fetchData(userId);
}, [userId]);`,
        lineNumber: 23,
        codeSnippet: "useEffect(() => { fetchData(userId); }, []);",
        status: "pending",
        prId: "1",
    },
    {
        id: "3",
        fileName: "src/utils/helpers.ts",
        issueType: "bug",
        severity: "medium",
        title: "Incorrect type comparison",
        description: "Using '==' instead of '===' may lead to unexpected type coercion issues.",
        suggestedFix: `// Before
if (value == null) { ... }

// After
if (value === null || value === undefined) { ... }`,
        lineNumber: 67,
        codeSnippet: "if (value == null) { return; }",
        status: "pending",
        prId: "3",
    },
    {
        id: "4",
        fileName: "src/api/users.ts",
        issueType: "security",
        severity: "critical",
        title: "SQL Injection vulnerability",
        description: "Direct string interpolation in SQL query. Use parameterized queries instead.",
        suggestedFix: `// Before
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// After
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);`,
        lineNumber: 34,
        codeSnippet: "const query = `SELECT * FROM users WHERE id = ${userId}`;",
        status: "pending",
        prId: "6",
    },
    {
        id: "5",
        fileName: "src/components/Dashboard.tsx",
        issueType: "best-practice",
        severity: "low",
        title: "Consider using React.memo",
        description: "This component could benefit from memoization to prevent unnecessary re-renders.",
        suggestedFix: `// Before
export function Dashboard({ data }) {
  return <div>{data.title}</div>;
}

// After
export const Dashboard = React.memo(function Dashboard({ data }) {
  return <div>{data.title}</div>;
});`,
        lineNumber: 12,
        codeSnippet: "export function Dashboard({ data }) {",
        status: "pending",
        prId: "5",
    },
]

// Security Issues mock data
export const mockSecurityIssues: SecurityIssue[] = [
    {
        id: "1",
        type: "vulnerability",
        severity: "critical",
        title: "Prototype Pollution Vulnerability",
        description: "Deep merge function allows modification of object prototype",
        repository: "backend-api",
        prNumber: "#142",
        detectedAt: "2 hours ago",
        status: "open",
    },
    {
        id: "2",
        type: "secret",
        severity: "high",
        title: "Hardcoded API Key Detected",
        description: "API key found in source code. Move to environment variables.",
        repository: "frontend-app",
        prNumber: "#89",
        detectedAt: "4 hours ago",
        status: "open",
    },
    {
        id: "3",
        type: "dependency",
        severity: "high",
        title: "Vulnerable Dependency: lodash < 4.17.21",
        description: "Update lodash to version 4.17.21 or later to fix prototype pollution",
        repository: "shared-utils",
        prNumber: "#56",
        detectedAt: "1 day ago",
        status: "fixed",
    },
    {
        id: "4",
        type: "token",
        severity: "medium",
        title: "JWT Token in LocalStorage",
        description: "Storing JWT tokens in localStorage is vulnerable to XSS attacks",
        repository: "frontend-app",
        prNumber: "#92",
        detectedAt: "6 hours ago",
        status: "open",
    },
    {
        id: "5",
        type: "sql-injection",
        severity: "critical",
        title: "SQL Injection in Search Endpoint",
        description: "User input directly interpolated into SQL query",
        repository: "backend-api",
        prNumber: "#145",
        detectedAt: "30 minutes ago",
        status: "open",
    },
    {
        id: "6",
        type: "xss",
        severity: "high",
        title: "Cross-Site Scripting (XSS)",
        description: "Unsanitized user input rendered in HTML context",
        repository: "frontend-app",
        prNumber: "#87",
        detectedAt: "3 hours ago",
        status: "ignored",
    },
]

// Performance Issues mock data
export const mockPerformanceIssues: PerformanceIssue[] = [
    {
        id: "1",
        type: "slow-loop",
        title: "Inefficient nested loop detected",
        description: "O(n²) complexity in user filtering. Consider using a Map for O(1) lookups.",
        repository: "backend-api",
        prNumber: "#142",
        impact: "high",
        performanceScore: 45,
        detectedAt: "1 hour ago",
    },
    {
        id: "2",
        type: "memory",
        title: "Memory-heavy object creation",
        description: "Creating large objects in a loop. Consider lazy loading or pagination.",
        repository: "frontend-app",
        prNumber: "#89",
        impact: "medium",
        performanceScore: 62,
        detectedAt: "3 hours ago",
    },
    {
        id: "3",
        type: "api-call",
        title: "Multiple sequential API calls",
        description: "API calls in a loop. Use Promise.all() for parallel requests.",
        repository: "frontend-app",
        prNumber: "#91",
        impact: "high",
        performanceScore: 38,
        detectedAt: "5 hours ago",
    },
    {
        id: "4",
        type: "query",
        title: "Unoptimized database query",
        description: "Missing index on frequently queried column. Add index for better performance.",
        repository: "backend-api",
        prNumber: "#145",
        impact: "high",
        performanceScore: 28,
        detectedAt: "2 hours ago",
    },
]

// Webhook Logs mock data
export const mockWebhookLogs: WebhookLog[] = [
    {
        id: "1",
        event: "pull_request.opened",
        status: "success",
        repository: "frontend-app",
        prNumber: "#142",
        timestamp: "2 minutes ago",
        duration: "1.2s",
        details: "Successfully analyzed and posted review comments",
    },
    {
        id: "2",
        event: "pull_request.synchronize",
        status: "success",
        repository: "backend-api",
        prNumber: "#89",
        timestamp: "15 minutes ago",
        duration: "0.8s",
        details: "Incremental analysis completed",
    },
    {
        id: "3",
        event: "pull_request.opened",
        status: "pending",
        repository: "mobile-app",
        prNumber: "#45",
        timestamp: "30 seconds ago",
        duration: "-",
        details: "Analysis in progress...",
    },
    {
        id: "4",
        event: "pull_request.opened",
        status: "failed",
        repository: "docs-site",
        prNumber: "#23",
        timestamp: "1 hour ago",
        duration: "2.5s",
        details: "Error: Rate limit exceeded for repository",
    },
    {
        id: "5",
        event: "pull_request.closed",
        status: "success",
        repository: "shared-utils",
        prNumber: "#67",
        timestamp: "3 hours ago",
        duration: "0.3s",
        details: "Webhook processed, no action required",
    },
    {
        id: "6",
        event: "pull_request.opened",
        status: "success",
        repository: "auth-service",
        prNumber: "#34",
        timestamp: "5 minutes ago",
        duration: "1.5s",
        details: "Security scan completed, 2 issues found",
    },
]

// Rule Settings mock data
export const mockRuleSettings: RuleSetting[] = [
    {
        id: "1",
        name: "Bug Detection",
        description: "Automatically detect potential bugs and logic errors",
        enabled: true,
        category: "bug",
    },
    {
        id: "2",
        name: "Security Scanner",
        description: "Scan for security vulnerabilities and exposed secrets",
        enabled: true,
        category: "security",
    },
    {
        id: "3",
        name: "Performance Analysis",
        description: "Identify performance bottlenecks and optimization opportunities",
        enabled: true,
        category: "performance",
    },
    {
        id: "4",
        name: "Best Practices",
        description: "Enforce coding best practices and design patterns",
        enabled: true,
        category: "best-practice",
    },
    {
        id: "5",
        name: "Code Style",
        description: "Check for consistent code formatting and style",
        enabled: false,
        category: "style",
    },
    {
        id: "6",
        name: "Strict Review Mode",
        description: "Enable more thorough analysis with stricter rules",
        enabled: true,
        category: "security",
    },
    {
        id: "7",
        name: "Auto Suggest Fixes",
        description: "Automatically generate fix suggestions for detected issues",
        enabled: true,
        category: "bug",
    },
]

// Default Settings
export const defaultSettings: AppSettings = {
    severityThreshold: "medium",
    autoComments: true,
    autoFixes: true,
    llmTemperature: 0.7,
    maxDiffSize: 5000,
    reviewDelay: 0,
}

// Analytics mock data
export const mockAnalytics: Analytics = {
    totalPRs: 2847,
    issuesDetected: 1523,
    securityWarnings: 89,
    performanceWarnings: 234,
    avgResponseTime: 1.2,
    autoFixes: 892,
}

// Chart data for PRs analyzed per day (last 7 days)
export const prsPerDayData = [
    { day: "Mon", prs: 45, issues: 23 },
    { day: "Tue", prs: 52, issues: 31 },
    { day: "Wed", prs: 38, issues: 18 },
    { day: "Thu", prs: 65, issues: 42 },
    { day: "Fri", prs: 48, issues: 28 },
    { day: "Sat", prs: 22, issues: 12 },
    { day: "Sun", prs: 30, issues: 15 },
]

// Issues by severity
export const issuesBySeverity = [
    { name: "Critical", value: 45, color: "#ef4444" },
    { name: "High", value: 123, color: "#f97316" },
    { name: "Medium", value: 289, color: "#eab308" },
    { name: "Low", value: 456, color: "#22c55e" },
]

// Security vs Bug ratio
export const securityVsBugData = [
    { name: "Security", value: 89 },
    { name: "Bugs", value: 234 },
    { name: "Performance", value: 156 },
    { name: "Style", value: 312 },
]

// Heatmap data for security
export const securityHeatmapData = [
    { type: "secrets", count: 12, severity: "high" },
    { type: "tokens", count: 8, severity: "medium" },
    { type: "sql-injection", count: 3, severity: "critical" },
    { type: "xss", count: 15, severity: "high" },
    { type: "unsafe-deps", count: 6, severity: "medium" },
]