import Logo from '@/components/logo'
import { logoutOutside } from '@/stores/auth.store'
import { AppShell, Button, Group } from '@mantine/core'
import { useNavigate } from 'react-router'

const Header = () => {
    const navigate = useNavigate()
    const handleLogout = () => {
        logoutOutside()
        navigate('/auth/login')
    }
    return (
        <AppShell.Header>
            <Group h='100%' px='md' justify='space-between'>
                <Logo />
                <Button variant='subtle' onClick={handleLogout}>
                    Logout
                </Button>
            </Group>
        </AppShell.Header>
    )
}

export default Header
