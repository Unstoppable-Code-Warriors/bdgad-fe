import { redirect } from 'react-router'
import { getAccessToken, isUserAuthenticated, clearTokensOutside } from '@/stores/auth.store'

/**
 * Auth loader - Protects routes that require authentication
 * If user doesn't have a valid access token, clears tokens and redirects to login
 */
export const authLoader = () => {
    const accessToken = getAccessToken()
    const isAuthenticated = isUserAuthenticated()

    // Check if user has access token and is authenticated
    if (!accessToken || !isAuthenticated) {
        // Clear any stale tokens
        clearTokensOutside()
        // Redirect to login page
        throw redirect('/auth/login')
    }

    // User is authenticated, allow access
    return null
}

/**
 * Non-auth loader - For public routes like login, forgot password, reset password
 * If user already has a valid access token, redirects to home page
 */
export const nonAuthLoader = () => {
    const accessToken = getAccessToken()
    const isAuthenticated = isUserAuthenticated()

    // Check if user is already authenticated
    if (accessToken && isAuthenticated) {
        // User is already logged in, redirect to home
        throw redirect('/')
    }

    // User is not authenticated, allow access to public route
    return null
}
