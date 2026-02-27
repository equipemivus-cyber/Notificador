'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DashboardContextType {
    selectedAccount: string | null;
    selectedAccountId: string | null;
    setSelectedAccount: (name: string, id?: string | null) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (value: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [selectedAccount, setSelectedAccountState] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dashboard_sidebar_collapsed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('dashboard_sidebar_collapsed', isSidebarCollapsed.toString());
        }
    }, [isSidebarCollapsed]);

    function setSelectedAccount(name: string, id: string | null = null) {
        setSelectedAccountState(name);
        if (id !== null) {
            setSelectedAccountId(id);
        }
    }

    return (
        <DashboardContext.Provider
            value={{
                selectedAccount,
                selectedAccountId,
                setSelectedAccount,
                isSidebarCollapsed,
                setIsSidebarCollapsed,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
