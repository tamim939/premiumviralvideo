import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, Timer, CheckCircle2, Bot } from 'lucide-react';
import { Movie } from '../types';

interface UnlockModalProps {
  movie: Movie;
  onClose: () => void;
  t: any;
  theme?: string;
  user?: any;
}

export default function UnlockModal({ movie, onClose, t, theme, user }: UnlockModalProps) {
  const [step, setStep] = useState<'intro' | 'success'>('intro');
  const [showCheatNotice, setShowCheatNotice] = useState(false);
  const [adStartTime, setAdStartTime] = useState<number | null>(null);

  const getActiveAdLink = () => {
    if (!movie.adLinks || movie.adLinks.length === 0) return movie.adLink || '';
    
    // Total cycle duration in hours
    const totalCycleHours = movie.adLinks.reduce((acc, link) => {
      const duration = typeof link === 'string' ? 3 : (link.duration || 3);
      return acc + duration;
    }, 0);

    const msInHour = 1000 * 60 * 60;
    const currentMsInCycle = Date.now() % (totalCycleHours * msInHour);
    const currentHoursInCycle = currentMsInCycle / msInHour;
    
    let cumulativeHours = 0;
    for (const link of movie.adLinks) {
      const duration = typeof link === 'string' ? 3 : (link.duration || 3);
      cumulativeHours += duration;
      if (currentHoursInCycle < cumulativeHours) {
        return typeof link === 'string' ? link : link.url;
      }
    }
    const lastLink = movie.adLinks[movie.adLinks.length - 1];
    return typeof lastLink === 'string' ? lastLink : lastLink.url;
  };
  
  const activeAdLink = getActiveAdLink();

  useEffect(() => {
    const checkStatus = () => {
      if (!adStartTime || step === 'success') return;
      
      const isVisible = document.visibilityState === 'visible';
      const hasFocus = document.hasFocus();
      
      // If user comes back to the site, check if required time has passed
      if (isVisible || hasFocus) {
        const requiredTime = (movie.timer !== undefined ? movie.timer : 15) * 1000;
        const timePassed = Date.now() - adStartTime;
        
        // Short grace period to ignore instant app switches
        if (timePassed < 1500) return;

        if (timePassed >= requiredTime) {
          setStep('success');
          setAdStartTime(null);
        } else {
          // Cheat detected: Returned before the time was up!
          handleCheatDetected();
        }
      }
    };

    document.addEventListener('visibilitychange', checkStatus);
    window.addEventListener('focus', checkStatus);
    
    return () => {
      document.removeEventListener('visibilitychange', checkStatus);
      window.removeEventListener('focus', checkStatus);
    };
  }, [step, movie.timer, adStartTime]);

  const handleCheatDetected = () => {
    setShowCheatNotice(true);
    setStep('intro');
    setAdStartTime(null);
  };

  const handleStartAd = () => {
    setAdStartTime(Date.now());
    setShowCheatNotice(false);
    
    // Open the ad link
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(activeAdLink);
    } else {
      window.open(activeAdLink, '_blank');
    }
  };

  const handleReturnToBot = (url?: string) => {
    // Priority: Passed URL -> First target download link -> Telegram Bot fallback
    const targetLink = url || movie.downloadLinks?.[0]?.url || "https://t.me/movebd_bot";
    
    if (window.Telegram?.WebApp) {
      if (targetLink.includes('t.me')) {
        window.Telegram.WebApp.openTelegramLink(targetLink);
      } else {
        window.Telegram.WebApp.openLink(targetLink);
      }
      setTimeout(() => window.Telegram.WebApp.close(), 1000);
    } else {
      window.open(targetLink, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <AnimatePresence mode="wait">
        {step === 'success' ? (
          <motion.div 
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative w-full max-w-sm rounded-[44px] p-10 text-center shadow-3xl transition-colors duration-500 overflow-y-auto no-scrollbar max-h-[90vh] ${theme === 'dark' ? 'bg-zinc-950 border border-white/5 shadow-black' : 'bg-white shadow-2xl shadow-slate-200'}`}
          >
             <button 
                onClick={onClose}
                className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white/40' : 'bg-slate-100 hover:bg-slate-200 text-slate-400'}`}
              >
                <X className="h-5 w-5" />
              </button>

             <div className="mb-6 flex justify-center">
                <div className="relative">
                   <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10"
                   >
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                   </motion.div>
                </div>
             </div>

             <h2 className={`text-3xl font-black tracking-tighter mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                সফল হয়েছে!
             </h2>

             <div className="space-y-6 mb-10">
                <div className={`p-5 rounded-3xl flex items-center gap-4 text-left ${theme === 'dark' ? 'bg-zinc-900 border border-white/5' : 'bg-green-50/50 border border-green-100'}`}>
                   <span className="text-2xl">✅</span>
                   <p className={`text-sm font-bold leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'}`}>
                      ভিডিওটি আপনার ইনবক্সে পাঠানো হয়েছে।
                   </p>
                </div>
                
                <p className={`text-xs font-bold leading-relaxed text-center px-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`}>
                   নিচের বাটনে একটি ক্লিক করুন এবং বটে ফিরে যান — আপনার ভিডিওটি ইনবক্সে চলে গেছে। 🎬
                </p>
             </div>

             <button 
               onClick={() => handleReturnToBot()}
               className="group flex w-full items-center justify-center gap-3 rounded-[20px] bg-[#31ce76] py-5 text-sm font-black text-white shadow-xl shadow-green-500/20 active:scale-95 transition-all"
             >
                <div className="flex items-center gap-2">
                   <Bot className="h-5 w-5" />
                   <span>বটে ফিরে যান</span>
                </div>
             </button>
          </motion.div>
        ) : (
          <motion.div
            key="intro"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className={`relative w-full max-w-sm rounded-[40px] p-8 shadow-2xl ring-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 ring-white/10' : 'bg-white ring-black/5'}`}
          >
            <button 
              onClick={onClose}
              className={`absolute right-6 top-6 rounded-full p-2 transition-colors ${theme === 'dark' ? 'bg-zinc-900 text-zinc-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-900'}`}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 relative">
                <div className={`absolute -inset-4 animate-pulse rounded-full blur-xl ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-500/20'}`} />
                <div className={`relative rounded-3xl p-6 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-red-50'}`}>
                   <Lock className={`h-12 w-12 ${theme === 'dark' ? 'text-red-500' : 'text-red-600'}`} />
                </div>
              </div>

              {showCheatNotice && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 w-full rounded-2xl p-4 transition-colors ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}
                >
                  <p className="text-[13px] font-black text-red-500 tracking-tight text-center leading-relaxed">
                    আপনি ভিডিও দেখেননি আবার নতুন করে আনলক করুন।
                  </p>
                </motion.div>
              )}

              <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                ভিডিও আনলক করুন
              </h2>
              <p className={`mt-1 text-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                Video Unlock Platform
              </p>

              <div className="mt-8 w-full space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold">
                    <span>⏱️</span>
                    <span className="text-red-500">আপনাকে {movie.timer !== undefined ? movie.timer : 15} সেকেন্ডের একটি বিজ্ঞাপন দেখতে হবে।</span>
                  </div>
                  <p className={`text-xs font-bold leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>
                    যদি বিজ্ঞাপন না দেখেন, তবে আপনি ভিডিওটি পাবেন না।
                  </p>
                </div>

                <div className={`rounded-3xl p-5 text-center transition-colors ${theme === 'dark' ? 'bg-zinc-900/50 border border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-xs font-bold leading-relaxed mb-3 ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'}`}>
                    নিচের বাটনে ক্লিক করুন এবং <span className="text-red-500 font-black">কমপক্ষে {movie.timer !== undefined ? movie.timer : 15} সেকেন্ড</span> সেই পেজে থাকুন, তারপর ফিরে আসুন।
                  </p>
                  <p className="text-[11px] font-black leading-relaxed flex items-center justify-center gap-1.5">
                    <span className="text-yellow-500 decoration-none">⚠️</span>
                    <span className="text-red-500">
                      {movie.timer !== undefined ? movie.timer : 15} সেকেন্ডের আগে ফিরে আসলে ভিডিও পাঠানো হবে না।
                    </span>
                  </p>
                </div>

                <button
                  onClick={handleStartAd}
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-gradient-to-r from-red-600 to-red-400 py-6 text-sm font-black text-white shadow-2xl shadow-red-900/40 active:scale-95 transition-all"
                >
                  <span>🎬 বিজ্ঞাপন দেখুন & ভিডিও আনলক করুন</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
