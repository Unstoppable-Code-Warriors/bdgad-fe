import Logo from '@/components/logo'
import { AppShell, Group, Text, Stack, Badge } from '@mantine/core'
import UserButton from './user-button'
import { useUser } from '@/services/hook/auth.hook'

const Header = () => {
    const { data, isLoading } = useUser()

    return (
        <AppShell.Header>
            <Group h='100%' px='md' justify='space-between'>
                <Logo />
                <Group gap='md' align='center'>
                    {!isLoading && data?.user && (
                        <Stack gap={3} align='flex-end'>
                            <Text size='sm' fw={500}>
                                {data.user.email}
                            </Text>
                            <Group gap='xs'>
                                {data.user.roles?.map((role, index) => (
                                    <Badge key={index} variant='light' size='sm'>
                                        {role.name}
                                    </Badge>
                                ))}
                            </Group>
                        </Stack>
                    )}
                    <UserButton />
                </Group>
            </Group>
        </AppShell.Header>
    )
}

export default Header
