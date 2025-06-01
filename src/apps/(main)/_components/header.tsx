import Logo from '@/components/logo'
import { AppShell, Group } from '@mantine/core'
import { UserButton } from '@stackframe/react'

const Header = () => {
    return (
        <AppShell.Header>
            <Group h='100%' px='md' justify='space-between'>
                <Logo />
                <UserButton />
            </Group>
        </AppShell.Header>
    )
}

export default Header
