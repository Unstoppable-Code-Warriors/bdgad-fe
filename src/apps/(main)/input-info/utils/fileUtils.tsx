import type { FileWithPath } from '@mantine/dropzone'
import { Badge } from '@mantine/core'
import {
    IconFile, IconPhoto, IconFileWord, IconFileSpreadsheet, 
} from '@tabler/icons-react'

export const getFileType = (file: FileWithPath): 'image' | 'pdf' | 'document' | 'other' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type === 'application/pdf') return 'pdf'
    if (file.type.includes('word') || file.type.includes('excel') || file.type.includes('powerpoint')) return 'document'
    return 'other'
}

export const getFileIcon = (file: FileWithPath) => {
    const type = getFileType(file)
    switch (type) {
        case 'pdf':
            return <IconFileWord color="red" size={20} />
        case 'document':
            return <IconFileSpreadsheet color="blue" size={20} />
        case 'image':
            return <IconPhoto color="purple" size={20} />
        default:
            return <IconFile color="gray" size={20} />
    }
}

export const getFileTypeLabel = (file: FileWithPath) => {
    const type = getFileType(file)
    switch (type) {
        case 'image':
            return <Badge color="purple" variant="light">Image</Badge>
        case 'pdf':
            return <Badge color="red" variant="light">PDF</Badge>
        case 'document':
            return <Badge color="blue" variant="light">Document</Badge>
        default:
            return <Badge color="gray" variant="light">Other</Badge>
    }
}

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}