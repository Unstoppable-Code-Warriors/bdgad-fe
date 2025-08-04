import { Button, Paper, Group, Text } from '@mantine/core'
import { IconDeviceFloppy } from '@tabler/icons-react'

interface SaveButtonProps {
    fileCount: number
    onSave: () => void
    disabled?: boolean
}

const SaveButton = ({ fileCount, onSave, disabled = false }: SaveButtonProps) => {
    if (fileCount === 0) return null

    return (
        <Paper p='md' withBorder radius='md' bg='green.0'>
            <Group justify='space-between' align='center'>
                <div>
                    <Text fw={600} size='md' c='green.7'>
                        Lưu file đã upload
                    </Text>
                    <Text size='sm' c='dimmed'>
                        Lưu {fileCount} file đã upload vào hệ thống
                    </Text>
                </div>
                <Button
                    leftSection={<IconDeviceFloppy size='1rem' />}
                    onClick={onSave}
                    size='md'
                    color='green'
                    disabled={disabled}
                >
                    Lưu file
                </Button>
            </Group>
        </Paper>
    )
}

export default SaveButton
