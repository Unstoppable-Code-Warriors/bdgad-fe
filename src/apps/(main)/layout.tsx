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
            padding={0}
            styles={{
                header: {
                    zIndex: 49
                }
            }}
            classNames={{
                root: 'h-full'
            }}
        >
            <Header />
            <Navbar />
            <AppShell.Main className='h-full'>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    )
}

export default MainLayout
