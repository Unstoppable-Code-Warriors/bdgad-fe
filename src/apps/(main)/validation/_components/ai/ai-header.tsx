import { ActionIcon, Button, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconLayoutSidebarRightCollapse, IconTrash } from '@tabler/icons-react'
import { useAppShellStore } from '@/stores/appshell.store'
import { chatHistoryService } from '@/utils/db'

interface AIHeaderProps {
    validationId: string
}

const AIHeader = ({ validationId }: AIHeaderProps) => {
    const toggleAside = useAppShellStore((state) => state.toggleAside)
    const handleOpenConfirmDeleteModal = () => {
        modals.openConfirmModal({
            centered: true,
            title: <Text fw={500}>Xóa cuộc hội thoại</Text>,
            children: (
                <Text>Bạn có chắc chắn muốn xóa cuộc hội thoại này không? Hành động này không thể hoàn tác.</Text>
            ),
            labels: {
                confirm: 'Xóa',
                cancel: 'Hủy'
            },
            confirmProps: {
                color: 'red'
            },
            onConfirm: () => {
                if (!validationId) return
                chatHistoryService.deleteConversation(validationId)
            }
        })
    }

    return (
        <div className='px-4 py-2 border-b border-gray-200 flex items-center justify-between'>
            <Button
                leftSection={<IconTrash size={16} />}
                size='xs'
                color='red'
                variant='light'
                onClick={handleOpenConfirmDeleteModal}
            >
                Xóa cuộc hội thoại
            </Button>
            <ActionIcon size='md' variant='light' onClick={toggleAside}>
                <IconLayoutSidebarRightCollapse size={16} />
            </ActionIcon>
        </div>
    )
}

export default AIHeader
