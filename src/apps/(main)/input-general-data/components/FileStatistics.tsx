import { Badge, Card, Group, Text } from '@mantine/core'

interface FileStatisticsProps {
    totalFiles: number
    totalCategories: number
}

const FileStatistics = ({ totalFiles, totalCategories }: FileStatisticsProps) => {
    if (totalFiles === 0 && totalCategories === 0) return null

    return (
        <Card shadow='sm' padding='lg' withBorder>
            <Group justify='space-between'>
                <div className=' flex flex-col gap-2'>
                    <Text size='xl' fw={600}>
                        Tổng quan
                    </Text>
                    <div>
                        Tổng danh mục: <Badge> {totalCategories} danh mục </Badge>
                    </div>
                    {/* <div>
                        Tổng tệp tin: <Badge> {totalFiles} tệp tin </Badge>
                    </div> */}
                </div>
            </Group>
        </Card>
    )
}

export default FileStatistics
