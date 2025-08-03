import { NavLink, Text, Group, Box, Tooltip } from '@mantine/core'
import { IconHome, IconCalendar, IconBuilding, IconUser } from '@tabler/icons-react'

interface SidebarProps {
    activeMenu: string
    onMenuClick: (item: any) => void
    isCollapsed: boolean
}

const Sidebar = ({ activeMenu, onMenuClick, isCollapsed }: SidebarProps) => {
    const mainMenuItems = [
        { icon: IconHome, label: 'Dashboard', id: 'dashboard' },
        { icon: IconCalendar, label: 'Appointments', id: 'appointments' },
        { icon: IconBuilding, label: 'Specialities', id: 'specialities' }
    ]

    const pageMenuItems = [{ icon: IconUser, label: 'Profile', id: 'profile' }]

    const renderNavItem = (item: any) => {
        const isActive = activeMenu === item.label
        const navItem = (
            <NavLink
                key={item.id}
                active={isActive}
                label={!isCollapsed ? item.label : undefined}
                leftSection={<item.icon size={20} />}
                onClick={() => onMenuClick(item)}
                variant='filled'
                color='cyan'
                style={{
                    marginBottom: 4,
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                }}
            />
        )

        return isCollapsed ? (
            <Tooltip label={item.label} position='right' key={item.id}>
                {navItem}
            </Tooltip>
        ) : (
            navItem
        )
    }

    return (
        <Box
            className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-800 text-white shadow-lg h-full transition-all duration-300`}
        >
            {/* Logo Section */}
            <Box p='md' className='border-b border-gray-700'>
                <Group>
                    <Box className='w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <Text c='white' fw={700} size='sm'>
                            B
                        </Text>
                    </Box>
                    {!isCollapsed && (
                        <Text c='cyan' fw={700} size='xl'>
                            BDGAD
                        </Text>
                    )}
                </Group>
            </Box>

            {/* Main Section */}
            <Box p='md'>
                {!isCollapsed && (
                    <Text size='sm' fw={600} c='gray.4' mb='md' tt='uppercase'>
                        Main
                    </Text>
                )}
                {mainMenuItems.map(renderNavItem)}
            </Box>

            {/* Pages Section */}
            <Box p='md'>
                {!isCollapsed && (
                    <Text size='sm' fw={600} c='gray.4' mb='md' tt='uppercase'>
                        Pages
                    </Text>
                )}
                {pageMenuItems.map(renderNavItem)}
            </Box>
        </Box>
    )
}

export default Sidebar
