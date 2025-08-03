import { logoutOutside } from '@/stores/auth.store'
import { useNavigate } from 'react-router'
import { Avatar, Loader, Menu } from '@mantine/core'
import { IconUserCircle, IconLogout, IconUser } from '@tabler/icons-react'
import { useUser } from '@/services/hook/auth.hook'

const UserButton = () => {
    const navigate = useNavigate()
    const { data, isLoading } = useUser()

    const handleLogout = () => {
        logoutOutside()
        navigate('/auth/login')
    }

    const handleProfile = () => {
        navigate('/profile')
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
                <Menu.Divider />

                <Menu.Item leftSection={<IconUser size={16} />} onClick={handleProfile}>
                    Thông tin cá nhân
                </Menu.Item>

                <Menu.Item color='red' leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                    Đăng xuất
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    )
}

export default UserButton
