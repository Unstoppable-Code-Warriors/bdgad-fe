import { createBrowserRouter, Outlet } from 'react-router'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import NotFound from '@/components/NotFound'
import { BaseMantineProvider } from '@/provider/mantine'
const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return <BaseMantineProvider>{children}</BaseMantineProvider>
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
        children: [
            {
                path: '/',
                element: <Login />
            },
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/dashboard',
                element: <Dashboard />
            }
        ]
    }
])
