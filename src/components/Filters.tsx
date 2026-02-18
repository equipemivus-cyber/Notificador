'use client';

import React from 'react';
import { Calendar, Users, Filter, Clock } from 'lucide-react';
import { Professional, FilterStatus, FilterTurno } from '@/types';

interface FiltersProps {
    date: string;
    setDate: (date: string) => void;
    professionalId: string;
    setProfessionalId: (id: string) => void;
    status: FilterStatus;
    setStatus: (status: FilterStatus) => void;
    turno: FilterTurno;
    setTurno: (turno: FilterTurno) => void;
    professionals: Professional[];
    activeTab: 'hoje' | 'anteriores';
    setActiveTab: (tab: 'hoje' | 'anteriores') => void;
}

export const Filters: React.FC<FiltersProps> = ({
    date,
    setDate,
    professionalId,
    setProfessionalId,
    status,
    setStatus,
    turno,
    setTurno,
    professionals,
    activeTab,
    setActiveTab
}) => {
    return (
        <div className="flex flex-col space-y-4 mb-6">
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('hoje')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'hoje'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                        }`}
                >
                    <Calendar size={16} />
                    <span>Hoje e próximos</span>
                </button>
                <button
                    onClick={() => setActiveTab('anteriores')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'anteriores'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                        }`}
                >
                    <Filter size={16} />
                    <span>Anteriores</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="relative">
                    <input
                        type="date"
                        className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <select
                        className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={professionalId}
                        onChange={(e) => setProfessionalId(e.target.value)}
                    >
                        <option value="all">Todos Profissionais</option>
                        {professionals.map((prof) => (
                            <option key={prof.professionals_id} value={prof.professionals_id.toString()}>
                                {prof.professionals_name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Users size={16} className="text-slate-400" />
                    </div>
                </div>

                <div className="relative">
                    <select
                        className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as FilterStatus)}
                    >
                        <option value="Todos">Todos Status</option>
                        <option value="Não Notificado">Não Notificado</option>
                        <option value="Notificado">Notificado</option>
                        <option value="Erro">Erro</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Filter size={16} className="text-slate-400" />
                    </div>
                </div>

                <div className="relative">
                    <select
                        className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={turno}
                        onChange={(e) => setTurno(e.target.value as FilterTurno)}
                    >
                        <option value="Todos">Todos Turnos</option>
                        <option value="Manhã">Manhã</option>
                        <option value="Tarde">Tarde</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Clock size={16} className="text-slate-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};
