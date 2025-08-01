import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Container, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import OCRProcessor from './OCRProcessor'

const OCRPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    useEffect(() => {
        if (location.state?.file) {
            setSelectedFile(location.state.file)
        } else {
            notifications.show({
                title: 'Lỗi',
                message: 'Không tìm thấy file để xử lý OCR',
                color: 'red'
            })
            navigate(-1)
        }
    }, [location.state, navigate])

    const handleComplete = (ocrData: any) => {
        const updatedSubmittedFiles = (location.state?.submittedFiles || []).map((file: any) => {
            if (file.id === location.state?.fileId) {
                return {
                    ...file,
                    status: 'completed',
                    ocrResult: ocrData
                }
            }
            return file
        })

        navigate('/import-file/input', {
            state: {
                ...location.state,
                ocrResult: ocrData,
                submittedFiles: updatedSubmittedFiles
            }
        })
    }

    const handleBack = () => {
        navigate('/import-file/input', {
            state: {
                ...location.state,
                submittedFiles: location.state?.submittedFiles
            }
        })
    }

    if (!selectedFile) {
        return null
    }

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                <OCRProcessor 
                    selectedFile={selectedFile} 
                    onComplete={handleComplete} 
                    onBack={handleBack}
                    existingOCRResult={location.state?.existingOCRResult}
                    isEditing={location.state?.isEditing}
                />
            </Stack>
        </Container>
    )
}

export default OCRPage
