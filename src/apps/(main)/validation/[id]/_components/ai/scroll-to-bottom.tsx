import { ActionIcon, Center } from '@mantine/core'
import { IconArrowDown } from '@tabler/icons-react'

interface ScrollToBottomProps {
    isAtBottom: boolean
    scrollToBottom: () => void
}

const ScrollToBottom = ({ isAtBottom, scrollToBottom }: ScrollToBottomProps) => {
    return (
        !isAtBottom && (
            <Center className='w-full absolute bottom-0'>
                <ActionIcon onClick={() => scrollToBottom()} variant='light' radius='xl' size='lg'>
                    <IconArrowDown size={24} />
                </ActionIcon>
            </Center>
        )
    )
}

export default ScrollToBottom
