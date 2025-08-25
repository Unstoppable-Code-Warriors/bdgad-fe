import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { getCurrentUser } from '@/stores/auth.store'
import { getDefaultRouteByRole } from '@/utils/constant'

const HomePage = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const user = getCurrentUser()
        const roleCode = Number(user?.roles?.[0]?.code)
        const defaultRoute = getDefaultRouteByRole(roleCode)
        
        // Redirect to appropriate route based on user role
        navigate(defaultRoute, { replace: true })
    }, [navigate])

    return null // Return null since we're redirecting
}

export default HomePage
