import { createBrowserRouter, Outlet } from 'react-router'
import NotFound from '@/components/NotFound'
import { BaseMantineProvider } from '@/provider/mantine'
import { Suspense } from 'react'
import LoadingScreen from '@/components/loading-screen'
import MainLayout from '@/apps/(main)/layout'
import HomePage from '@/apps/(main)/page'
import LoginPage from '@/apps/auth/login/page'
import { nonAuthLoader, authLoader } from '@/utils/loader'
import ForgotPasswordPage from '@/apps/auth/forgot-password/page'
import ResetPasswordPage from '@/apps/auth/reset-password/page'
import { TanstackQueryProvider } from '../tanstack-query'
import InputInfoPage from '@/apps/(main)/input-info/page'
const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Suspense fallback={null}>
            <TanstackQueryProvider>
                <BaseMantineProvider>{children}</BaseMantineProvider>
            </TanstackQueryProvider>
        </Suspense>
    )
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <RootLayout>
                <Outlet />
            </RootLayout>
        ),
        errorElement: (
            <RootLayout>
                <NotFound />
            </RootLayout>
        ),
        hydrateFallbackElement: (
            <div className='h-screen w-screen'>
                <LoadingScreen />
            </div>
        ),
        children: [
            {
                loader: nonAuthLoader,
                path: '/auth',
                element: <Outlet />,
                children: [
                    {
                        path: 'login',
                        element: <LoginPage />
                    },
                    {
                        path: 'forgot-password',
                        element: <ForgotPasswordPage />
                    },
                    {
                        path: 'reset-password',
                        element: <ResetPasswordPage />
                    }
                ]
            },
            {
                loader: authLoader,
                path: '/',
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <HomePage />
                    },
                    {
                        path: 'import-file/input',
                        element: <InputInfoPage />
                    }
                ]
            }
        ]
    }
])
