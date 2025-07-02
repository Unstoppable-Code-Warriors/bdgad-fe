import { useUser } from '@/services/hook/auth.hook'
import {
    Container,
    Loader,
    Flex,
    Text
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import ModalChangePassword from './components/modalChangePassword'
import UpdateProfileUser from './components/updateProfileUser'

const ProfilePage = () => {
    const { data, isLoading } = useUser()
    const userProfile = data?.data?.user
    
    // Change password modal state
    const [opened, { open, close }] = useDisclosure(false)

    if (isLoading) {
        return (
            <Container size='lg' py='xl'>
                <Flex justify='center' align='center' style={{ minHeight: '400px' }}>
                    <Loader size='xl' />
                </Flex>
            </Container>
        )
    }

    if (!data || !userProfile) {
        return (
            <Container size='lg' py='xl'>
                <Flex justify='center' align='center' style={{ minHeight: '400px' }}>
                    <Text ta='center' c='dimmed' size='lg'>
                        Không thể tải thông tin người dùng
                    </Text>
                </Flex>
            </Container>
        )
    }

    return (
        <Container size='lg' py='xl'>
            <UpdateProfileUser
                userProfile={userProfile}
                onChangePassword={open}
            />

            {/* Change Password Modal */}
            <ModalChangePassword
                opened={opened}
                onClose={close}
            />
        </Container>
    )
}

export default ProfilePage
