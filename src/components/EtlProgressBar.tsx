import { Card, Text, Progress, Group, Stack, ThemeIcon, Box } from '@mantine/core'
import { IconClock, IconCheck, IconAlertTriangle } from '@tabler/icons-react'
import { calculateEtlProgress } from '@/utils/etl-progress'

interface EtlProgressBarProps {
    startTime: string | null
    status: string | null
    etlCompletedAt: string | null
}

export const EtlProgressBar = ({ startTime, status, etlCompletedAt }: EtlProgressBarProps) => {
    // Don't show progress bar if there's no start time or not processing
    if (!startTime || status !== 'processing') {
        return null
    }

    const progress = calculateEtlProgress(startTime)

    // Determine color based on progress and status
    let color = 'blue'
    let icon = <IconClock size={20} />

    if (etlCompletedAt) {
        color = 'green'
        icon = <IconCheck size={20} />
    } else if (progress >= 90) {
        color = 'orange'
        icon = <IconAlertTriangle size={20} />
    }

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Stack gap='md'>
                <Group gap='sm'>
                    <ThemeIcon size='md' radius='md' variant='light' color={color}>
                        {icon}
                    </ThemeIcon>
                    <Box>
                        <Text fw={600} size='sm' c={color}>
                            Tiến độ xử lý ETL
                        </Text>
                    </Box>
                </Group>

                <Stack gap='xs'>
                    <Group justify='space-between'>
                        <Text size='sm' c='dimmed'>
                            Tiến độ:
                        </Text>
                        <Text size='sm' fw={600}>
                            {progress}%
                        </Text>
                    </Group>

                    <Progress
                        value={progress}
                        color={color}
                        size='lg'
                        radius='md'
                        striped={status === 'processing'}
                        animated={status === 'processing'}
                    />

                    <Text size='xs' c='dimmed'>
                        Bắt đầu: {new Date(startTime).toLocaleString('vi-VN')}
                    </Text>
                </Stack>
            </Stack>
        </Card>
    )
}
