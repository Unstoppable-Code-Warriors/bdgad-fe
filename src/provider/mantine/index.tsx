import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dropzone/styles.css'

import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'

export const BaseMantineProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <MantineProvider>
            <ModalsProvider>
                {children}
                <Notifications />
            </ModalsProvider>
        </MantineProvider>
    )
}
