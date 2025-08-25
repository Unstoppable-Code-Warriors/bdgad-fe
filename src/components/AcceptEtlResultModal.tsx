import { Alert, Box, Button, Group, Stack, Text, Textarea, ThemeIcon } from '@mantine/core'
import { IconCheck, IconShieldCheck } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import { useAcceptEtlResult } from '@/services/hook/validation.hook'
import { useState } from 'react'

interface AcceptEtlResultModalProps {
    etlResultId: number
    onSuccess?: () => void
}

export const openAcceptEtlResultModal = ({ etlResultId, onSuccess }: AcceptEtlResultModalProps) => {
    const modalId = `accept-etl-result-${etlResultId}`

    modals.open({
        modalId,
        title: (
            <Group gap='sm'>
                <ThemeIcon size='lg' color='green' variant='light'>
                    <IconCheck size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={600} size='lg'>
                        Phê duyệt kết quả ETL
                    </Text>
                    <Text size='sm' c='dimmed'>
                        Xác nhận phê duyệt kết quả này
                    </Text>
                </Box>
            </Group>
        ),
        children: <AcceptEtlResultModalContent etlResultId={etlResultId} onSuccess={onSuccess} />,
        size: 'lg',
        radius: 'lg',
        centered: true,
        closeOnClickOutside: false,
        closeOnEscape: false
    })
}

const AcceptEtlResultModalContent = ({ etlResultId, onSuccess }: AcceptEtlResultModalProps) => {
    const [comment, setComment] = useState('')
    const acceptEtlResultMutation = useAcceptEtlResult()

    const handleCloseModal = () => {
        modals.closeAll()
    }

    const handleAcceptEtlResult = async () => {
        acceptEtlResultMutation.mutate(
            { etlResultId, data: { reasonApprove: comment.trim() || undefined } },
            {
                onSuccess: () => {
                    notifications.show({
                        title: 'Thành công',
                        message: 'Kết quả ETL đã được phê duyệt',
                        color: 'green'
                    })
                    handleCloseModal()
                    onSuccess?.()
                },
                onError: (error: any) => {
                    notifications.show({
                        title: 'Lỗi phê duyệt',
                        message: error.message || 'Không thể phê duyệt kết quả ETL',
                        color: 'red'
                    })
                }
            }
        )
    }

    return (
        <Stack gap='lg'>
            <Alert color='green' variant='light' icon={<IconShieldCheck size={16} />}>
                Kết quả ETL sẽ được đánh dấu là đã phê duyệt và có thể sử dụng trong hệ thống.
            </Alert>

            <Textarea
                label='Kết quả thẩm định(tùy chọn)'
                placeholder='Nhập kết quả thẩm định cho kết quả phân tích gene'
                minRows={3}
                maxRows={6}
                maxLength={300}
                value={comment}
                onChange={(event) => setComment(event.currentTarget.value)}
                error={comment.length > 300 ? 'Ghi chú không được quá 300 ký tự' : undefined}
                radius='md'
            />

            <Group justify='space-between'>
                <Text size='xs' c='dimmed'>
                    {comment.length}/300 ký tự
                </Text>
                <Group>
                    <Button variant='light' onClick={handleCloseModal} radius='lg'>
                        Hủy bỏ
                    </Button>
                    <Button
                        color='green'
                        onClick={handleAcceptEtlResult}
                        loading={acceptEtlResultMutation.isPending}
                        disabled={comment.length > 300}
                        radius='lg'
                    >
                        Xác nhận phê duyệt
                    </Button>
                </Group>
            </Group>
        </Stack>
    )
}
