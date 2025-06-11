import { Container, Center, Title } from '@mantine/core'
import ImportStep from './components/ImportStep'

const InputInfoPage = () => {
    const handleComplete = (data: any) => {
        console.log('Form completed with data:', data)
    }

    return (
        <Container size='xl' py='xl'>
            <Center mb='xl'>
                <div>
                    <Title order={1} ta='center' mb='sm'>
                        Medical Test Requisition Input
                    </Title>
                </div>
            </Center>

            <ImportStep onComplete={handleComplete} />
        </Container>
    )
}

export default InputInfoPage
