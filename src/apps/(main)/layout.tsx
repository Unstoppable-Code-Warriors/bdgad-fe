import { AppShell } from '@mantine/core'
import Header from './_components/header'
import { Outlet } from 'react-router'
import Navbar from './_components/navbar'
import { useAppShell } from '@/stores/appshell.store'
const MainLayout = () => {
    const { header, navbar, padding } = useAppShell()
    return (
        <AppShell
            header={{ height: 60, collapsed: !header }}
            navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: true, desktop: !navbar } }}
            padding={padding}
            styles={{
                header: {
                    zIndex: 49
                }
            }}
        >
            <Header />
            <Navbar />
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    )
}

export default MainLayout
