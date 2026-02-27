'use client';

import React, { useSyncExternalStore } from 'react';
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/components/LoginPage";
import { Sidebar } from "@/components/Sidebar";
import { DashboardProvider } from "@/context/DashboardContext";

const emptySubscribe = () => () => { };

function AppContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    if (!mounted) return null;

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <div className="flex w-full h-full">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-slate-50 relative">
                {children}
            </main>
        </div>
    );
}

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardProvider>
                <AppContent>{children}</AppContent>
            </DashboardProvider>
        </AuthProvider>
    );
}
