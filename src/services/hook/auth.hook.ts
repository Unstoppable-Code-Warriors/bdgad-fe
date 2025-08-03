import { useQuery } from '@tanstack/react-query'
import { authService } from '../function/auth'

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => authService.me()
    })
}

export const useUsersByRole = (roleCode: number) => {
    return useQuery({
        queryKey: ['users', 'role', roleCode],
        queryFn: () => authService.getUserByCode(roleCode),
        enabled: !!roleCode
    })
}
