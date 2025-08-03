import { Group, Button } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'

interface SubmitButtonProps {
    fileCount: number
    onSubmit: () => void
}

const SubmitButton = ({ fileCount, onSubmit }: SubmitButtonProps) => {
    if (fileCount === 0) return null

    return (
        <Group justify='flex-end'>
            <Button rightSection={<IconChevronRight size='1rem' />} onClick={onSubmit} size='md'>
                Tiếp tục
            </Button>
        </Group>
    )
}

export default SubmitButton
