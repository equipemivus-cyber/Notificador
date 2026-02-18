'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, LogIn, ShieldCheck, User } from 'lucide-react';

export function LoginPage() {
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(code);
        if (!success) {
            setError(true);
            setTimeout(() => setError(false), 300);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-100 z-[9999]">
            {/* Background elements for aesthetic */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>

            <div className={`w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl transition-transform duration-300 ${error ? 'animate-shake' : ''}`}>
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
                        <Lock className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Notificador Mivus</h1>
                    <p className="text-slate-500 mt-1">Insira seu código de acesso para entrar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2 mt-1">
                            Código de Acesso
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <ShieldCheck size={20} />
                            </div>
                            <input
                                type="password"
                                id="code"
                                autoComplete="off"
                                className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-xs mt-2 ml-1">Código inválido. Tente novamente.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Acessar Sistema
                        <LogIn size={18} />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Admin</p>
                            <p className="text-xs font-semibold text-slate-600 truncate">Acesso Total</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Usuário</p>
                            <p className="text-xs font-semibold text-slate-600 truncate">Visualização</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
        </div>
    );
}
