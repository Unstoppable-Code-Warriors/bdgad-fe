import { logoutOutside } from '@/stores/auth.store'
import { useNavigate } from 'react-router'
import { Avatar, Badge, Loader, Menu } from '@mantine/core'
import { IconUserCircle, IconLogout } from '@tabler/icons-react'
import { useUser } from '@/services/hook/auth.hook'

const UserButton = () => {
    const navigate = useNavigate()
    const { data, isLoading } = useUser()

    const handleLogout = () => {
        logoutOutside()
        navigate('/auth/login')
    }

    if (isLoading) {
        return <Loader />
    }

    if (!data) {
        return null
    }

    return (
        <Menu shadow='md' width={200} withArrow>
            <Menu.Target>
                <Avatar variant='filled' color='blue' radius='xl' className='cursor-pointer'>
                    <IconUserCircle size={24} />
                </Avatar>
            </Menu.Target>

            <Menu.Dropdown>    
                <Menu.Label>{data.user.name}</Menu.Label>
                <Menu.Label>
                    {data.user.roles.map((role) => (
                        <Badge>{role.name}</Badge>
                    ))}
                </Menu.Label>

                <Menu.Divider />

                <Menu.Item color='red' leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    )
}

export default UserButton
