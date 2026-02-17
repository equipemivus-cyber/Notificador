'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Professional } from '@/types';
import { Save, User, Calendar, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MessageConfig {
    professional_id: number;
    template_morning: string;
    template_afternoon: string;
    days_before: number;
    monday_days_before: number;
    is_active: boolean;
}

export default function ConfigPage() {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [selectedProfId, setSelectedProfId] = useState<number | null>(null);
    const [config, setConfig] = useState<MessageConfig>({
        professional_id: 0,
        template_morning: 'Olá {paciente_nome}, lembrando da sua consulta com {profissional_nome} dia {data_atendimento} às {horario_atendimento}.',
        template_afternoon: 'Olá {paciente_nome}, lembrando da sua consulta com {profissional_nome} dia {data_atendimento} às {horario_atendimento}.',
        days_before: 1,
        monday_days_before: 2,
        is_active: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const { role } = useAuth();
    const isAdmin = role === 'admin';

    useEffect(() => {
        async function loadProfessionals() {
            const { data } = await supabase
                .from('clinicorp_professionals')
                .select('*')
                .eq('business_id', '6330482543820800')
                .order('professionals_name');
            if (data) {
                setProfessionals(data);
                if (data.length > 0) setSelectedProfId(data[0].professionals_id);
            }
            setLoading(false);
        }
        loadProfessionals();
    }, []);

    useEffect(() => {
        if (selectedProfId) {
            loadConfig(selectedProfId);
        }
    }, [selectedProfId]);

    async function loadConfig(profId: number) {
        const { data, error } = await supabase
            .from('clinicorp_appointments_message_configs')
            .select('*')
            .eq('professional_id', profId)
            .eq('business_id', '6330482543820800')
            .single();

        if (data) {
            setConfig({
                professional_id: data.professional_id,
                template_morning: data.template_morning,
                template_afternoon: data.template_afternoon,
                days_before: data.days_before,
                monday_days_before: data.monday_days_before,
                is_active: data.is_active ?? true
            });
        } else {
            // Set default for new config
            setConfig({
                professional_id: profId,
                template_morning: 'Olá {paciente_nome}, lembrando da sua consulta com {profissional_nome} dia {data_atendimento} às {horario_atendimento}.',
                template_afternoon: 'Olá {paciente_nome}, lembrando da sua consulta com {profissional_nome} dia {data_atendimento} às {horario_atendimento}.',
                days_before: 1,
                monday_days_before: 2,
                is_active: true
            });
        }
    }

    async function handleSave() {
        if (!selectedProfId) return;
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('clinicorp_appointments_message_configs')
                .upsert({
                    professional_id: selectedProfId,
                    business_id: '6330482543820800',
                    template_morning: config.template_morning,
                    template_afternoon: config.template_afternoon,
                    days_before: config.days_before,
                    monday_days_before: config.monday_days_before,
                    is_active: config.is_active,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'professional_id' });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Configuração salva com sucesso!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Erro ao salvar configuração.' });
        } finally {
            setSaving(false);
        }
    }

    const selectedProf = professionals.find(p => p.professionals_id === selectedProfId);

    return (
        <main className="h-full flex flex-col overflow-hidden bg-slate-50">
            <div className="flex-1 flex flex-col p-4 md:p-6 w-full overflow-hidden">
                <Header
                    title="Configurar Mensagens"
                    showSearch={false}
                    searchTerm=""
                    setSearchTerm={() => { }}
                    onRefresh={() => { }}
                />

                <div className="flex-1 flex flex-col md:flex-row gap-8 mt-4 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-full md:w-80 space-y-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Profissionais</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                                {professionals.map((prof) => (
                                    <button
                                        key={prof.professionals_id}
                                        onClick={() => setSelectedProfId(prof.professionals_id)}
                                        className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center space-x-3 ${selectedProfId === prof.professionals_id
                                            ? 'bg-blue-50 text-blue-700 font-bold'
                                            : 'hover:bg-slate-50 text-slate-600'
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-lg ${selectedProfId === prof.professionals_id ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                            <User size={16} />
                                        </div>
                                        <span className="truncate">{prof.professionals_name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Customizar Mensagem</h2>
                                        <p className="text-xs text-slate-500 font-medium">{selectedProf?.professionals_name}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving || !selectedProfId || !isAdmin}
                                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={18} />
                                    <span>{saving ? 'Salvando...' : isAdmin ? 'Salvar Alterações' : 'Apenas Admin'}</span>
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                {message && (
                                    <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                        }`}>
                                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        <span>{message.text}</span>
                                    </div>
                                )}

                                {/* Templates Variables Info */}
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center">
                                        <AlertCircle size={14} className="mr-1" />
                                        Variáveis Disponíveis
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['{paciente_nome}', '{profissional_nome}', '{data_atendimento}', '{horario_atendimento}'].map(v => (
                                            <code key={v} className="bg-white border border-amber-200 px-2 py-1 rounded text-xs text-amber-900 font-mono">{v}</code>
                                        ))}
                                    </div>
                                </div>

                                {/* Activation Status Toggle */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${config.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Status do Envio</p>
                                            <p className="text-xs text-slate-500 font-medium">Ativa ou desativa os envios automáticos para este profissional</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => isAdmin && setConfig({ ...config, is_active: !config.is_active })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.is_active ? 'bg-emerald-500' : 'bg-slate-300'} ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                {/* Text Areas */}
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                                            Mensagem - Período da Manhã
                                        </label>
                                        <textarea
                                            className={`w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700 bg-slate-50/30 transition-all font-medium ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            placeholder="Mensagem para quem consulta de manhã..."
                                            value={config.template_morning}
                                            readOnly={!isAdmin}
                                            onChange={(e) => setConfig({ ...config, template_morning: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
                                            Mensagem - Período da Tarde
                                        </label>
                                        <textarea
                                            className={`w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700 bg-slate-50/30 transition-all font-medium ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            placeholder="Mensagem para quem consulta de tarde..."
                                            value={config.template_afternoon}
                                            readOnly={!isAdmin}
                                            onChange={(e) => setConfig({ ...config, template_afternoon: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Scheduling Rules */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2 text-slate-800">
                                            <Calendar size={18} className="text-blue-600" />
                                            <span className="text-sm font-bold">Regra Padrão</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 font-bold uppercase">Enviar com quantos dias de antecedência?</label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="7"
                                                    readOnly={!isAdmin}
                                                    className={`w-20 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    value={config.days_before}
                                                    onChange={(e) => setConfig({ ...config, days_before: parseInt(e.target.value) || 1 })}
                                                />
                                                <span className="text-sm text-slate-600 font-medium">dia(s) antes</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2 text-slate-800">
                                            <Calendar size={18} className="text-indigo-600" />
                                            <span className="text-sm font-bold">Exceção: Segunda-Feira</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 font-bold uppercase">Para consultas na Segunda, enviar no Sábado?</label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="7"
                                                    readOnly={!isAdmin}
                                                    className={`w-20 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    value={config.monday_days_before}
                                                    onChange={(e) => setConfig({ ...config, monday_days_before: parseInt(e.target.value) || 2 })}
                                                />
                                                <span className="text-sm text-slate-600 font-medium">dia(s) antes (ex: 2 = Sábado)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
