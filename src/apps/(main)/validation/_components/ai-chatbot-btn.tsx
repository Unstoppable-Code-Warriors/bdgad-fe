import { ActionIcon, Affix } from '@mantine/core'
import { IconRobot } from '@tabler/icons-react'
import { useAppShellStore } from '@/stores/appshell.store'

const AIChatbotButton = () => {
    const aside = useAppShellStore((state) => state.aside)
    const toggleAside = useAppShellStore((state) => state.toggleAside)

    return aside ? null : (
        <Affix position={{ bottom: 20, right: 20 }}>
            <ActionIcon size='xl' variant='filled' radius='xl' onClick={toggleAside}>
                <IconRobot />
            </ActionIcon>
        </Affix>
    )
}

export default AIChatbotButton
