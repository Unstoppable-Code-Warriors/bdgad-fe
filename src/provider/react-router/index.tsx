import { createBrowserRouter, Outlet } from 'react-router'
import NotFound from '@/components/NotFound'
import { BaseMantineProvider } from '@/provider/mantine'
import { StackAuthProvider, HandlerRoutes } from '@/provider/stack-auth'
import { Suspense } from 'react'
import LoadingScreen from '@/components/loading-screen'
import MainLayout from '@/apps/(main)/layout'
import HomePage from '@/apps/(main)/page'
import AccountSettingsPage from '@/apps/(main)/account-settings/page'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Suspense fallback={null}>
            <StackAuthProvider>
                <BaseMantineProvider>{children}</BaseMantineProvider>
            </StackAuthProvider>
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
                path: '/auth/*',
                element: <HandlerRoutes />
            },
            {
                path: '/',
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <HomePage />
                    },
                    {
                        path: 'account-settings',
                        element: <AccountSettingsPage />
                    }
                ]
            }
        ]
    }
])
