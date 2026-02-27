'use client';

import React, { useState } from 'react';
import { Eye, Send, RotateCcw, PhoneOff, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AppointmentsTableProps {
    appointments: Appointment[];
    loading: boolean;
    onViewDetails: (appointment: Appointment, mode?: 'view' | 'send') => void;
    onRetry: (appointment: Appointment) => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
    appointments,
    loading,
    onViewDetails,
    onRetry
}) => {
    const { role } = useAuth();
    const isAdmin = role === 'admin';

    const [currentPage, setCurrentPage] = useState(1);
    const [prevAppointments, setPrevAppointments] = useState(appointments);
    const itemsPerPage = 50;

    // Reseta a página quando a lista de apontamentos muda (filtros, busca)
    if (appointments !== prevAppointments) {
        setPrevAppointments(appointments);
        setCurrentPage(1);
    }

    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAppointments = appointments.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-slate-500 text-sm font-medium">Carregando agendamentos...</p>
                </div>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <CalendarIcon className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Nenhum agendamento encontrado</h3>
                <p className="text-slate-500 text-center max-w-sm mb-6">
                    Não existem registros para os filtros selecionados ou para o termo buscado.
                </p>
            </div>
        );
    }

    const renderStatus = (apt: Appointment) => {
        const isPhoneInvalid = !apt.paciente_telefone || apt.paciente_telefone === '0' || apt.paciente_telefone.length < 8;

        if (isPhoneInvalid) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                    <PhoneOff size={12} className="mr-1" />
                    Sem telefone
                </span>
            );
        }

        if (apt.erro) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                    <AlertCircle size={12} className="mr-1" />
                    Erro
                </span>
            );
        }

        if (apt.notificado) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 size={12} className="mr-1" />
                    Notificado
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Pendente
            </span>
        );
    };

    return (
        <div className="w-full h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto scroll-smooth">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Telefone</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Horário</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Profissional</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedAppointments.map((apt, index) => (
                            <tr key={`${apt.appointment_id}-${index}`} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-slate-800 uppercase text-sm truncate max-w-[200px]" title={apt.paciente_nome}>
                                        {apt.paciente_nome}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-slate-600 text-sm font-medium">{apt.paciente_telefone === '0' || !apt.paciente_telefone ? '-' : apt.paciente_telefone}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-slate-600 text-sm">{apt.data_do_atendimento}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-slate-600 text-sm font-medium">{apt.horario_inicial_do_atendimento}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-slate-500 text-sm">{apt.professional_name || 'N/A'}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderStatus(apt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => onViewDetails(apt)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors bg-white border border-transparent hover:border-blue-100 hover:bg-blue-50 rounded-md"
                                            title="Detalhes"
                                        >
                                            <Eye size={18} />
                                        </button>

                                        {apt.erro && (
                                            <button
                                                onClick={() => onRetry(apt)}
                                                disabled={!isAdmin}
                                                className={`p-1.5 transition-colors bg-white border border-transparent rounded-md ${!isAdmin
                                                    ? 'text-slate-200 cursor-not-allowed'
                                                    : 'text-amber-500 hover:text-amber-600 hover:border-amber-100 hover:bg-amber-50'}`}
                                                title={isAdmin ? "Tentar novamente" : "Apenas administradores"}
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onViewDetails(apt, 'send')}
                                            disabled={!isAdmin || apt.notificado || apt.paciente_telefone === '0' || !apt.paciente_telefone || apt.paciente_telefone.length < 8}
                                            className={`p-1.5 transition-colors rounded-md border shadow-sm ${(!isAdmin || apt.notificado || apt.paciente_telefone === '0' || !apt.paciente_telefone || apt.paciente_telefone.length < 8)
                                                ? 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed'
                                                : 'text-slate-600 hover:text-blue-600 bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50'
                                                }`}
                                            title={isAdmin ? "Enviar notificação" : "Apenas administradores"}
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50 shrink-0">
                    <div className="text-sm text-slate-500">
                        Mostrando <span className="font-semibold text-slate-700">{startIndex + 1}</span> a <span className="font-semibold text-slate-700">{Math.min(startIndex + itemsPerPage, appointments.length)}</span> de <span className="font-semibold text-slate-700">{appointments.length}</span> resultados
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-medium text-slate-700">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
