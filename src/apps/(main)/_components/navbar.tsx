import { useUser } from '@/services/hook/auth.hook'
import { Role } from '@/utils/constant'
import { AppShell, Loader, Stack, UnstyledButton, Text, Box } from '@mantine/core'
import { IconUser } from '@tabler/icons-react'
import { Link, useLocation } from 'react-router'

export const navItems = [
    {
        label: 'Danh sách bệnh nhân',
        icon: IconUser,
        href: '/patient-info',
        roles: [Role.STAFF]
    },
    {
        label: 'Import master data',
        icon: IconUser,
        href: '/input-master-data',
        roles: [Role.STAFF]
    },
    {
        label: 'Lab Testing',
        icon: IconUser,
        href: '/lab-test',
        roles: [Role.LAB_TESTING_TECHNICIAN]
    }
]

const Navbar = () => {
    const { data, isLoading } = useUser()
    const location = useLocation()

    if (isLoading) return <Loader />
    if (!data) return null

    return (
        <AppShell.Navbar p={0} style={{ backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
            <Box p='md'></Box>

            <Stack gap={4} px='md' pb='md'>
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.href)
                    const hasPermission = data.user.roles.some((role) => item.roles.includes(parseInt(role.code)))

                    if (!hasPermission) return null

                    return (
                        <UnstyledButton
                            key={item.href}
                            component={Link}
                            to={item.href}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                backgroundColor: isActive ? '#dbeafe' : 'transparent',
                                color: isActive ? '#1d4ed8' : '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                }
                            }}
                        >
                            <item.icon size='18' />
                            <Text size='sm' fw={500}>
                                {item.label}
                            </Text>
                        </UnstyledButton>
                    )
                })}
            </Stack>
        </AppShell.Navbar>
    )
}

export default Navbar
