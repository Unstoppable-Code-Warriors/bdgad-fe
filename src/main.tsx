import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { MantineProvider } from '@mantine/core'
import { router } from './provider/react-router'

import '@/styles/index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MantineProvider>
            <RouterProvider router={router} />
        </MantineProvider>
    </StrictMode>
)
