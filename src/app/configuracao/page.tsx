'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Professional } from '@/types';
import { Save, User, Calendar, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { confirmAction, showAlert, toast } from '@/lib/swal';

interface MessageConfig {
    professional_id: number;
    template_morning: string;
    template_afternoon: string;
    days_before: number;
    monday_days_before: number;
    is_active: boolean;
    trigger_time: string;
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
        is_active: true,
        trigger_time: '09:00'
    });
    const [saving, setSaving] = useState(false);
    const [configs, setConfigs] = useState<Record<number, boolean>>({});
    const [activeTemplate, setActiveTemplate] = useState<'morning' | 'afternoon'>('morning');
    const { role } = useAuth();
    const isAdmin = role === 'admin';
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfessionals = async () => {
            setLoading(true);
            try {
                // 1. Buscar profissionais
                const { data: profData, error: profError } = await supabase
                    .from('clinicorp_professionals')
                    .select('*')
                    .eq('business_id', '6330482543820800')
                    .order('professionals_name');

                if (profError) throw profError;
                setProfessionals(profData || []);

                // 2. Buscar status de envio de todos
                const { data: configsData, error: configError } = await supabase
                    .from('clinicorp_appointments_message_configs')
                    .select('professional_id, is_active')
                    .eq('business_id', '6330482543820800');

                if (!configError && configsData) {
                    const configMap: Record<number, boolean> = {};
                    configsData.forEach(c => {
                        configMap[c.professional_id] = c.is_active;
                    });
                    setConfigs(configMap);
                }

                if (profData && profData.length > 0 && !selectedProfId) {
                    setSelectedProfId(profData[0].professionals_id);
                }
            } catch (err) {
                console.error('Erro ao buscar profissionais:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessionals();
    }, []);


    const editorRef = useRef<HTMLDivElement>(null);

    // Função para salvar a posição do cursor (caret)
    const saveCaretPosition = (element: HTMLElement) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return 0;
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    };

    // Função para restaurar a posição do cursor
    const restoreCaretPosition = (element: HTMLElement, position: number) => {
        let charCount = 0;
        const nodeStack: Node[] = [element];
        let node: Node | undefined;
        const range = document.createRange();
        range.setStart(element, 0);
        range.collapse(true);

        while ((node = nodeStack.pop())) {
            if (node.nodeType === 3) { // Text node
                const nextCharCount = charCount + (node.textContent?.length || 0);
                if (position >= charCount && position <= nextCharCount) {
                    range.setStart(node, position - charCount);
                    range.collapse(true);
                    const selection = window.getSelection();
                    if (selection) {
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                    return;
                }
                charCount = nextCharCount;
            } else {
                let i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }
    };

    const updateEditorContent = useCallback((text: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        // Se o texto bruto no editor já for o mesmo que o estado, não precisamos mexer
        // Isso evita loops e perda de performance, mas permite que o formatWhatsAppText "limpe" o HTML
        const formatted = formatWhatsAppText(text);

        // Comparamos com innerHTML apenas se o innerText for diferente ou se houver "lixo" no HTML
        // Mas a forma mais segura de limpar o vazamento de cor é resetar o innerHTML se ele não bater com o esperado
        if (editor.innerHTML !== formatted) {
            const position = saveCaretPosition(editor);
            editor.innerHTML = formatted;
            setTimeout(() => restoreCaretPosition(editor, position), 0);
        }
    }, []);

    useEffect(() => {
        const text = activeTemplate === 'morning' ? config.template_morning : config.template_afternoon;
        updateEditorContent(text);
    }, [activeTemplate, config.template_morning, config.template_afternoon, updateEditorContent]);

    const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
        // innerText é muito mais confiável para pegar o que o usuário quer dizer de verdade
        const text = e.currentTarget.innerText;
        const field = activeTemplate === 'morning' ? 'template_morning' : 'template_afternoon';
        setConfig(prev => ({ ...prev, [field]: text }));
    };

    const loadConfig = useCallback(async (profId: number) => {
        const { data } = await supabase
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
                is_active: data.is_active ?? true,
                trigger_time: data.trigger_time?.substring(0, 5) ?? '09:00'
            });
        } else {
            // Set default for new config
            setConfig({
                professional_id: profId,
                template_morning: 'Olá {paciente_nome}, lembrando da sua consulta com {profissional_nome} dia {data_atendimento} às {horario_atendimento}.',
                template_afternoon: 'Olá {paciente_nome}, lembrando da sua consulta com {profissional_nome} dia {data_atendimento} às {horario_atendimento}.',
                days_before: 1,
                monday_days_before: 2,
                is_active: true,
                trigger_time: '09:00'
            });
        }
    }, []);

    useEffect(() => {
        if (selectedProfId) {
            loadConfig(selectedProfId);
        }
    }, [selectedProfId, loadConfig]);

    async function handleSave() {
        if (!selectedProfId) return;

        const confirmed = await confirmAction(
            'Salvar Alterações?',
            `Deseja salvar as configurações para ${selectedProf?.professionals_name}?`,
            'question'
        );

        if (!confirmed) return;

        setSaving(true);

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
                    trigger_time: config.trigger_time,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'professional_id' });

            if (error) throw error;
            setConfigs(prev => ({ ...prev, [selectedProfId]: config.is_active }));
            toast.fire({
                icon: 'success',
                title: 'Configuração salva com sucesso!'
            });
        } catch (err) {
            console.error(err);
            showAlert('Erro', 'Não foi possível salvar a configuração.', 'error');
        } finally {
            setSaving(false);
        }
    }

    const selectedProf = professionals.find(p => p.professionals_id === selectedProfId);

    const formatWhatsAppText = useCallback((text: string) => {
        if (!text) return '';

        // 1. Dividir o texto em blocos de variáveis e blocos de texto normal
        // O regex captura as chaves para mantê-las no array resultante do split
        const parts = text.split(/(\{.*?\})/g);

        const formattedParts = parts.map(part => {
            // Se for uma variável (começa com { e termina com })
            if (part.startsWith('{') && part.endsWith('}')) {
                // Escapa a variável e aplica o azul + negrito
                const escaped = part
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                return `<span class="text-blue-700 font-bold">${escaped}</span>`;
            }

            // Se for texto normal
            let formatted = part
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // Aplica Negrito (*texto*)
            formatted = formatted.replace(/\*(.*?)\*/g, '<span class="font-bold">*$1*</span>');

            // Aplica Itálico (_texto_)
            formatted = formatted.replace(/_(.*?)_/g, '<span class="italic">_$1_</span>');

            // Aplica Tachado (~texto~)
            formatted = formatted.replace(/~(.*?)~/g, '<span class="line-through text-slate-400">~$1~</span>');

            return formatted;
        });

        // Junta tudo e converte novas linhas em <br/>
        return formattedParts.join('').replace(/\n/g, '<br/>');
    }, []);

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
                                {loading && professionals.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        <p className="text-xs font-medium">Carregando profissionais...</p>
                                    </div>
                                ) : professionals.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 italic text-sm">
                                        Nenhum profissional encontrado.
                                    </div>
                                ) : (
                                    professionals.map((prof, index) => {
                                        const isActive = configs[prof.professionals_id] ?? true;
                                        return (
                                            <button
                                                key={`${prof.professionals_id}-${index}`}
                                                onClick={() => setSelectedProfId(prof.professionals_id)}
                                                className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center space-x-3 ${selectedProfId === prof.professionals_id
                                                    ? 'bg-blue-50 text-blue-700 font-bold border-r-4 border-blue-600'
                                                    : 'hover:bg-slate-50 text-slate-600'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    <User size={16} />
                                                </div>
                                                <span className={`truncate flex-1 ${!isActive ? 'text-slate-400 italic' : ''}`}>{prof.professionals_name}</span>
                                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                                            </button>
                                        );
                                    })
                                )}
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

                                {/* Alternador de Período */}
                                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                                    <button
                                        onClick={() => setActiveTemplate('morning')}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTemplate === 'morning' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Período Manhã
                                    </button>
                                    <button
                                        onClick={() => setActiveTemplate('afternoon')}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTemplate === 'afternoon' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Período Tarde
                                    </button>
                                </div>

                                {/* Editor Integrado ao WhatsApp */}
                                <div className="bg-[#e5ddd5] p-6 md:p-12 rounded-2xl border border-slate-200 overflow-hidden relative min-h-[300px] flex items-center justify-center">
                                    <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'url("https://wweb.dev/assets/whatsapp-chat-wallpaper.png")', backgroundSize: '400px' }}></div>

                                    <div className="relative w-full max-w-xl">
                                        <div className="bg-[#dcf8c6] p-4 rounded-lg rounded-tr-none shadow-md relative ml-auto block w-full text-[14.2px] text-[#111b21] leading-tight group border border-[#c6e9af]">
                                            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[10px] border-t-[#dcf8c6] border-r-[10px] border-r-transparent"></div>

                                            <div className="relative min-h-[120px]">
                                                {/* Editor ContentEditable (CSS Nativo) */}
                                                <div
                                                    ref={editorRef}
                                                    contentEditable={isAdmin}
                                                    onInput={handleEditorInput}
                                                    className="w-full bg-transparent border-none focus:ring-0 p-0 outline-none font-sans text-[#111b21] leading-tight min-h-[120px] whitespace-pre-wrap break-words"
                                                    style={{ fontSize: '14.2px' }}
                                                />
                                                {!(activeTemplate === 'morning' ? config.template_morning : config.template_afternoon) && (
                                                    <div className="absolute top-0 left-0 pointer-events-none text-slate-400 italic text-[14.2px]">
                                                        Digite sua mensagem aqui...
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-2 border-t border-[#c6e9af]/50 pt-2">
                                                <div className="text-[10px] text-slate-500 italic">
                                                    Dica: use *negrito* e _itálico_
                                                </div>
                                                <div className="text-[11px] text-[#667781] flex items-center">
                                                    <span>{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
                                                    <span className="ml-1 text-blue-500">✓✓</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Scheduling Rules */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                                    <div className="space-y-4 justify-self-start">
                                        <div className="flex items-center space-x-2 text-slate-800">
                                            <Calendar size={18} className="text-blue-600" />
                                            <span className="text-sm font-bold">Horário de Disparo</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 font-bold uppercase">Hora do disparo diário</label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="time"
                                                    readOnly={!isAdmin}
                                                    className={`p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    value={config.trigger_time}
                                                    onChange={(e) => setConfig({ ...config, trigger_time: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 hidden">
                                        <div className="flex items-center space-x-2 text-slate-800">
                                            <Calendar size={18} className="text-blue-600" />
                                            <span className="text-sm font-bold">Regra Padrão</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 font-bold uppercase">Dias de antecedência</label>
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
                                                <span className="text-sm text-slate-600 font-medium">dia(s)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 hidden">
                                        <div className="flex items-center space-x-2 text-slate-800">
                                            <Calendar size={18} className="text-indigo-600" />
                                            <span className="text-sm font-bold">Exceção: Segunda-Feira</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 font-bold uppercase">Antecedência p/ Segunda</label>
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
                                                <span className="text-sm text-slate-600 font-medium">dia(s) (ex: 2 = Sábado)</span>
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
