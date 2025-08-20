import { Avatar, Group, Loader } from '@mantine/core'
import { IconDna2 } from '@tabler/icons-react'

const LoadingMessage = () => {
    return (
        <Group wrap='nowrap' align='flex-start'>
            <Avatar variant='filled' color='blue'>
                <IconDna2 />
            </Avatar>
            <Loader type='dots' />
        </Group>
    )
}

export default LoadingMessage
