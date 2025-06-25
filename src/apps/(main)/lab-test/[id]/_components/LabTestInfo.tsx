import { Paper, Stack, Group, Title, Badge, Grid, Text } from '@mantine/core'
import { IconBarcode, IconCalendar } from '@tabler/icons-react'
import { statusConfig } from '@/types/lab-test.types'
import type { FastQ } from '@/types/fastq'

interface LabTestInfoProps {
    data: {
        labcode: string
        barcode: string
        requestDate: string
        createdAt: string
    }
    latestFastQFile?: FastQ | null
}

export const LabTestInfo = ({ data, latestFastQFile }: LabTestInfoProps) => {
    const getCurrentStatus = () => {
        return latestFastQFile?.status || 'UPLOADED'
    }

    const getStatusColor = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.color || 'gray'
    }

    const getStatusLabel = (status: string) => {
        return statusConfig[status as keyof typeof statusConfig]?.label || status
    }

    return (
        <Paper p='lg' withBorder radius='md' shadow='sm'>
            <Stack gap='md'>
                <Group justify='space-between'>
                    <Title order={3} c='blue.7'>
                        Thông tin xét nghiệm
                    </Title>
                    {latestFastQFile && (
                        <Badge color={getStatusColor(getCurrentStatus())} variant='light' size='lg'>
                            {getStatusLabel(getCurrentStatus())}
                        </Badge>
                    )}
                </Group>

                <Grid>
                    <Grid.Col span={6}>
                        <Group gap='xs'>
                            <IconBarcode size={16} color='var(--mantine-color-blue-6)' />
                            <Text size='sm' c='dimmed'>
                                Mã xét nghiệm:
                            </Text>
                        </Group>
                        <Text fw={600} c='blue' size='lg'>
                            {data.labcode}
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Group gap='xs'>
                            <IconBarcode size={16} color='var(--mantine-color-green-6)' />
                            <Text size='sm' c='dimmed'>
                                Barcode:
                            </Text>
                        </Group>
                        <Text fw={600} ff='monospace' size='lg'>
                            {data.barcode}
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Group gap='xs'>
                            <IconCalendar size={16} color='var(--mantine-color-orange-6)' />
                            <Text size='sm' c='dimmed'>
                                Ngày chỉ định:
                            </Text>
                        </Group>
                        <Text fw={500}>{new Date(data.requestDate).toLocaleDateString('vi-VN')}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Group gap='xs'>
                            <IconCalendar size={16} color='var(--mantine-color-gray-6)' />
                            <Text size='sm' c='dimmed'>
                                Ngày tạo:
                            </Text>
                        </Group>
                        <Text fw={500}>{new Date(data.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </Grid.Col>
                </Grid>
            </Stack>
        </Paper>
    )
}
