import { StackHandler, StackProvider, StackTheme } from '@stackframe/react'
import { useLocation } from 'react-router'
import { stackClientApp } from './stack'

function HandlerRoutes() {
    const location = useLocation()

    return <StackHandler app={stackClientApp} location={location.pathname} fullPage />
}

const StackAuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <StackProvider app={stackClientApp}>
            <StackTheme>{children}</StackTheme>
        </StackProvider>
    )
}

export { StackAuthProvider, HandlerRoutes }
export default StackAuthProvider
