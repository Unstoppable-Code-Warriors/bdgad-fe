import { Card, Text, Group, Badge, Divider, Stack } from '@mantine/core'
import type { AnalysisSessionDetail, FastqFileResponse, EtlResultResponse } from '@/types/analysis'
import { analysisStatusConfig } from '@/types/analysis'

interface AnalysisInfoProps {
    data: AnalysisSessionDetail
    latestFastQFile: FastqFileResponse | null
    latestEtlResult: EtlResultResponse | null
}

const getStatusColor = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.color || 'gray'
}

const getStatusLabel = (status: string) => {
    return analysisStatusConfig[status as keyof typeof analysisStatusConfig]?.label || status
}

export const AnalysisInfo = ({ data, latestFastQFile, latestEtlResult }: AnalysisInfoProps) => {
    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Text fw={600} size='lg' mb='md'>
                Thông tin phân tích
            </Text>

            <Stack gap='sm'>
                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Mã phòng thí nghiệm:
                    </Text>
                    <Text fw={500}>{data.labcode}</Text>
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Mã vạch:
                    </Text>
                    <Text fw={500}>{data.barcode}</Text>
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Ngày yêu cầu:
                    </Text>
                    <Text fw={500}>{new Date(data.requestDate).toLocaleDateString('vi-VN')}</Text>
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Ngày tạo:
                    </Text>
                    <Text fw={500}>{new Date(data.createdAt).toLocaleDateString('vi-VN')}</Text>
                </Group>

                <Divider my='xs' />

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Trạng thái FastQ:
                    </Text>
                    {latestFastQFile?.status ? (
                        <Badge color={getStatusColor(latestFastQFile.status)} variant='light'>
                            {getStatusLabel(latestFastQFile.status)}
                        </Badge>
                    ) : (
                        <Badge color='gray'>Chưa có file</Badge>
                    )}
                </Group>

                <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                        Trạng thái ETL:
                    </Text>
                    {latestEtlResult?.status ? (
                        <Badge color={getStatusColor(latestEtlResult.status)} variant='light'>
                            {getStatusLabel(latestEtlResult.status)}
                        </Badge>
                    ) : (
                        <Badge color='gray'>Chưa xử lý</Badge>
                    )}
                </Group>

                {latestFastQFile?.redoReason && (
                    <>
                        <Divider my='xs' />
                        <Text size='sm' c='dimmed'>
                            Lý do từ chối FastQ:
                        </Text>
                        <Text size='sm' c='red'>
                            {latestFastQFile.redoReason}
                        </Text>
                    </>
                )}

                {latestEtlResult?.comment && (
                    <>
                        <Divider my='xs' />
                        <Text size='sm' c='dimmed'>
                            Ghi chú ETL:
                        </Text>
                        <Text size='sm'>{latestEtlResult.comment}</Text>
                    </>
                )}
            </Stack>
        </Card>
    )
}
