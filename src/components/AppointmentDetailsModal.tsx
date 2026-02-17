'use client';

import React from 'react';
import { X, User, Phone, Calendar, Clock, Stethoscope, MessageSquare, History, CheckCircle, Send, Settings } from 'lucide-react';
import { Appointment } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onMarkAsNotified: (id: number) => void;
    onSendNotification: (appointment: Appointment) => void;
}

export const AppointmentDetailsModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    appointment,
    onMarkAsNotified,
    onSendNotification
}) => {
    const { role } = useAuth();
    const isAdmin = role === 'admin';

    if (!isOpen || !appointment) return null;

    const isPhoneInvalid = !appointment.paciente_telefone || appointment.paciente_telefone === '0' || appointment.paciente_telefone.length < 8;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">Detalhes do Agendamento</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paciente</p>
                                    <p className="text-lg font-bold text-slate-800 uppercase">{appointment.paciente_nome}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className={`mt-1 p-2 rounded-lg ${isPhoneInvalid ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telefone</p>
                                    <p className="text-lg font-medium text-slate-700">
                                        {appointment.paciente_telefone}
                                        {isPhoneInvalid && <span className="ml-2 text-xs font-bold text-red-500">(Inválido/Ausente)</span>}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="mt-1 bg-slate-50 p-2 rounded-lg text-slate-600">
                                    <Stethoscope size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profissional</p>
                                    <p className="text-lg font-medium text-slate-700">{appointment.professional_name || 'Não informado'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data do Atendimento</p>
                                    <p className="text-lg font-medium text-slate-700">{appointment.data_do_atendimento}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="mt-1 bg-amber-50 p-2 rounded-lg text-amber-600">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Horário</p>
                                    <p className="text-lg font-medium text-slate-700">
                                        {appointment.horario_inicial_do_atendimento}
                                        {appointment.horario_final_do_atendimento && ` - ${appointment.horario_final_do_atendimento}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="mt-1 bg-slate-50 p-2 rounded-lg text-slate-600">
                                    <History size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ID Agendamento</p>
                                    <p className="text-lg font-medium text-slate-700">#{appointment.appointment_id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <h3 className="flex items-center text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                            <MessageSquare size={16} className="mr-2" />
                            Histórico de Notificações
                        </h3>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[100px] flex items-center justify-center">
                            {appointment.notificado ? (
                                <div className="flex items-center space-x-3 text-emerald-600">
                                    <CheckCircle size={20} />
                                    <span className="font-medium text-sm">Notificação enviada com sucesso em {appointment.data_do_atendimento}</span>
                                </div>
                            ) : appointment.erro ? (
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-3 text-red-600">
                                        <X size={20} />
                                        <span className="font-medium text-sm">Falha no último envio: {appointment.error_message || 'Erro desconhecido'}</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-slate-400 text-sm">Nenhuma notificação enviada ainda.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap gap-3 justify-end bg-slate-50/50">
                    <button
                        onClick={() => { }}
                        disabled={!isAdmin}
                        className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${!isAdmin ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm'}`}
                    >
                        <Settings size={16} />
                        <span>Config. Profissional</span>
                    </button>

                    <button
                        onClick={() => onMarkAsNotified(appointment.appointment_id)}
                        disabled={!isAdmin}
                        className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${!isAdmin ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm'}`}
                    >
                        <CheckCircle size={16} />
                        <span>Marcar como notificado</span>
                    </button>

                    <button
                        onClick={() => onSendNotification(appointment)}
                        disabled={!isAdmin || appointment.notificado || isPhoneInvalid}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg shadow-md transition-all text-sm font-bold ${(!isAdmin || appointment.notificado || isPhoneInvalid)
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                            }`}
                    >
                        <Send size={16} />
                        <span>{isAdmin ? 'Enviar Agora' : 'Ação de Admin'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
