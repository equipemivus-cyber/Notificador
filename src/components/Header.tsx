'use client';

import React from 'react';
import { Settings, RefreshCw, Search } from 'lucide-react';

import Link from 'next/link';

interface HeaderProps {
    onRefresh: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    title?: string;
    showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    onRefresh,
    searchTerm,
    setSearchTerm,
    title = "Agendamentos",
    showSearch = true
}) => {
    return (
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 pb-6">
            <div>
                <Link href="/">
                    <h1 className="text-3xl font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">{title}</h1>
                </Link>
            </div>

            <div className="flex items-center space-x-3">
                {showSearch && (
                    <div className="relative flex-1 md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar paciente, telefone ou ID..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                <button
                    onClick={onRefresh}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    title="Atualizar"
                >
                    <RefreshCw size={20} className="hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>
        </div>
    );
};
