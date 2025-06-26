import { Group, Button, Title } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'

interface PageHeaderProps {
    onBack: () => void
}

export const PageHeader = ({ onBack }: PageHeaderProps) => {
    return (
        <Group justify='space-between' my='md'>
            <Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
                Quay lại danh sách
            </Button>
            <Title order={2}>Chi tiết phân tích</Title>
        </Group>
    )
}
