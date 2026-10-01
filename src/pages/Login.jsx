import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('ahmad.dinur@student.univ.ac.id');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, password);
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    login('ahmad.dinur@student.univ.ac.id', 'demo');
    navigate('/dashboard');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-2">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dosen Chat Bot
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Student Communication Assistant & WhatsApp Auto Reminder
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email Mahasiswa"
              placeholder="nama@student.univ.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Input
              id="password"
              type="password"
              label="Kata Sandi"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full shadow-lg shadow-indigo-500/20"
            >
              Masuk ke Dashboard
            </Button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              atau akses instan
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full font-semibold"
            icon={Sparkles}
            onClick={handleQuickDemoLogin}
          >
            Masuk Langsung (Demo Mode)
          </Button>

          <div className="pt-2 text-[11px] text-slate-400 text-center space-y-1">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Akses aman terenkripsi & data tersimpan lokal
            </p>
          </div>
        </div>

        {/* Footer Feature Highlights */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
          <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40">
            ⏰ Auto Chat H-1 08.00 WIB
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40">
            🤖 AI Academic Drafter
          </div>
        </div>
      </div>
    </div>
  );
}
