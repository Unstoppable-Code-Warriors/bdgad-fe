import { Card, Group, Text } from '@mantine/core'

interface FileStatisticsProps {
    totalFiles: number
}

const FileStatistics = ({ totalFiles }: FileStatisticsProps) => {
    if (totalFiles === 0) return null

    return (
        <Card shadow="sm" padding="lg" withBorder>
            <Group justify="space-between">
                <div>
                    <Text fw={600}>Tổng quan</Text>
                    <Text size="sm" c="dimmed">
                        Tổng cộng {totalFiles} file
                    </Text>
                </div>
            </Group>
        </Card>
    )
}

export default FileStatistics