"use client";

import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Props = {
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void;
};

export default function AuthModal({ onClose, defaultTab = 'login', onSuccess }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: 'Login berhasil! Mengalihkan...' });
      setTimeout(() => { onSuccess?.(); onClose(); }, 600);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (regPassword !== regPasswordConfirm) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }
    if (regPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter.' });
      return;
    }
    setLoading(true);
    const result = await register(regName, regEmail, regPassword);
    setLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: 'Akun berhasil dibuat! Mengalihkan...' });
      setTimeout(() => { onSuccess?.(); onClose(); }, 600);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md bg-white border-2 border-black shadow-[6px_6px_0px_#000] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-black text-white">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-white inline-block"></span>
            <span className="font-bold uppercase tracking-wider text-sm">AGROMONITOR JATENG</span>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b-2 border-black">
          <button
            onClick={() => { setTab('login'); setMessage(null); }}
            className={`flex-1 py-3 font-mono font-bold text-sm uppercase flex items-center justify-center gap-2 transition-colors ${tab === 'login' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
          >
            <LogIn size={16} /> Masuk
          </button>
          <button
            onClick={() => { setTab('register'); setMessage(null); }}
            className={`flex-1 py-3 font-mono font-bold text-sm uppercase flex items-center justify-center gap-2 border-l-2 border-black transition-colors ${tab === 'register' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
          >
            <UserPlus size={16} /> Daftar
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Status Message */}
          {message && (
            <div className={`p-3 border-2 font-mono text-xs flex items-start gap-2 ${message.type === 'success' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}>
              <span className="font-bold shrink-0">{message.type === 'success' ? '✔' : '✖'}</span>
              <span>{message.text}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 font-mono">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-gray-600">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="email@contoh.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border-2 border-gray-300 focus:border-black pl-9 pr-4 py-2.5 text-sm outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-gray-600">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full border-2 border-gray-300 focus:border-black pl-9 pr-10 py-2.5 text-sm outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-bold uppercase py-3 text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 border-2 border-black"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                {loading ? 'Memproses...' : 'MASUK'}
              </button>
              <p className="text-center text-xs text-gray-500 font-mono">
                Belum punya akun?{' '}
                <button type="button" onClick={() => { setTab('register'); setMessage(null); }} className="font-bold underline hover:no-underline text-black">Daftar sekarang</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 font-mono">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-gray-600">Nama Lengkap</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full border-2 border-gray-300 focus:border-black pl-9 pr-4 py-2.5 text-sm outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-gray-600">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="email@contoh.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full border-2 border-gray-300 focus:border-black pl-9 pr-4 py-2.5 text-sm outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-gray-600">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Min. 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full border-2 border-gray-300 focus:border-black pl-9 pr-10 py-2.5 text-sm outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-gray-600">Konfirmasi Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Ulangi password"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    className="w-full border-2 border-gray-300 focus:border-black pl-9 pr-4 py-2.5 text-sm outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-bold uppercase py-3 text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 border-2 border-black"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                {loading ? 'Memproses...' : 'BUAT AKUN'}
              </button>
              <p className="text-center text-xs text-gray-500 font-mono">
                Sudah punya akun?{' '}
                <button type="button" onClick={() => { setTab('login'); setMessage(null); }} className="font-bold underline hover:no-underline text-black">Masuk di sini</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
