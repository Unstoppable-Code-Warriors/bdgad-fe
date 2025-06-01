import { create } from 'zustand'
import { useEffect } from 'react'
import type { AppShellResponsiveSize, MantineSpacing } from '@mantine/core'

interface AppShellState {
    navbar: boolean
    header: boolean
    footer: boolean
    aside: boolean
    padding: AppShellResponsiveSize | MantineSpacing | undefined
}

interface AppShellActions {
    setNavbar: (visible: boolean) => void
    setHeader: (visible: boolean) => void
    setFooter: (visible: boolean) => void
    setAside: (visible: boolean) => void
    setPadding: (padding: AppShellResponsiveSize | MantineSpacing | undefined) => void
    toggleNavbar: () => void
    toggleHeader: () => void
    toggleFooter: () => void
    toggleAside: () => void
    setAppShell: (config: Partial<AppShellState>) => void
    resetAppShell: () => void
}

type AppShellStore = AppShellState & AppShellActions

const defaultState: AppShellState = {
    navbar: true,
    header: true,
    footer: false,
    aside: false,
    padding: 'md'
}

export const useAppShellStore = create<AppShellStore>((set) => ({
    ...defaultState,

    setNavbar: (visible) => set({ navbar: visible }),
    setHeader: (visible) => set({ header: visible }),
    setFooter: (visible) => set({ footer: visible }),
    setAside: (visible) => set({ aside: visible }),
    setPadding: (padding) => set({ padding }),

    toggleNavbar: () => set((state) => ({ navbar: !state.navbar })),
    toggleHeader: () => set((state) => ({ header: !state.header })),
    toggleFooter: () => set((state) => ({ footer: !state.footer })),
    toggleAside: () => set((state) => ({ aside: !state.aside })),

    setAppShell: (config) => set((state) => ({ ...state, ...config })),
    resetAppShell: () => set(defaultState)
}))

// Main hook to get current state and actions
export const useAppShell = () => {
    const store = useAppShellStore()

    return {
        // Current state
        navbar: store.navbar,
        header: store.header,
        footer: store.footer,
        aside: store.aside,
        padding: store.padding,

        // Actions
        setNavbar: store.setNavbar,
        setHeader: store.setHeader,
        setFooter: store.setFooter,
        setAside: store.setAside,
        setPadding: store.setPadding,
        toggleNavbar: store.toggleNavbar,
        toggleHeader: store.toggleHeader,
        toggleFooter: store.toggleFooter,
        toggleAside: store.toggleAside,
        setAppShell: store.setAppShell,
        resetAppShell: store.resetAppShell
    }
}

// Hook to configure AppShell for a specific page/component
export const useAppShellConfig = (config: Partial<AppShellState>) => {
    const setAppShell = useAppShellStore((state) => state.setAppShell)

    useEffect(() => {
        setAppShell(config)

        // Optional: Reset to default when component unmounts
        return () => {
            setAppShell(defaultState)
        }
    }, [setAppShell, config.navbar, config.header, config.footer, config.aside, config.padding])
}

// Selector hooks for specific parts (for performance optimization)
export const useNavbarVisible = () => useAppShellStore((state) => state.navbar)
export const useHeaderVisible = () => useAppShellStore((state) => state.header)
export const useFooterVisible = () => useAppShellStore((state) => state.footer)
export const useAsideVisible = () => useAppShellStore((state) => state.aside)
export const usePadding = () => useAppShellStore((state) => state.padding)
