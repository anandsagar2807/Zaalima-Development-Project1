/**
 * Comprehensive authentication data cleanup utility.
 * Clears all persisted auth data from localStorage, sessionStorage, cookies, and IndexedDB.
 * This ensures that after sign-out, no auth state survives browser refresh/reopen.
 */

// Known localStorage keys used by auth systems
const AUTH_LOCAL_STORAGE_KEYS = [
    'auth-storage',             // Zustand persist store
    'clerk-client',             // Clerk client data
    '__clerk_client_jwt',       // Clerk JWT
    '__clerk_client_uat',       // Clerk client UAT
]

// Known cookie names used by auth systems
const AUTH_COOKIE_NAMES = [
    'token',                        // Express JWT token
    '__session',                    // Clerk session cookie
    '__client_uat',                 // Clerk client UAT
    '__clerk_db_jwt',               // Clerk DB JWT
    'gitguard_github_connected',    // GitGuard GitHub connection status
    'gitguard_github_login',        // GitGuard GitHub login
    'gitguard_github_oauth_state',  // GitGuard OAuth state
    'github_oauth_state',           // GitHub OAuth state (Express backend)
]

/**
 * Clears all authentication-related data from localStorage.
 * Removes known auth keys and any Clerk-prefixed keys.
 */
export function clearAuthLocalStorage(): void {
    try {
        // Remove known auth keys
        AUTH_LOCAL_STORAGE_KEYS.forEach(key => {
            localStorage.removeItem(key)
        })

        // Remove any Clerk-prefixed keys (Clerk may use dynamic key names)
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith('__clerk') || key.startsWith('clerk'))) {
                keysToRemove.push(key)
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
        console.error('Failed to clear auth localStorage:', error)
    }
}

/**
 * Clears all authentication-related data from sessionStorage.
 */
export function clearAuthSessionStorage(): void {
    try {
        // Clear all sessionStorage — it's session-specific and shouldn't
        // persist auth data across sessions anyway
        sessionStorage.clear()
    } catch (error) {
        console.error('Failed to clear auth sessionStorage:', error)
    }
}

/**
 * Clears all authentication-related cookies from the browser.
 * Handles multiple path and domain variations to ensure complete removal.
 */
export function clearAuthCookies(): void {
    try {
        AUTH_COOKIE_NAMES.forEach(name => {
            // Try multiple path/domain variations to ensure cookie is removed
            const paths = ['/', '']
            const domains = [
                window.location.hostname,
                `.${window.location.hostname}`,
                '', // No domain specified
            ]

            paths.forEach(path => {
                domains.forEach(domain => {
                    const cookieParts = [
                        `${name}=`,
                        'expires=Thu, 01 Jan 1970 00:00:00 GMT',
                        path ? `path=${path}` : '',
                        domain ? `domain=${domain}` : '',
                        window.location.protocol === 'https:' ? 'secure' : '',
                    ].filter(Boolean).join('; ')

                    document.cookie = cookieParts
                })
            })

            // Simple fallback deletion
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        })
    } catch (error) {
        console.error('Failed to clear auth cookies:', error)
    }
}

/**
 * Clears all Clerk-related IndexedDB databases.
 */
export async function clearAuthIndexedDB(): Promise<void> {
    try {
        // indexedDB.databases() is supported in modern browsers
        if ('databases' in indexedDB) {
            const databases = await indexedDB.databases()
            for (const db of databases) {
                if (db.name && (db.name.startsWith('clerk') || db.name.startsWith('__clerk'))) {
                    await new Promise<void>((resolve) => {
                        const request = indexedDB.deleteDatabase(db.name!)
                        request.onsuccess = () => resolve()
                        request.onerror = () => resolve() // Don't fail on error
                        request.onblocked = () => resolve() // Don't hang if blocked
                    })
                }
            }
        }
    } catch (error) {
        console.error('Failed to clear auth IndexedDB:', error)
    }
}

/**
 * Comprehensive cleanup of all authentication data.
 * Call this on sign-out to ensure no auth state persists across sessions.
 * 
 * Performs synchronous cleanup first (localStorage, sessionStorage, cookies),
 * then asynchronous cleanup (IndexedDB).
 */
export async function cleanupAuthData(): Promise<void> {
    // Synchronous cleanup first (most critical)
    clearAuthLocalStorage()
    clearAuthSessionStorage()
    clearAuthCookies()

    // Asynchronous cleanup
    await clearAuthIndexedDB()
}

/**
 * Synchronous version of cleanup for use in synchronous contexts or
 * when you need to ensure data is cleared before navigation.
 * Clears localStorage, sessionStorage, and cookies (but NOT IndexedDB).
 */
export function cleanupAuthDataSync(): void {
    clearAuthLocalStorage()
    clearAuthSessionStorage()
    clearAuthCookies()
}
