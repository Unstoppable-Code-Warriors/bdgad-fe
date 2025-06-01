import { StackClientApp } from '@stackframe/react'
import { useNavigate } from 'react-router'

export const stackClientApp = new StackClientApp({
    // You should store these in environment variables based on your project setup
    baseUrl: 'https://bdgad-auth.quydx.id.vn',
    projectId: 'ef1345bd-9b5c-4c81-b15e-9e7d85831c89',
    publishableClientKey: 'pck_36vdfmg5ja9actqs91t0zw4n869wjafjxk0f8j8pz18t8',
    tokenStore: 'cookie',
    redirectMethod: {
        useNavigate
    },
    urls: {
        handler: '/auth',
        accountSettings: '/account-settings'
    }
})
