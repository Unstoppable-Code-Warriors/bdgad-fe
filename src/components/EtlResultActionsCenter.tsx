import { Button, Group, Text, Paper } from '@mantine/core'
import { IconExternalLink, IconDownload } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

interface EtlResultActionsProps {
    htmlResult: string | null
    excelResult: string | null
    status: string | null
    className?: string
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
}

export const EtlResultActionsCenter = ({
    htmlResult,
    excelResult,
    status,
    className,
    justify = 'center'
}: EtlResultActionsProps) => {
    // Show actions for completed, approved, and wait_for_approval statuses
    const allowedStatuses = ['completed', 'approved', 'wait_for_approval', 'rejected']
    if (!status || !allowedStatuses.includes(status)) {
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
        <Group gap='md' grow justify={justify} className={className}>
            {htmlResult && (
                <Button
                    leftSection={<IconExternalLink size={14} />}
                    variant='light'
                    radius='md'
                    color='blue'
                    size='sm'
                    onClick={handleViewHtml}
                    style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
                >
                    Xem kết quả ETL
                </Button>
            )}

            {excelResult && (
                <Button
                    leftSection={<IconDownload size={14} />}
                    radius='md'
                    variant='light'
                    color='green'
                    size='sm'
                    onClick={handleDownloadExcel}
                    style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
                >
                    Tải Excel
                </Button>
            )}
        </Group>
    )
}
