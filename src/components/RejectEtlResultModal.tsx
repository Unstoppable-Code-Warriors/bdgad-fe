import { Alert, Box, Button, Group, Stack, Text, Textarea, ThemeIcon } from '@mantine/core'
import { IconAlertCircle, IconX } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import { useRejectEtlResult } from '@/services/hook/validation.hook'
import { useState } from 'react'

interface RejectEtlResultModalProps {
    etlResultId: number
    onSuccess?: () => void
}

export const openRejectEtlResultModal = ({ etlResultId, onSuccess }: RejectEtlResultModalProps) => {
    const modalId = `reject-etl-result-${etlResultId}`

    modals.open({
        modalId,
        title: (
            <Group gap='sm'>
                <ThemeIcon size='lg' color='red' variant='light'>
                    <IconX size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={600} size='lg'>
                        Từ chối kết quả ETL
                    </Text>
                    <Text size='sm' c='dimmed'>
                        Nhập lý do để từ chối kết quả này
                    </Text>
                </Box>
            </Group>
        ),
        children: <RejectEtlResultModalContent etlResultId={etlResultId} onSuccess={onSuccess} />,
        size: 'md',
        radius: 'lg',
        centered: true,
        closeOnClickOutside: false,
        closeOnEscape: false
    })
}

const RejectEtlResultModalContent = ({ etlResultId, onSuccess }: RejectEtlResultModalProps) => {
    const [rejectReason, setRejectReason] = useState('')
    const rejectEtlResultMutation = useRejectEtlResult()

    const handleCloseModal = () => {
        modals.closeAll()
    }

    const handleRejectEtlResult = async () => {
        if (!rejectReason.trim()) {
            notifications.show({
                title: 'Lỗi',
                message: 'Vui lòng nhập lý do từ chối',
                color: 'red'
            })
            return
        }

        rejectEtlResultMutation.mutate(
            { etlResultId, data: { reason: rejectReason.trim() } },
            {
                onSuccess: () => {
                    notifications.show({
                        title: 'Thành công',
                        message: 'Kết quả ETL đã được từ chối',
                        color: 'green'
                    })
                    handleCloseModal()
                    onSuccess?.()
                },
                onError: (error: any) => {
                    notifications.show({
                        title: 'Lỗi từ chối',
                        message: error.message || 'Không thể từ chối kết quả ETL',
                        color: 'red'
                    })
                }
            }
        )
    }

    return (
        <Stack gap='lg'>
            <Alert color='orange' variant='light' icon={<IconAlertCircle size={16} />}>
                Kết quả ETL sẽ được đánh dấu là bị từ chối và cần phải xử lý lại.
            </Alert>

            <Textarea
                label='Lý do từ chối'
                placeholder='Nhập lý do từ chối kết quả ETL chi tiết...'
                required
                minRows={4}
                maxRows={8}
                maxLength={500}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.currentTarget.value)}
                error={rejectReason.length > 500 ? 'Lý do không được quá 500 ký tự' : undefined}
                radius='md'
            />

            <Group justify='space-between'>
                <Text size='xs' c='dimmed'>
                    {rejectReason.length}/500 ký tự
                </Text>
                <Group>
                    <Button variant='light' onClick={handleCloseModal} radius='lg'>
                        Hủy bỏ
                    </Button>
                    <Button
                        color='red'
                        onClick={handleRejectEtlResult}
                        loading={rejectEtlResultMutation.isPending}
                        disabled={!rejectReason.trim() || rejectReason.length > 500}
                        radius='lg'
                    >
                        Xác nhận từ chối
                    </Button>
                </Group>
            </Group>
        </Stack>
    )
}
