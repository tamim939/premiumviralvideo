import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLogin({ onSuccess, onCancel }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check for specific admin email if needed, but user said "who knows email/pass"
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-[32px] bg-zinc-900 p-8 border border-white/5 shadow-2xl"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 rounded-full bg-red-600/10 p-4">
            <ShieldCheck className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
            Movie <span className="text-red-600">Admin</span>
          </h2>
          <p className="mt-2 text-center text-xs text-zinc-500">
            Login with your administrator credentials to manage the platform.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-xs font-semibold text-red-500 border border-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full rounded-2xl bg-zinc-800 py-4 pr-4 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-transparent transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full rounded-2xl bg-zinc-800 py-4 pr-4 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 border border-transparent transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-red-600 py-4 text-sm font-bold text-white shadow-xl shadow-red-900/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <button 
          onClick={onCancel}
          className="mt-6 w-full text-center text-xs font-bold text-zinc-500 hover:text-white transition-colors"
        >
          Cancel Login
        </button>
      </motion.div>
    </div>
  );
}
