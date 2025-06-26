import { Group, Button, Title, Stack } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'

interface PageHeaderProps {
    onBack: () => void
}

export const PageHeader = ({ onBack }: PageHeaderProps) => {
    return (
        <Stack gap='sm'>
            <Group justify='flex-start'>
                <Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
                    Quay lại danh sách
                </Button>
            </Group>
            <Title order={1} size='h2'>
                Chi tiết xét nghiệm
            </Title>
        </Stack>
    )
}
