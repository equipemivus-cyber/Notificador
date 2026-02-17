'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Settings, LayoutDashboard, ChevronRight, Menu, ChevronLeft, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Sidebar = () => {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { role, logout } = useAuth();

    const menuItems = [
        {
            name: 'Agendamentos',
            icon: <LayoutDashboard size={20} />,
            href: '/',
            active: pathname === '/'
        },
        {
            name: 'Mensagens',
            icon: <Settings size={20} />,
            href: '/configuracao',
            active: pathname === '/configuracao'
        }
    ];

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 h-screen sticky top-0 flex flex-col border-r border-slate-800 transition-all duration-300 shrink-0 hidden md:flex overflow-hidden`}>
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                    <div className="flex items-center space-x-3 text-white overflow-hidden animate-in fade-in duration-300">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20 shrink-0">
                            <Calendar size={24} />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-100 truncate">Notificador Mivus</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20 text-white">
                        <Calendar size={20} />
                    </div>
                )}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        title={isCollapsed ? item.name : ''}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-xl transition-all group ${item.active
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <span className={`${item.active ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-400'} shrink-0`}>
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="font-semibold text-sm whitespace-nowrap animate-in slide-in-from-left-2 duration-300">{item.name}</span>}
                        </div>
                        {item.active && !isCollapsed && <ChevronRight size={14} className="text-blue-500/50" />}
                    </Link>
                ))}
            </nav>

            <div className="p-3 border-t border-slate-800 space-y-2">
                {!isCollapsed && (
                    <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                                {role === 'admin' ? <ShieldCheck size={20} className="text-blue-400" /> : <UserIcon size={20} />}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-200 truncate capitalize">{role}</p>
                                <p className="text-[10px] text-slate-500 font-medium truncate">{role === 'admin' ? 'Acesso Total' : 'Visualização'}</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-all"
                        >
                            <LogOut size={14} />
                            <span>Sair</span>
                        </button>
                    </div>
                )}

                {isCollapsed && (
                    <button
                        onClick={logout}
                        title="Sair"
                        className="w-full flex items-center justify-center p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center p-3 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                >
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </div>
    );
};
