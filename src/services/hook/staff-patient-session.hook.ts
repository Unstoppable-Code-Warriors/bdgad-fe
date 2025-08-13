import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { staffService } from '../function/staff'

export const usePatientLabSessions = (patientId: string) => {
    return useQuery({
        queryKey: ['patient-lab-sessions', patientId],
        queryFn: () => staffService.getPatientLabSessions(patientId),
        enabled: !!patientId
    })
}

export const usePatientLabSessionDetail = (sessionId: string) => {
    return useQuery({
        queryKey: ['patient-lab-session-detail', sessionId],
        queryFn: () => staffService.getPatientLabSessionDetail(sessionId),
        enabled: !!sessionId
    })
}

export const useAssignSession = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: string; data: { doctorId?: number; labTestingId?: number } }) =>
            staffService.assignSession(sessionId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['patient-lab-session-detail', variables.sessionId]
            })
        }
    })
}

export const useAssignResultTest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: { doctorId: number; labcodeLabSessionId: number }) => staffService.assignResultTest(data),
        onSuccess: () => {
            // Invalidate relevant queries that might need refreshing
            queryClient.invalidateQueries({
                queryKey: ['patient-lab-sessions']
            })
            queryClient.invalidateQueries({
                queryKey: ['patient-lab-session-detail']
            })
        }
    })
}

export const useDeletePatientFile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ patientFileId, sessionId }: { patientFileId: string; sessionId: string }) =>
            staffService.deletePatientFile(patientFileId, sessionId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['patient-lab-session-detail', variables.sessionId]
            })
        }
    })
}

export const useUploadPatientFiles = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ labSessionId, files }: { labSessionId: string; files: File[] }) =>
            staffService.uploadPatientFiles(labSessionId, files),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['patient-lab-session-detail', variables.labSessionId]
            })
        }
    })
}

export const useDownloadEtlResult = () => {
    return useMutation({
        mutationFn: (etlResultId: number) => staffService.downloadEtlResult(etlResultId)
    })
}
