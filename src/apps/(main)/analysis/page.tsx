import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Loader, Container } from '@mantine/core'

const AnalysisPage = () => {
    const navigate = useNavigate()

    useEffect(() => {
        // Redirect to FastQ management by default
        navigate('/analysis/fastq', { replace: true })
    }, [navigate])

    return (
        <Container size='xl' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Loader />
        </Container>
    )
}

export default AnalysisPage
