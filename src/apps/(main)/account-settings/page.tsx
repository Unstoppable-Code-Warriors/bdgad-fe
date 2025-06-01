import { useAppShellConfig } from '@/stores/appshell.store'
import { AccountSettings } from '@stackframe/react'

const AccountSettingsPage = () => {
    useAppShellConfig({
        navbar: false,
        padding: 0
    })
    return <AccountSettings fullPage />
}

export default AccountSettingsPage
