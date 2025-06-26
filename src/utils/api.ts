import ky, { type KyInstance, type Options } from 'ky'
import { getAccessToken, getRefreshToken, setTokensOutside, logoutOutside } from '@/stores/auth.store'

// Environment variables or configuration
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'https://auth.bdgad.bio'
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'https://be.bdgad.bio'

// Common configuration for all API instances
const commonConfig: Options = {
    timeout: 30000, // 30 seconds
    retry: {
        limit: 2,
        methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504]
    },
    headers: {
        Accept: 'application/json'
    },
    hooks: {
        beforeError: [
            async (error) => {
                const { response } = error
                if (response && response.body) {
                    try {
                        const errorData = (await response.json()) as unknown
                        error.name = 'APIError'
                        error.message = (errorData as any)?.message || (errorData as any)?.error || 'An error occurred'
                    } catch {
                        // If response is not JSON, keep original error
                    }
                }
                return error
            }
        ]
    }
}

// Parent ky instance with common configuration
export const parentApi = ky.create(commonConfig)

// Auth API instance - for authentication related endpoints
export const authApi = parentApi.extend({
    prefixUrl: AUTH_BASE_URL,
    hooks: {
        beforeRequest: [
            (request) => {
                // For auth API, we might not always need the access token
                // Only add it for specific endpoints that require it (like refresh, logout)
                const url = request.url
                const requiresAuth = url.includes('/refresh') || url.includes('/logout') || url.includes('/me')

                if (requiresAuth) {
                    const token = getAccessToken()
                    if (token) {
                        request.headers.set('Authorization', `Bearer ${token}`)
                    }
                }
            }
        ],
        afterResponse: [
            async (request, _, response) => {
                // Handle auth-specific responses
                if (response.status === 401) {
                    // For auth API, 401 might mean refresh token is invalid
                    const url = request.url
                    if (url.includes('/refresh')) {
                        // Refresh token is invalid, logout user
                        logoutOutside()
                    }
                }
                return response
            }
        ]
    }
})

// Backend API instance - for main application endpoints
export const backendApi = parentApi.extend({
    prefixUrl: BACKEND_BASE_URL,
    hooks: {
        beforeRequest: [
            (request) => {
                // Always try to add access token for backend API
                const token = getAccessToken()
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`)
                }
            }
        ],
        afterResponse: [
            async (request, _, response) => {
                // Handle token refresh for backend API
                if (response.status === 401) {
                    const refreshToken = getRefreshToken()
                    if (refreshToken) {
                        try {
                            // Attempt to refresh the token
                            const refreshResponse = await authApi
                                .post('auth/refresh', {
                                    json: { refreshToken }
                                })
                                .json<{ success: boolean; token: string; refreshToken?: string }>()

                            // Update tokens in store
                            setTokensOutside(refreshResponse.token, refreshResponse.refreshToken)

                            // Retry the original request with new token
                            request.headers.set('Authorization', `Bearer ${refreshResponse.token}`)
                            return ky(request)
                        } catch (refreshError) {
                            // Refresh failed, logout user
                            logoutOutside()
                            // Redirect to login page
                            if (typeof window !== 'undefined') {
                                window.location.href = '/login'
                            }
                            throw refreshError
                        }
                    } else {
                        // No refresh token available, logout
                        logoutOutside()
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login'
                        }
                    }
                }
                return response
            }
        ]
    }
})

// Utility functions for creating custom API instances
export const createAuthenticatedApi = (baseUrl: string, additionalConfig: Options = {}): KyInstance => {
    return parentApi.extend({
        prefixUrl: baseUrl,
        ...additionalConfig,
        hooks: {
            beforeRequest: [
                (request) => {
                    const token = getAccessToken()
                    if (token) {
                        request.headers.set('Authorization', `Bearer ${token}`)
                    }
                },
                ...(additionalConfig.hooks?.beforeRequest || [])
            ],
            afterResponse: [
                async (_, __, response) => {
                    if (response.status === 401) {
                        logoutOutside()
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login'
                        }
                    }
                    return response
                },
                ...(additionalConfig.hooks?.afterResponse || [])
            ],
            beforeError: [...commonConfig.hooks!.beforeError!, ...(additionalConfig.hooks?.beforeError || [])]
        }
    })
}

// Helper function to create API instances for different microservices
export const createServiceApi = (serviceName: string, baseUrl?: string): KyInstance => {
    const serviceBaseUrl = baseUrl || `${BACKEND_BASE_URL}/${serviceName}`
    return backendApi.extend({
        prefixUrl: serviceBaseUrl
    })
}

// Export commonly used API methods with better error handling
export const apiUtils = {
    // GET request with automatic token handling
    get: async <T = any>(url: string, options?: Options): Promise<T> => {
        return backendApi.get(url, options).json<T>()
    },

    // POST request with automatic token handling
    post: async <T = any>(url: string, data?: any, options?: Options): Promise<T> => {
        return backendApi.post(url, { json: data, ...options }).json<T>()
    },

    // PUT request with automatic token handling
    put: async <T = any>(url: string, data?: any, options?: Options): Promise<T> => {
        return backendApi.put(url, { json: data, ...options }).json<T>()
    },

    // DELETE request with automatic token handling
    delete: async <T = any>(url: string, options?: Options): Promise<T> => {
        return backendApi.delete(url, options).json<T>()
    },

    // PATCH request with automatic token handling
    patch: async <T = any>(url: string, data?: any, options?: Options): Promise<T> => {
        return backendApi.patch(url, { json: data, ...options }).json<T>()
    }
}

// Auth-specific API utilities
export const authUtils = {
    // POST request for auth endpoints
    post: async <T = any>(url: string, data?: any, options?: Options): Promise<T> => {
        return authApi.post(url, { json: data, ...options }).json<T>()
    },

    // GET request for auth endpoints
    get: async <T = any>(url: string, options?: Options): Promise<T> => {
        return authApi.get(url, options).json<T>()
    }
}
