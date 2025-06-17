import { Group, Title, Button } from '@mantine/core'
import { IconUpload, IconFileImport } from '@tabler/icons-react'

interface PageHeaderProps {
    onNavigateToUpload: () => void
    onImport: () => void
}

const PageHeader = ({ onNavigateToUpload, onImport }: PageHeaderProps) => {
    return (
        <Group justify="space-between">
            <Title order={2}>Import Master Data</Title>
            <Group>
                <Button 
                    variant="light"
                    leftSection={<IconUpload size={16} />}
                    onClick={onNavigateToUpload}
                >
                    Tải lên file mới
                </Button>
                <Button 
                    leftSection={<IconFileImport size={16} />}
                    onClick={onImport}
                >
                    Import
                </Button>
            </Group>
        </Group>
    )
}

export default PageHeader