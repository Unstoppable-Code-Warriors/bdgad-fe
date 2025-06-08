import { Button } from '@mantine/core'
import { Link } from 'react-router'

const Logo = () => {
    return (
        <Button size='compact-md' variant='subtle' component={Link} to='/'>
            BDGAD
        </Button>
    )
}

export default Logo
