import { Card, Text, Group, Badge, Divider, Stack, ThemeIcon, Box, Grid, Paper } from '@mantine/core'
import { IconFlask, IconCalendar, IconBarcode, IconClock } from '@tabler/icons-react'
import type { AnalysisSessionDetail, FastqFilePairResponse, EtlResultResponse } from '@/types/analysis'
import { analysisStatusConfig } from '@/types/analysis'

interface AnalysisInfoProps {
    data: AnalysisSessionDetail
    latestFastqFilePair: FastqFilePairResponse | null
    latestEtlResult: EtlResultResponse | null
}

const getStatusColor = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.label || status
}

export const AnalysisInfo = ({ data, latestFastqFilePair, latestEtlResult }: AnalysisInfoProps) => {
    return (
        <Card shadow='sm' padding='xl' radius='lg' withBorder>
            <Group gap='sm' mb='xl'>
                <ThemeIcon size='lg' radius='md' variant='light' color='blue'>
                    <IconFlask size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} size='xl'>
                        Thông tin phân tích
                    </Text>
                    <Text size='sm' c='dimmed'>
                        Chi tiết về mẫu và quá trình xử lý
                    </Text>
                </Box>
            </Group>

            <Grid gutter='lg'>
                {/* Basic Information */}
                <Grid.Col span={6}>
                    <Paper p='lg' radius='md' bg='gray.0' withBorder>
                        <Stack gap='md'>
                            <Group gap='xs'>
                                <IconBarcode size={16} color='var(--mantine-color-blue-6)' />
                                <Text size='sm' fw={600} c='blue'>
                                    Thông tin mẫu
                                </Text>
                            </Group>

                            <Stack gap='sm'>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Labcode:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {data.labcode.length > 1
                                            ? Array.from(data.labcode).join(', ')
                                            : data.labcode[0]}
                                    </Text>
                                </Group>

                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Barcode:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {data.barcode}
                                    </Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid.Col>

                {/* Date Information */}
                <Grid.Col span={6}>
                    <Paper p='lg' radius='md' bg='gray.0' withBorder>
                        <Stack gap='md'>
                            <Group gap='xs'>
                                <IconCalendar size={16} color='var(--mantine-color-green-6)' />
                                <Text size='sm' fw={600} c='green'>
                                    Thời gian
                                </Text>
                            </Group>

                            <Stack gap='sm'>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Ngày yêu cầu:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {new Date(data.requestDateAnalysis).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Group>

                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Ngày tạo:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {new Date(data.createdAt).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>

            <Divider my='xl' />

            {/* Status Information */}
            <Stack gap='lg'>
                <Group gap='xs'>
                    <IconClock size={16} color='var(--mantine-color-orange-6)' />
                    <Text size='md' fw={600} c='orange'>
                        Trạng thái xử lý
                    </Text>
                </Group>

                <Grid gutter='lg'>
                    <Grid.Col span={6}>
                        <Paper p='md' radius='md' bg='blue.0' withBorder>
                            <Stack gap='sm' align='center'>
                                <Text size='sm' fw={500} c='blue'>
                                    Trạng thái FastQ
                                </Text>
                                {latestFastqFilePair?.status ? (
                                    <Badge
                                        color={getStatusColor(latestFastqFilePair.status)}
                                        variant='filled'
                                        size='lg'
                                        radius='md'
                                    >
                                        {getStatusLabel(latestFastqFilePair.status)}
                                    </Badge>
                                ) : (
                                    <Badge color='gray' variant='filled' size='lg' radius='md'>
                                        Chưa có file
                                    </Badge>
                                )}
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Paper p='md' radius='md' bg='teal.0' withBorder>
                            <Stack gap='sm' align='center'>
                                <Text size='sm' fw={500} c='teal'>
                                    Trạng thái ETL
                                </Text>
                                {latestEtlResult?.status ? (
                                    <Badge
                                        color={getStatusColor(latestEtlResult.status)}
                                        variant='filled'
                                        size='lg'
                                        radius='md'
                                    >
                                        {getStatusLabel(latestEtlResult.status)}
                                    </Badge>
                                ) : (
                                    <Badge color='gray' variant='filled' size='lg' radius='md'>
                                        Chưa xử lý
                                    </Badge>
                                )}
                            </Stack>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Stack>

            {/* Additional Information */}
            {(latestFastqFilePair?.redoReason || latestEtlResult?.reasonApprove) && (
                <>
                    <Divider my='xl' />
                    <Stack gap='md'>
                        {latestFastqFilePair?.redoReason && (
                            <Paper p='lg' radius='md' bg='red.0' withBorder>
                                <Stack gap='xs'>
                                    <Text size='sm' fw={600} c='red'>
                                        Lý do từ chối FastQ:
                                    </Text>
                                    <Text size='sm' c='red.7'>
                                        {latestFastqFilePair.redoReason}
                                    </Text>
                                </Stack>
                            </Paper>
                        )}

                        {latestEtlResult?.reasonApprove && (
                            <Paper p='lg' radius='md' bg='blue.0' withBorder>
                                <Stack gap='xs'>
                                    <Text size='sm' fw={600} c='blue'>
                                        Kết quả thẩm định
                                    </Text>
                                    <Text size='sm' c='blue.7'>
                                        {latestEtlResult.reasonApprove}
                                    </Text>
                                </Stack>
                            </Paper>
                        )}
                    </Stack>
                </>
            )}
        </Card>
    )
}
