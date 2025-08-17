import { Button, Group, Stack, Text, Paper } from '@mantine/core'
import { IconFileText, IconFileSpreadsheet, IconExternalLink, IconDownload } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

interface EtlResultActionsProps {
    htmlResult: string | null
    excelResult: string | null
    status: string | null
}

export const EtlResultActions = ({ htmlResult, excelResult, status }: EtlResultActionsProps) => {
    // Don't show actions if ETL is not completed or approved
    if (status !== 'completed' && status !== 'approved') {
        return null
    }

    const handleViewHtml = () => {
        if (htmlResult) {
            // Open HTML result in new tab/window
            window.open(htmlResult, '_blank')
        } else {
            notifications.show({
                title: 'Lỗi',
                message: 'Không tìm thấy kết quả HTML',
                color: 'red'
            })
        }
    }

    const handleDownloadExcel = () => {
        if (excelResult) {
            // Create download link
            const link = document.createElement('a')
            link.href = excelResult
            link.download = `etl-result-${Date.now()}.xlsx` // You might want to use a more meaningful filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            notifications.show({
                title: 'Thành công',
                message: 'Đã tải xuống file Excel',
                color: 'green'
            })
        } else {
            notifications.show({
                title: 'Lỗi',
                message: 'Không tìm thấy file Excel',
                color: 'red'
            })
        }
    }

    // If no results are available, show a message
    if (!htmlResult && !excelResult) {
        return (
            <Paper p='md' radius='md' bg='gray.0' withBorder>
                <Text size='sm' c='dimmed' ta='center'>
                    Chưa có kết quả ETL
                </Text>
            </Paper>
        )
    }

    return (
        <Paper p='lg' radius='md' bg='blue.0' withBorder>
            <Stack gap='md'>
                <Text size='sm' fw={600} c='blue'>
                    Kết quả ETL
                </Text>

                <Group gap='md'>
                    {htmlResult && (
                        <Button
                            leftSection={<IconFileText size={16} />}
                            rightSection={<IconExternalLink size={14} />}
                            variant='filled'
                            color='blue'
                            size='sm'
                            onClick={handleViewHtml}
                        >
                            Xem HTML
                        </Button>
                    )}

                    {excelResult && (
                        <Button
                            leftSection={<IconFileSpreadsheet size={16} />}
                            rightSection={<IconDownload size={14} />}
                            variant='filled'
                            color='green'
                            size='sm'
                            onClick={handleDownloadExcel}
                        >
                            Tải Excel
                        </Button>
                    )}
                </Group>
            </Stack>
        </Paper>
    )
}
