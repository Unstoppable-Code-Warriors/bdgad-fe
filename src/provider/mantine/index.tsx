import { MantineProvider } from '@mantine/core'

export const BaseMantineProvider = ({ children }: { children: React.ReactNode }) => {
    return <MantineProvider> {children} </MantineProvider>
}
