import { Paper, Group, Text, Button } from '@mantine/core'
import { IconDeviceFloppy } from '@tabler/icons-react'

interface SubmitButtonProps {
    fileCount: number
    onSubmit: () => void
}

const SubmitButton = ({ fileCount, onSubmit }: SubmitButtonProps) => {
    if (fileCount === 0) return null

    return (
        <Paper p='md' withBorder radius='md' bg='blue.0'>
            <Group justify='space-between' align='center'>
                <div>
                    <Text fw={600} size='md'>
                        Sẵn sàng để gửi
                    </Text>
                    <Text size='sm' c='dimmed'>
                        {fileCount} file(s) đã được chọn để tải lên
                    </Text>
                </div>
                <Button leftSection={<IconDeviceFloppy size='1rem' />} onClick={onSubmit} size='md'>
                    Gửi file
                </Button>
            </Group>
        </Paper>
    )
}

export default SubmitButton
