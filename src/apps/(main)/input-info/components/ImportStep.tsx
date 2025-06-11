import { useState } from 'react'
import { Dropzone } from '@mantine/dropzone'
import type { FileWithPath } from '@mantine/dropzone'
import { 
    Stack, Text, Button, Alert, Group, rem, Card, Paper, Divider,
} from '@mantine/core'
import {
    IconUpload, IconPhoto, IconX, IconAlertCircle, IconFile,
    IconScan, IconDeviceFloppy, IconCheck, IconFileText
} from '@tabler/icons-react'
import OCRProcessor from './OCRProcessor'
import AdditionalFiles from './AdditionalFiles'

interface ImportStepProps {
    onComplete?: (data: any) => void
}

const ImportStep = ({ onComplete }: ImportStepProps) => {
    const [selectedFile, setSelectedFile] = useState<FileWithPath | null>(null)
    const [additionalFiles, setAdditionalFiles] = useState<FileWithPath[]>([])
    const [currentStep, setCurrentStep] = useState<'upload' | 'ocr'>('upload')
    const [error, setError] = useState<string | null>(null)

    const handleMainFileDrop = (files: FileWithPath[]) => {
        if (files.length > 0) {
            setSelectedFile(files[0])
            setError(null)
        }
    }

    const handleRemoveMainFile = () => {
        setSelectedFile(null)
    }

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        switch (extension) {
            case 'pdf':
                return <IconFile color="red" />
            case 'doc':
            case 'docx':
                return <IconFile color="blue" />
            case 'xls':
            case 'xlsx':
                return <IconFile color="green" />
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <IconPhoto color="purple" />
            default:
                return <IconFile color="gray" />
        }
    }

    const handleStartOCR = () => {
        if (!selectedFile) {
            setError('Please select a medical requisition file first')
            return
        }
        setCurrentStep('ocr')
    }

    const handleOCRComplete = (data: any) => {
        if (onComplete) {
            onComplete(data)
        }
        // Reset to upload step after completion
        handleReset()
    }

    const handleBackToUpload = () => {
        setCurrentStep('upload')
    }

    const handleReset = () => {
        setSelectedFile(null)
        setAdditionalFiles([])
        setCurrentStep('upload')
        setError(null)
    }

    const handleAdditionalFilesChange = (files: FileWithPath[]) => {
        setAdditionalFiles(files)
    }

    // OCR Step
    if (currentStep === 'ocr' && selectedFile) {
        return (
            <OCRProcessor
                selectedFile={selectedFile}
                onComplete={handleOCRComplete}
                onBack={handleBackToUpload}
            />
        )
    }

    // Upload Step
    return (
        <Stack gap='lg' mt='xl'>
            {error && (
                <Alert icon={<IconAlertCircle size='1rem' />} color='red' variant='light'>
                    {error}
                </Alert>
            )}

            {/* Main Medical Requisition Upload */}
            <Card withBorder padding="md" radius="md">
                <Stack gap="sm">
                    <Group justify="space-between" align="center">
                        <Text size="lg" fw={600} c="blue.7">Medical Test Requisition</Text>
                        {selectedFile && (
                            <Button
                                variant="gradient"
                                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                                leftSection={<IconScan size="1rem" />}
                                onClick={handleStartOCR}
                                size="sm"
                            >
                                OCR Process
                            </Button>
                        )}
                    </Group>

                    {!selectedFile ? (
                        <Dropzone
                            onDrop={handleMainFileDrop}
                            onReject={(files) => console.log('rejected files', files)}
                            maxSize={10 * 1024 ** 2}
                            accept={[
                                'image/jpeg', 'image/png', 'image/jpg', 'image/gif',
                                'application/pdf',
                                'application/msword',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ]}
                            multiple={false}
                        >
                            <Group justify='center' gap='xl' mih={160} style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept>
                                    <IconUpload
                                        style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-blue-6)' }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <IconX
                                        style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-red-6)' }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <IconFile
                                        style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-dimmed)' }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Idle>

                                <div>
                                    <Text size='lg' inline>
                                        Drag medical requisition file here or click to select
                                    </Text>
                                    <Text size='sm' c='dimmed' inline mt={7}>
                                        Supports: Images, PDF, Word documents (Max 10MB)
                                    </Text>
                                </div>
                            </Group>
                        </Dropzone>
                    ) : (
                        <Alert color='green' variant='light'>
                            <Group justify='space-between'>
                                <Group gap="sm">
                                    {getFileIcon(selectedFile.name)}
                                    <div>
                                        <Text fw={500} size="sm">Medical Requisition Selected</Text>
                                        <Text size='xs' c='dimmed'>
                                            {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                                        </Text>
                                    </div>
                                </Group>
                                <Button
                                    variant='subtle'
                                    color='red'
                                    size='xs'
                                    onClick={handleRemoveMainFile}
                                >
                                    Remove
                                </Button>
                            </Group>
                        </Alert>
                    )}
                </Stack>
            </Card>

            {/* Additional Files Component */}
            <AdditionalFiles 
                files={additionalFiles}
                onFilesChange={handleAdditionalFilesChange}
            />

            {/* Enhanced Submit Section */}
            <Paper p='xl' withBorder radius='lg' bg='gradient-to-r from-blue-50 to-cyan-50' style={{ 
                background: 'linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-cyan-0) 100%)',
                border: '2px solid var(--mantine-color-blue-2)'
            }}>
                <Stack gap='lg'>
                    <Group justify='space-between' align='flex-start'>
                        <div>
                            <Group gap='sm' mb='xs'>
                                <IconFileText size='1.5rem' color='var(--mantine-color-blue-6)' />
                                <Text size='xl' fw={700} c='blue.7'>
                                    Ready to Submit
                                </Text>
                                {/* <Badge variant='light' color='green' size='lg'>
                                    Complete
                                </Badge> */}
                            </Group>
                            <Text size='md' c='dimmed' mb='md'>
                                Review your uploaded files and submit to the system
                            </Text>
                            
                            {/* File Summary */}
                            <Stack gap='xs'>
                                <Group gap='sm'>
                                    <IconCheck size='1rem' color='var(--mantine-color-green-6)' />
                                    <Text size='sm' fw={500}>
                                        Medical Requisition: 
                                        <Text span c='blue.6' ml='xs'>
                                            {selectedFile ? selectedFile.name : 'Not selected'}
                                        </Text>
                                    </Text>
                                </Group>
                                
                                <Group gap='sm'>
                                    <IconCheck size='1rem' color='var(--mantine-color-green-6)' />
                                    <Text size='sm' fw={500}>
                                        Additional Files: 
                                        <Text span c='blue.6' ml='xs'>
                                            {additionalFiles.filter(f => f !== null).length} files attached
                                        </Text>
                                    </Text>
                                </Group>
                            </Stack>
                        </div>
                    </Group>

                    <Divider />

                    <Group justify='space-between' align='center'>
                        <Text size='sm' c='dimmed'>
                            All files will be processed and saved to the system
                        </Text>
                        
                        <Group gap='md'>
                            <Button
                                variant='gradient'
                                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                                size='md'
                                leftSection={<IconDeviceFloppy size='1.2rem' />}
                                onClick={() => {
                                    const submitData = {
                                        mainFile: selectedFile,
                                        additionalFiles: additionalFiles.filter(f => f !== null)
                                    }
                                    if (onComplete) {
                                        onComplete(submitData)
                                    }
                                }}
  
                            >
                                Submit file
                            </Button>
                        </Group>
                    </Group>
                </Stack>
            </Paper>

        </Stack>
    )
}

export default ImportStep