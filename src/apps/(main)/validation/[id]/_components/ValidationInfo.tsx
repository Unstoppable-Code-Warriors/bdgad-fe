import { Card, Text, Group, Divider, Stack, ThemeIcon, Box, Grid, Paper } from '@mantine/core'
import { IconShield, IconCalendar } from '@tabler/icons-react'
import type { ValidationSessionWithLatestEtlResponse } from '@/types/validation'

interface ValidationInfoProps {
    validation: ValidationSessionWithLatestEtlResponse
}

export const ValidationInfo = ({ validation }: ValidationInfoProps) => {
    const etlResult = validation.latestEtlResult

    return (
        <Card shadow='sm' padding='xl' radius='lg' withBorder>
            <Group gap='sm' mb='xl'>
                <ThemeIcon size='lg' radius='md' variant='light' color='teal'>
                    <IconShield size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={700} size='xl'>
                        Thông tin xác thực
                    </Text>
                    <Text size='sm' c='dimmed'>
                        Chi tiết về phiên xác thực ETL
                    </Text>
                </Box>
            </Group>

            <Grid gutter='lg'>
                {/* Basic Information */}
                <Grid.Col span={6}>
                    <Paper p='lg' radius='md' bg='gray.0' withBorder>
                        <Stack gap='md'>
                            <Group gap='xs'>
                                <IconShield size={16} color='var(--mantine-color-teal-6)' />
                                <Text size='sm' fw={600} c='teal'>
                                    Thông tin phiên
                                </Text>
                            </Group>

                            <Stack gap='sm'>
                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Mã phiên:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {validation.id}
                                    </Text>
                                </Group>

                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Mã phòng thí nghiệm:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {validation.labcode}
                                    </Text>
                                </Group>

                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Mã vạch:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {validation.barcode}
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
                                        {new Date(validation.requestDate).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Group>

                                <Group justify='space-between'>
                                    <Text size='sm' c='dimmed'>
                                        Ngày tạo:
                                    </Text>
                                    <Text fw={600} size='sm'>
                                        {new Date(validation.createdAt).toLocaleDateString('vi-VN')}
                                    </Text>
                                </Group>

                                {etlResult?.etlCompletedAt && (
                                    <Group justify='space-between'>
                                        <Text size='sm' c='dimmed'>
                                            ETL hoàn thành:
                                        </Text>
                                        <Text fw={600} size='sm'>
                                            {new Date(etlResult.etlCompletedAt).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </Group>
                                )}
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* Additional Information */}
            {(etlResult?.comment || etlResult?.redoReason) && (
                <>
                    <Divider my='xl' />
                    <Stack gap='md'>
                        {etlResult?.comment && (
                            <Paper p='lg' radius='md' bg='teal.0' withBorder>
                                <Stack gap='xs'>
                                    <Text size='sm' fw={600} c='teal'>
                                        Ghi chú:
                                    </Text>
                                    <Text size='sm' c='teal.7'>
                                        {etlResult.comment}
                                    </Text>
                                </Stack>
                            </Paper>
                        )}

                        {etlResult?.redoReason && (
                            <Paper p='lg' radius='md' bg='red.0' withBorder>
                                <Stack gap='xs'>
                                    <Text size='sm' fw={600} c='red'>
                                        Lý do từ chối:
                                    </Text>
                                    <Text size='sm' c='red.7'>
                                        {etlResult.redoReason}
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
