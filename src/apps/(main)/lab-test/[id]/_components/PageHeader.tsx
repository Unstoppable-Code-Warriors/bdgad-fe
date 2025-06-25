import { Group, Button, Title } from '@mantine/core'
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'

interface PageHeaderProps {
    onBack: () => void
    onSave: () => void
}

export const PageHeader = ({ onBack, onSave }: PageHeaderProps) => {
    return (
        <Group justify='space-between' my='md'>
            <Button variant='subtle' leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
                Quay lại danh sách
            </Button>
            <Title order={2}>Chi tiết xét nghiệm</Title>
            <Button leftSection={<IconDeviceFloppy size={16} />} onClick={onSave} color='green'>
                Lưu thay đổi
            </Button>
        </Group>
    )
}
