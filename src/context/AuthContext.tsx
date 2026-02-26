'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'admin' | 'user' | null;

interface AuthContextType {
    isAuthenticated: boolean;
    role: UserRole;
    login: (code: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Códigos definidos pelo usuário
const ADMIN_CODE = 'Admin!0987';
const USER_CODE = 'User@4566';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const savedRole = localStorage.getItem('mivus_auth_role');
            return savedRole === 'admin' || savedRole === 'user';
        }
        return false;
    });

    const [role, setRole] = useState<UserRole>(() => {
        if (typeof window !== 'undefined') {
            const savedRole = localStorage.getItem('mivus_auth_role');
            if (savedRole === 'admin' || savedRole === 'user') {
                return savedRole as UserRole;
            }
        }
        return null;
    });

    // Sincronizar estado com localStorage (opcional, já feito no login/logout mas garante consistência)
    useEffect(() => {
        if (isAuthenticated && role) {
            localStorage.setItem('mivus_auth_role', role);
        } else if (!isAuthenticated) {
            localStorage.removeItem('mivus_auth_role');
        }
    }, [isAuthenticated, role]);

    const login = (code: string): boolean => {
        if (code === ADMIN_CODE) {
            setIsAuthenticated(true);
            setRole('admin');
            localStorage.setItem('mivus_auth_role', 'admin');
            return true;
        } else if (code === USER_CODE) {
            setIsAuthenticated(true);
            setRole('user');
            localStorage.setItem('mivus_auth_role', 'user');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setRole(null);
        localStorage.removeItem('mivus_auth_role');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
