import {
    Card,
    Text,
    Stack,
    Group,
    ActionIcon,
    Flex,
    Box
} from '@mantine/core'
import {
    IconDownload,
    IconEye,
    IconFileText,
    IconFileSpreadsheet,
    IconCalendarEvent,
    IconTrash
} from '@tabler/icons-react'

interface FileCardProps {
    file: {
        id: string
        name: string
        type: string
        size: string
        uploadedAt: string
    }
    onView: (fileId: string) => void
    onDownload: (fileId: string) => void
    onDelete: (fileId: string) => void
}

const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf':
            return <IconFileText size={20} color="#e03131" />
        case 'excel':
            return <IconFileSpreadsheet size={20} color="#2f9e44" />
        case 'csv':
            return <IconFileSpreadsheet size={20} color="#1971c2" />
        case 'text':
            return <IconFileText size={20} color="#868e96" />
        default:
            return <IconFileText size={20} />
    }
}

const FileCard = ({ file, onView, onDownload, onDelete }: FileCardProps) => {
    return (
        <Card
            shadow="sm"
            padding="lg"
            withBorder
            style={{
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
            }}
        >
            <Stack gap="sm" h="100%">
                {/* File Icon */}
                <Group justify="center">
                    {getFileIcon(file.type)}
                </Group>

                {/* File Name */}
                <Box style={{ flexGrow: 1 }}>
                    <Text fw={600} size="sm" lineClamp={2} ta="center">
                        {file.name}
                    </Text>
                </Box>

                {/* File Info */}
                <Stack gap="xs">
                    <Text size="xs" c="dimmed" ta="center">
                        Kích thước: {file.size}
                    </Text>
                    <Flex align="center" gap="xs" justify="center">
                        <IconCalendarEvent size={12} />
                        <Text size="xs" c="dimmed">
                            {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                        </Text>
                    </Flex>
                </Stack>

                {/* Action Buttons */}
                <Group justify="center" mt="auto">
                    <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => onView(file.id)}
                    >
                        <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                        variant="light"
                        color="green"
                        onClick={() => onDownload(file.id)}
                    >
                        <IconDownload size={16} />
                    </ActionIcon>
                    <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => onDelete(file.id)}
                    >
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
            </Stack>
        </Card>
    )
}

export default FileCard