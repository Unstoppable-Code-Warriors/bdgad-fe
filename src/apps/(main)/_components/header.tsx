import Logo from '@/components/logo'
import { AppShell, Group, Text, Stack, Badge } from '@mantine/core'
import UserButton from './user-button'
import NotificationBell from './notification-bell'
import { useUser } from '@/services/hook/auth.hook'
const Header = () => {
    const { data , isLoading } = useUser()
    const userProfile = data?.data?.user

    return (
        <AppShell.Header>
            <Group h='100%' px='md' justify='space-between'>
                <Logo />
                <Group gap='md' align='center'>
                    {!isLoading && userProfile && (
                        <Stack gap={3} align='flex-end'>
                            <Text size='sm' fw={500}>
                                {userProfile.email}
                            </Text>
                            <Group gap='xs'>
                                {userProfile.roles?.map((role: any, index: number) => (
                                    <Badge key={index} variant='light' size='sm'>
                                        {role.name}
                                    </Badge>
                                ))}
                            </Group>
                        </Stack>
                    )}
                    
                    {/* Notification Bell */}
                    <NotificationBell />
                    
                    <UserButton />
                </Group>
            </Group>
        </AppShell.Header>
    )
}

export default Header
