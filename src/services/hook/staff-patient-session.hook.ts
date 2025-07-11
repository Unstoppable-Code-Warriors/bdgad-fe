import { useQuery } from '@tanstack/react-query'
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
