import { Group, Title, Button } from '@mantine/core'
import { IconUpload } from '@tabler/icons-react'

interface PageHeaderProps {
    onImport: () => void
}

const PageHeader = ({ onImport }: PageHeaderProps) => {
    return (
        <Group justify="space-between">
            <Title order={2}></Title>
            <Group>
                <Button 
                    leftSection={<IconUpload size={16} />}
                    onClick={onImport}
                >
                    Tải lên file mới
                </Button>
            </Group>
        </Group>
    )
}

export default PageHeader