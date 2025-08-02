import { redirect } from 'react-router'
import { getAccessToken, isUserAuthenticated, clearTokensOutside, getCurrentUser } from '@/stores/auth.store'
import { getDefaultRouteByRole } from './constant'

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
 * Special handling for password-related routes: clears tokens when token is present in URL
 */
export const nonAuthLoader = () => {
    const accessToken = getAccessToken()
    const isAuthenticated = isUserAuthenticated()
    
    // Check if this is a password-related request with a token
    const currentUrl = new URL(window.location.href)
    const isPasswordRoute = currentUrl.pathname === '/auth/reset-password'
    const hasToken = currentUrl.searchParams.has('token')
    
    // If user is on password page with a token, clear their current session
    if (isPasswordRoute && hasToken && (accessToken || isAuthenticated)) {
        clearTokensOutside()
        return null
    }

    // Check if user is already authenticated for other auth routes
    if (accessToken && isAuthenticated) {
        // Get user and determine appropriate route based on role
        const user = getCurrentUser()
        const roleCode = Number(user?.roles?.[0]?.code)
        const defaultRoute = getDefaultRouteByRole(roleCode)
        
        // User is already logged in, redirect to role-appropriate page
        throw redirect(defaultRoute)
    }

    // User is not authenticated, allow access to public route
    return null
}
