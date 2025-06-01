import { AppShell } from '@mantine/core'
import { useUser } from '@stackframe/react'
import Header from './_components/header'
import { Outlet } from 'react-router'

const MainLayout = () => {
    useUser({ or: 'redirect' })
    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: true } }}
            padding='md'
        >
            <Header />
            <AppShell.Navbar p='md'></AppShell.Navbar>
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    )
}

export default MainLayout
