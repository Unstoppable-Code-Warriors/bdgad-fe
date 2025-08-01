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
import PatientInfoPage from '@/apps/(main)/patient-folder/page'
import PatientDetailPage from '@/apps/(main)/patient-detail/page'
import InputGeneralDataPage from '@/apps/(main)/input-general-data/page'
import CategoryDetailPage from '@/apps/(main)/input-general-data/[id]/page'
import NewPasswordPage from '@/apps/auth/new-password/page'
import CallbackPage from '@/apps/auth/callback/page'
import LabTestPage from '@/apps/(main)/lab-test/page'
import LabTestDetailPage from '@/apps/(main)/lab-test/[id]/page'
import AnalysisPage from '@/apps/(main)/analysis/page'
import AnalysisDetailPage from '@/apps/(main)/analysis/[id]/page'
import ValidationPage from '@/apps/(main)/validation/page'
import ValidationDetailPage from '@/apps/(main)/validation/[id]/page'
import ProfilePage from '@/apps/(main)/profile/page'
import SessionDetailPage from '@/apps/(main)/patient-detail/session/[sessionId]/page'
import OCRPage from '@/apps/(main)/input-info/ocr/page'

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
                    },
                    {
                        path: 'new-password',
                        element: <NewPasswordPage />
                    },
                    {
                        path: 'callback',
                        element: <CallbackPage />
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
                        path: 'profile',
                        element: <ProfilePage />
                    },
                    {
                        path: 'import-file/input',
                        element: <InputInfoPage />
                    },
                    {
                        path: 'input-general-data',
                        element: <Outlet />,
                        children: [
                            {
                                index: true,
                                element: <InputGeneralDataPage />
                            },
                            {
                                path: ':id',
                                element: <CategoryDetailPage />
                            }
                        ]
                    },
                    {
                        path: 'input-info',
                        element: <Outlet />,
                        children: [
                            {
                                index: true,
                                element: <InputInfoPage />
                            },
                            {
                                path: 'ocr',
                                element: <OCRPage />
                            }
                        ]
                    },
                    {
                        path: '/patient-folder',
                        element: <PatientInfoPage />
                    },
                    {
                        path: '/patient-detail/:id',
                        element: <PatientDetailPage />
                    },
                    {
                        path: '/patient-detail/:id/session/:sessionId',
                        element: <SessionDetailPage />
                    },
                    {
                        path: '/lab-test',
                        element: <Outlet />,
                        children: [
                            {
                                index: true,
                                element: <LabTestPage />
                            },
                            {
                                path: ':id',
                                element: <LabTestDetailPage />
                            }
                        ]
                    },
                    {
                        path: '/analysis',
                        element: <Outlet />,
                        children: [
                            {
                                index: true,
                                element: <AnalysisPage />
                            },
                            {
                                path: ':id',
                                element: <AnalysisDetailPage />
                            }
                        ]
                    },
                    {
                        path: '/validation',
                        element: <Outlet />,
                        children: [
                            {
                                index: true,
                                element: <ValidationPage />
                            },
                            {
                                path: ':id',
                                element: <ValidationDetailPage />
                            }
                        ]
                    }
                ]
            }
        ]
    }
])
