import { Alert, Box, Button, Group, Stack, Text, Textarea, ThemeIcon } from '@mantine/core'
import { IconAlertCircle, IconX } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import { useRejectFastq } from '@/services/hook/analysis.hook'
import { useState } from 'react'

interface RejectFastqModalProps {
    fastqFileId: number
    onSuccess?: () => void
}

export const openRejectFastqModal = ({ fastqFileId, onSuccess }: RejectFastqModalProps) => {
    const modalId = `reject-fastq-${fastqFileId}`

    modals.open({
        modalId,
        title: (
            <Group gap='sm'>
                <ThemeIcon size='lg' color='red' variant='light'>
                    <IconX size={20} />
                </ThemeIcon>
                <Box>
                    <Text fw={600} size='lg'>
                        Từ chối file FastQ
                    </Text>
                    <Text size='sm' c='dimmed'>
                        Nhập lý do để từ chối file này
                    </Text>
                </Box>
            </Group>
        ),
        children: <RejectFastqModalContent fastqFileId={fastqFileId} onSuccess={onSuccess} />,
        size: 'md',
        radius: 'lg',
        centered: true,
        closeOnClickOutside: false,
        closeOnEscape: false
    })
}

const RejectFastqModalContent = ({ fastqFileId, onSuccess }: RejectFastqModalProps) => {
    const [rejectReason, setRejectReason] = useState('')
    const rejectFastqMutation = useRejectFastq()

    const handleCloseModal = () => {
        modals.closeAll()
    }

    const handleRejectFastq = async () => {
        if (!rejectReason.trim()) {
            notifications.show({
                title: 'Lỗi',
                message: 'Vui lòng nhập lý do từ chối',
                color: 'red'
            })
            return
        }

        rejectFastqMutation.mutate(
            { fastqFileId, data: { redoReason: rejectReason.trim() } },
            {
                onSuccess: () => {
                    notifications.show({
                        title: 'Thành công',
                        message: 'File FastQ đã được từ chối',
                        color: 'green'
                    })
                    handleCloseModal()
                    onSuccess?.()
                },
                onError: (error: any) => {
                    notifications.show({
                        title: 'Lỗi từ chối file',
                        message: error.message || 'Không thể từ chối file FastQ',
                        color: 'red'
                    })
                }
            }
        )
    }

    return (
        <Stack gap='lg'>
            <Alert color='orange' variant='light' icon={<IconAlertCircle size={16} />}>
                File FastQ sẽ được đánh dấu là bị từ chối và cần phải tải lên lại.
            </Alert>

            <Textarea
                label='Lý do từ chối'
                placeholder='Nhập lý do từ chối chi tiết...'
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
                        onClick={handleRejectFastq}
                        loading={rejectFastqMutation.isPending}
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
