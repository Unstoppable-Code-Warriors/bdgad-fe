import { Stack, Text, Loader, Paper, Group } from '@mantine/core'
import { IconScan } from '@tabler/icons-react'

interface ProcessingStepProps {
    loading: boolean
}

const ProcessingStep = ({ loading }: ProcessingStepProps) => {
    return (
        <Stack gap='xl' align='center' mt='xl'>
            <Paper p='xl' radius='md' bg='blue.0' w='100%' maw={400}>
                <Group justify='center' gap='lg'>
                    <IconScan size={48} color='var(--mantine-color-blue-6)' />
                    <Loader color='blue' size='lg' />
                </Group>
            </Paper>

            <Stack gap='sm' align='center'>
                <Text size='xl' fw={600} c='blue.6'>
                    Processing Image...
                </Text>
                <Text c='dimmed' ta='center' maw={400}>
                    We're using advanced OCR technology to extract information from your medical test requisition. This
                    may take a few moments.
                </Text>
            </Stack>

            <Stack gap='xs' align='center'>
                <Text size='sm' c='dimmed'>
                    • Analyzing image quality
                </Text>
                <Text size='sm' c='dimmed'>
                    • Extracting text data
                </Text>
                <Text size='sm' c='dimmed'>
                    • Organizing medical information
                </Text>
                <Text size='sm' c='dimmed'>
                    • Validating extracted data
                </Text>
            </Stack>
        </Stack>
    )
}

export default ProcessingStep
