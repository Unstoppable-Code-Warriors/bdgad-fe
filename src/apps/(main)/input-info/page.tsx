'use client'

import { useState } from 'react'
import { Container, Stepper, Center, Title, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconAlertTriangle } from '@tabler/icons-react'
import { staffService } from '@/services/function/staff'
import type { MedicalTestRequisitionUploadResponse } from '@/types'
import UploadStep from './components/UploadStep'
import ProcessingStep from './components/ProcessingStep'
import ResultStep from './components/ResultStep'

const InputInfoPage = () => {
    const [activeStep, setActiveStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [uploadResult, setUploadResult] = useState<MedicalTestRequisitionUploadResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileUpload = async (file: File) => {
        setIsLoading(true)
        setError(null)

        try {
            // Move to processing step
            setActiveStep(1)

            // Upload and process file
            const result = await staffService.uploadMedicalTestRequisition(file)

            // Check if upload was successful
            if (!result.success) {
                throw new Error(result.message || 'Upload failed')
            }

            setUploadResult(result)

            // Check OCR processing quality
            const ocrSuccess =
                result.ocrResult &&
                (result.ocrResult.full_name ||
                    result.ocrResult.test_orders?.length > 0 ||
                    result.ocrResult.diagnosis ||
                    result.ocrResult.exam_date)

            if (ocrSuccess) {
                notifications.show({
                    title: 'OCR Processing Complete',
                    message: 'Medical test requisition uploaded and processed successfully',
                    color: 'green',
                    icon: <IconCheck />
                })
            } else {
                notifications.show({
                    title: 'OCR Processing Incomplete',
                    message:
                        'File uploaded but some information could not be extracted. Please review and complete manually.',
                    color: 'orange',
                    icon: <IconAlertTriangle />
                })
            }

            // Move to result step
            setActiveStep(2)
        } catch (err) {
            console.error('Upload error:', err)
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
            setError(errorMessage)

            notifications.show({
                title: 'Upload Failed',
                message: errorMessage,
                color: 'red'
            })

            // Return to upload step on error
            setActiveStep(0)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setActiveStep(0)
        setUploadResult(null)
        setError(null)
        setIsLoading(false)
    }

    const steps = [
        {
            label: 'Upload',
            description: 'Upload medical test requisition'
        },
        {
            label: 'Processing',
            description: 'OCR extraction in progress'
        },
        {
            label: 'Review',
            description: 'Review and edit extracted data'
        }
    ]

    return (
        <Container size='xl' py='xl'>
            <Center mb='xl'>
                <div>
                    <Title order={1} ta='center' mb='sm'>
                        Medical Test Requisition Input
                    </Title>
                    <Text ta='center' c='dimmed' size='lg'>
                        Upload and process medical test requisition documents
                    </Text>
                </div>
            </Center>

            <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false} size='lg' mb='xl'>
                {steps.map((step, index) => (
                    <Stepper.Step key={index} label={step.label} description={step.description} />
                ))}
            </Stepper>

            {activeStep === 0 && <UploadStep onFileUpload={handleFileUpload} loading={isLoading} error={error} />}
            {activeStep === 1 && <ProcessingStep />}
            {activeStep === 2 && <ResultStep data={uploadResult} onReset={handleReset} />}
        </Container>
    )
}

export default InputInfoPage
