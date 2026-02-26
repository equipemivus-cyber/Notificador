'use client';

import React, { useSyncExternalStore } from 'react';
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/components/LoginPage";
import { Sidebar } from "@/components/Sidebar";

const emptySubscribe = () => () => { };

function AppContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    if (!mounted) return null;

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {children}
            </div>
        </>
    );
}

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AppContent>{children}</AppContent>
        </AuthProvider>
    );
}
