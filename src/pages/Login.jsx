import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!tokenInput.trim()) {
      setErrorMessage('Silakan masukkan token akses.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = loginWithToken(tokenInput);
      setLoading(false);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.message);
      }
    }, 300);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-2 ring-4 ring-indigo-500/10">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dosen Chat Bot
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Student Communication Assistant & WhatsApp Automation
          </p>
        </div>

        {/* Token Access Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5">
          <div className="text-center space-y-1 pb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Proteksi Akses Token</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-1">
              Masukkan Token Akses
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Website ini dilindungi. Masukkan token akses untuk membuka dashboard.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tokenInput"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
              >
                Token Akses
              </label>
              <div className="relative">
                <input
                  id="tokenInput"
                  type={showToken ? 'text' : 'password'}
                  inputMode="numeric"
                  placeholder="Masukkan 4 digit token"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoFocus
                  required
                  className="w-full text-center tracking-widest text-lg font-mono font-bold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                  aria-label="Toggle token visibility"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              className="w-full shadow-lg shadow-indigo-500/25 justify-center py-3"
            >
              Buka Akses Dashboard
            </Button>
          </form>

          <div className="pt-2 text-[11px] text-slate-400 text-center space-y-1">
            <p className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Sesi terenkripsi secara lokal di browser Anda
            </p>
          </div>
        </div>

        {/* Footer Feature Highlights */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
          <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40">
            ⏰ Auto Chat H-1 08.00 WIB
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40">
            📱 WhatsApp Multi-Device
          </div>
        </div>
      </div>
    </div>
  );
}
