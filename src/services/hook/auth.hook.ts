import { useQuery } from '@tanstack/react-query'
import { authService } from '../function/auth'

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => authService.me()
    })
}
