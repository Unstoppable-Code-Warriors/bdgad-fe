import { useUser } from '@/services/hook/auth.hook'
import { Role } from '@/utils/constant'
import { AppShell, Loader, Stack, Collapse, UnstyledButton, Text, Box } from '@mantine/core'
import { IconUpload, IconChevronRight, IconFileImport, IconFileExport } from '@tabler/icons-react'
import { Link, useLocation } from 'react-router'
import { useState } from 'react'

const navItems = [
    {
        label: 'Import File',
        icon: IconUpload,
        href: '/import-file',
        roles: [Role.STAFF],
        subItems: [
            {
                label: 'Import Input',
                icon: IconFileImport,
                href: '/import-file/input',
                roles: [Role.STAFF]
            },
            {
                label: 'Import Output',
                icon: IconFileExport,
                href: '/import-file/output',
                roles: [Role.STAFF]
            }
        ]
    }
]

const Navbar = () => {
    const { data, isLoading } = useUser()
    const location = useLocation()
    const [openItems, setOpenItems] = useState<string[]>([])

    if (isLoading) return <Loader />
    if (!data) return null

    const toggleItem = (href: string) => {
        setOpenItems((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
    }

    return (
        <AppShell.Navbar p={0} style={{ backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
            <Box p='md'></Box>

            <Stack gap={4} px='md' pb='md'>
                {navItems.map((item) => {              
                    const isActive = location.pathname.startsWith(item.href)
                    const hasPermission = data.user.roles.some((role) => item.roles.includes(role.id))
                    const isOpen = openItems.includes(item.href)

                    if (!hasPermission) return null

                    // If item has sub-items, render as collapsible
                    if (item.subItems) {
                        return (
                            <Box key={item.href}>
                                <UnstyledButton
                                    onClick={() => toggleItem(item.href)}
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
                                        border: '1px solid transparent',
                                        cursor: 'pointer'
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
                                    <item.icon size='18' style={{ flexShrink: 0 }} />
                                    <Text size='sm' fw={500} style={{ flex: 1 }}>
                                        {item.label}
                                    </Text>
                                    <Box
                                        style={{
                                            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease'
                                        }}
                                    >
                                        <IconChevronRight size='16' />
                                    </Box>
                                </UnstyledButton>

                                <Collapse in={isOpen}>
                                    <Stack gap={2} mt={4} ml={32}>
                                        {item.subItems.map((subItem) => {
                                            const subItemHasPermission = data.user.roles.some((role) =>
                                                subItem.roles.includes(role.id)
                                            )
                                            const subItemIsActive = location.pathname === subItem.href

                                            if (!subItemHasPermission) return null

                                            return (
                                                <UnstyledButton
                                                    key={subItem.href}
                                                    component={Link}
                                                    to={subItem.href}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 0px',
                                                        borderRadius: '6px',
                                                        backgroundColor: subItemIsActive ? '#dbeafe' : 'transparent',
                                                        color: subItemIsActive ? '#1d4ed8' : '#6b7280',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        transition: 'all 0.2s ease',
                                                        textDecoration: 'none',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!subItemIsActive) {
                                                            e.currentTarget.style.backgroundColor = '#f1f5f9'
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!subItemIsActive) {
                                                            e.currentTarget.style.backgroundColor = 'transparent'
                                                        }
                                                    }}
                                                >
                                                    <Box
                                                        style={{
                                                            width: '3px',
                                                            height: '3px',
                                                            borderRadius: '50%',
                                                            backgroundColor: subItemIsActive ? '#1d4ed8' : '#9ca3af'
                                                        }}
                                                    />
                                                    <subItem.icon size='14' />
                                                    <Text size='sm' fw={subItemIsActive ? 500 : 400}>
                                                        {subItem.label}
                                                    </Text>
                                                </UnstyledButton>
                                            )
                                        })}
                                    </Stack>
                                </Collapse>
                            </Box>
                        )
                    }

                    // Regular menu item without sub-items
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
