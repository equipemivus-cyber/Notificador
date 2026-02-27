'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Calendar,
    Settings,
    LayoutDashboard,
    LogOut,
    ShieldCheck,
    User as UserIcon,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/context/DashboardContext';
import { cn } from '@/lib/utils';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
    badge?: number;
}

function NavItem({ icon, label, href, badge }: NavItemProps) {
    const pathname = usePathname();
    const { isSidebarCollapsed } = useDashboard();
    const active = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                active
                    ? "bg-zinc-800 text-zinc-100 beautiful-shadow"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                isSidebarCollapsed && "justify-center px-0"
            )}
            title={isSidebarCollapsed ? label : ""}
        >
            <span className={cn(
                "transition-colors",
                active ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300"
            )}>
                {icon}
            </span>
            {!isSidebarCollapsed && (
                <>
                    <span className="text-xs font-medium truncate">{label}</span>
                    {badge !== undefined && (
                        <span className="ml-auto bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-full border border-zinc-700">
                            {badge}
                        </span>
                    )}
                </>
            )}
            {isSidebarCollapsed && badge !== undefined && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-zinc-100 text-zinc-950 text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-900">
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </Link>
    );
}

export function Sidebar() {
    const { role, logout } = useAuth();
    const { isSidebarCollapsed, setIsSidebarCollapsed } = useDashboard();

    return (
        <aside
            className={cn(
                "h-screen sticky top-0 beautiful-shadow overflow-hidden bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out z-50 shrink-0 hidden md:flex",
                isSidebarCollapsed ? "w-[80px]" : "w-[224px]"
            )}
        >
            {/* Header / Brand */}
            <div className={cn(
                "p-4 border-b border-zinc-800/50 flex items-center justify-between",
                isSidebarCollapsed ? "flex-col gap-4" : "flex-row"
            )}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-zinc-100 to-zinc-400 rounded-xl flex items-center justify-center beautiful-shadow shrink-0">
                        <Calendar className="w-5 h-5 text-zinc-950" />
                    </div>
                    {!isSidebarCollapsed && (
                        <span className="font-bold text-lg tracking-tight text-zinc-100 truncate">Notificador</span>
                    )}
                </div>

                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-all shrink-0"
                >
                    {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
            </div>

            {/* Profile Section */}
            <div className="p-4 border-b border-zinc-800/50 relative">
                <div
                    className={cn(
                        "w-full flex items-center justify-between gap-2 bg-zinc-800/50 border border-zinc-800 rounded-xl overflow-hidden",
                        isSidebarCollapsed ? "p-1.5 justify-center" : "px-3 py-2"
                    )}
                >
                    <div className="flex items-center gap-2 overflow-hidden w-full">
                        <div className="w-6 h-6 rounded-lg bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">
                            {role === 'admin' ? <ShieldCheck size={14} className="text-blue-400" /> : <UserIcon size={14} className="text-zinc-400" />}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col text-left flex-1 min-w-0">
                                <span className="text-[11px] font-bold text-zinc-200 truncate capitalize">{role}</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                                    <span className="text-[9px] text-zinc-500 font-medium tracking-wider truncate">Online</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto scroll-hide">
                <div>
                    {!isSidebarCollapsed && (
                        <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Menu Principal</p>
                    )}
                    <div className="space-y-1">
                        <NavItem icon={<LayoutDashboard size={16} />} label="Agendamentos" href="/" />
                        <NavItem icon={<Settings size={16} />} label="Configurações" href="/configuracao" />
                    </div>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800/50">
                <button
                    onClick={logout}
                    title={isSidebarCollapsed ? "Sair da Conta" : ""}
                    className={cn(
                        "flex items-center gap-3 w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group text-xs font-medium",
                        isSidebarCollapsed ? "p-2 justify-center" : "px-3 py-2.5"
                    )}
                >
                    <LogOut size={16} className="group-hover:rotate-12 transition-transform shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">Sair da Conta</span>}
                </button>
            </div>
        </aside>
    );
}
