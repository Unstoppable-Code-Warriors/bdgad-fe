import { useNavigate } from 'react-router'
import { Container, Title, Text, Button, Center } from '@mantine/core'

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <Container size='md' className='min-h-screen flex items-center'>
            <Center w='100%'>
                <div style={{ textAlign: 'center' }}>
                    <Title order={1} size={96} fw={700} c='gray.9' mb='lg'>
                        404
                    </Title>
                    <Title order={2} size={32} fw={600} c='gray.7' mb='lg'>
                        Page Not Found
                    </Title>
                    <Text c='dimmed' mb='xl'>
                        The page you're looking for doesn't exist.
                    </Text>
                    <Button size='lg' onClick={() => navigate('/')}>
                        Go Home
                    </Button>
                </div>
            </Center>
        </Container>
    )
}

export default NotFound
