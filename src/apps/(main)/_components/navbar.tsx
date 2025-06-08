import { useUser } from '@/services/hook/auth.hook'
import { Role } from '@/utils/constant'
import { AppShell, Button, Loader, Stack } from '@mantine/core'
import { IconTextScan2 } from '@tabler/icons-react'
import { Link, useLocation } from 'react-router'

const navItems = [
    {
        label: 'Input info',
        icon: IconTextScan2,
        href: '/input-info',
        roles: [Role.STAFF]
    }
]

const Navbar = () => {
    const { data, isLoading } = useUser()
    const location = useLocation()
    if (isLoading) return <Loader />
    if (!data) return null
    return (
        <AppShell.Navbar p='md'>
            <Stack>
                {navItems.map((item) => {
                    const isActive = location.pathname.split('/')[1] === item.href.split('/')[1]
                    return (
                        data.user.roles.some((role) => item.roles.includes(role.id)) && (
                            <Button
                                key={item.href}
                                component={Link}
                                to={item.href}
                                justify='flex-start'
                                variant={isActive ? 'filled' : 'subtle'}
                                leftSection={<item.icon />}
                            >
                                {item.label}
                            </Button>
                        )
                    )
                })}
            </Stack>
        </AppShell.Navbar>
    )
}

export default Navbar
