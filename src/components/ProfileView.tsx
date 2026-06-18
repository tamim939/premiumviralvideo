import React from 'react';
import { 
  Crown, 
  Film, 
  Trophy, 
  GraduationCap, 
  Facebook, 
  Send, 
  MessageSquare, 
  Settings, 
  Moon, 
  Info, 
  ChevronRight, 
  Home,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  user: any;
  onGoHome: () => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  onTriggerAdminLogin?: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  lang: string;
  setLang: (lang: any) => void;
  t: any;
}

export default function ProfileView({ 
  user, 
  onGoHome, 
  onLogout, 
  isAdmin, 
  onTriggerAdminLogin,
  theme,
  setTheme,
  lang,
  setLang,
  t
}: ProfileViewProps) {
  return (
    <div className={`min-h-screen pb-32 overflow-y-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header Profile */}
      <div className={`relative pt-12 pb-6 px-6 shadow-sm transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-b border-white/5' : 'bg-white'}`}>
        <div className="flex flex-col items-center">
          <div className="relative">
            {user?.photo_url ? (
              <img 
                src={user.photo_url} 
                alt="Profile" 
                className={`h-24 w-24 rounded-full border-4 shadow-lg object-cover ${theme === 'dark' ? 'border-zinc-800' : 'border-white'}`} 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold border-4 shadow-lg ${theme === 'dark' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-zinc-100 text-zinc-400 border-white'}`}>
                {user?.first_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 rounded-full p-1 shadow-md ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
               <div className={`rounded-full p-1 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                  <ChevronRight className={`h-3 w-3 rotate-90 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`} />
               </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <h2 className={`flex items-center justify-center gap-1 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
               <span className="text-2xl font-black italic">⟨</span>
               {user?.first_name || 'TRADER TAMIM'} —✈︎ 
               <span className="text-pink-400">🌸</span>
            </h2>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>@{user?.username || 'TRADER_TAMIM_3'}</p>
            <div className={`mt-2 inline-block rounded-full px-4 py-1 text-[10px] font-bold border ${theme === 'dark' ? 'bg-blue-600/10 text-blue-400 border-blue-400/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              {t.memberLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 mt-6">
        <div className={`grid grid-cols-3 rounded-[32px] p-6 text-white shadow-xl ${theme === 'dark' ? 'bg-zinc-900 border border-white/5' : 'bg-[#1a1c2c]'}`}>
          <div className="flex flex-col items-center border-r border-white/10 px-2">
            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-500' : 'text-yellow-400'}`}>0</span>
            <div className="flex items-center gap-1 mt-1">
              <div className="h-4 w-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <div className={`h-2 w-2 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-yellow-400'}`} />
              </div>
              <span className="text-[10px] text-zinc-400 font-bold">{t.coins}</span>
            </div>
          </div>
          <div className="flex flex-col items-center border-r border-white/10 px-2">
            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-500' : 'text-yellow-400'}`}>0</span>
            <div className="flex items-center gap-1 mt-1">
              <div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
              </div>
              <span className="text-[10px] text-zinc-400 font-bold">{t.referrals}</span>
            </div>
          </div>
          <div className="flex flex-col items-center px-2">
            <span className="text-lg font-bold">Normal</span>
            <div className="flex items-center gap-1 mt-1 text-zinc-400">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-[10px] font-bold">{t.vipStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 mt-6">
        <button className="flex h-16 items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 text-white shadow-lg transition-transform active:scale-95">
          <div className="rounded-xl bg-white/20 p-2">
            <Crown className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold leading-tight text-left">{t.vip}</span>
        </button>
        <button className="flex h-16 items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-4 text-white shadow-lg transition-transform active:scale-95">
          <div className="rounded-xl bg-white/20 p-2">
            <Film className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold leading-tight text-left">{t.request}</span>
        </button>
        <button className="flex h-16 items-center gap-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-400 px-4 text-white shadow-lg transition-transform active:scale-95">
          <div className="rounded-xl bg-white/20 p-2">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold leading-tight text-left">{t.leaderboard}</span>
        </button>
        <button className="flex h-16 items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 text-white shadow-lg transition-transform active:scale-95">
          <div className="rounded-xl bg-white/20 p-2">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold leading-tight text-left">{t.training}</span>
        </button>
      </div>

      {/* Community Links */}
      <div className="mt-8 px-4">
        <div className="flex items-center gap-2 mb-4 text-slate-400">
           <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${theme === 'dark' ? 'border-zinc-700' : 'border-slate-300'}`}>
             <div className={`h-1 w-1 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-slate-300'}`} />
           </div>
           <span className="text-xs font-bold uppercase tracking-wider">{t.community}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <LinkButton icon={<Facebook className="h-4 w-4" />} label="Facebo..." subLabel="আমাদের গ্রুপে ..." color="bg-blue-600" />
          <LinkButton icon={<Send className="h-4 w-4" />} label="Main Cha..." subLabel="অফিসিয়াল ..." color="bg-cyan-500" />
          <LinkButton icon={<Send className="h-4 w-4" />} label="Join Noti..." subLabel="মুভি রিকোয়ায়ে..." color="bg-blue-800" />
          <LinkButton icon={<Send className="h-4 w-4" />} label="Chat Gro..." subLabel="গ্রুপে চ্যাট ক..." color="bg-sky-500" />
          <div className="col-span-2">
            <LinkButton icon={<MessageSquare className="h-4 w-4" />} label="🔴 All C..." subLabel="সকল চ্যানেলে..." color="bg-cyan-600" fullWidth />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mt-8 px-4">
         <div className="flex items-center gap-2 mb-4 text-slate-400">
           <Settings className="h-4 w-4" />
           <span className="text-xs font-bold uppercase tracking-wider">{t.settings}</span>
        </div>

        <div className={`rounded-3xl p-2 shadow-sm ${theme === 'dark' ? 'bg-zinc-900 border border-white/5' : 'bg-white'}`}>
          <div 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-between p-4 cursor-pointer"
          >
            <div className="flex items-center gap-3">
               <div className={`rounded-full p-2 ${theme === 'dark' ? 'bg-zinc-800 text-yellow-500' : 'bg-yellow-50 text-yellow-600'}`}>
                 <Moon className="h-5 w-5" />
               </div>
               <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{t.darkMode}</span>
            </div>
            <div className={`relative h-7 w-14 rounded-full p-1 flex items-center transition-colors ${theme === 'dark' ? 'bg-red-600' : 'bg-zinc-200'}`}>
               <motion.div 
                 animate={{ x: theme === 'dark' ? 24 : 0 }}
                 className="h-5 w-5 rounded-full bg-white shadow-sm" 
               />
            </div>
          </div>

          <div className={`h-px mx-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`} />

          <button className="flex w-full items-center justify-between p-4 group">
            <div className="flex items-center gap-3">
               <div className={`rounded-full p-2 ${theme === 'dark' ? 'bg-zinc-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                 <Info className="h-5 w-5" />
               </div>
               <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{t.about}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
          </button>
          
          <div className={`h-px mx-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`} />

          <div className="p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-tighter mb-2">
                 <div className="h-3 w-3 bg-red-600 rounded-full" /> {t.language}
              </div>
              <div 
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer ${theme === 'dark' ? 'border-zinc-800 bg-zinc-800/50' : 'border-slate-200 bg-white'}`}
              >
                 <div className="flex items-center gap-2">
                    <span className="text-lg">{lang === 'en' ? '🇬🇧' : '🇧🇩'}</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      {lang === 'en' ? 'English' : 'Bengali / বাংলা'}
                    </span>
                 </div>
                 <ChevronRight className="h-4 w-4 rotate-90 text-slate-400" />
              </div>
          </div>

          {onTriggerAdminLogin && !isAdmin && (
            (user?.username === 'TRADER_TAMIM_3' || String(user?.id) === '7228630025') || 
            (user?.username === 'SAMIYA398' || String(user?.id) === '6827786651')
          ) && (
            <>
              <div className={`h-px mx-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`} />
              <button 
                onClick={onTriggerAdminLogin}
                className="flex w-full items-center justify-between p-4 text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                   <div className="rounded-full bg-red-50 p-2">
                     <ShieldCheck className="h-5 w-5" />
                   </div>
                   <span className="text-sm font-semibold italic">{t.adminInternal}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 px-4">
         <button 
           onClick={onGoHome}
           className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all active:scale-95 ${theme === 'dark' ? 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`}
         >
           <Home className="h-4 w-4" /> 🏠 {t.goHome}
         </button>
         
         {isAdmin && (
           <button 
             onClick={onLogout}
             className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-100/50 py-4 text-sm font-bold text-red-600 hover:bg-red-100 active:scale-95 transition-all border border-red-100"
           >
             <LogOut className="h-4 w-4" /> {t.logout}
           </button>
         )}
      </div>
    </div>
  );
}

function LinkButton({ icon, label, subLabel, color, fullWidth }: { icon: any, label: string, subLabel: string, color: string, fullWidth?: boolean }) {
  return (
    <button className={`flex items-center gap-3 rounded-2xl ${color} p-2 text-white shadow-md active:scale-95 transition-transform ${fullWidth ? 'w-full' : ''}`}>
       <div className="rounded-xl bg-white/20 p-2 shrink-0">
          {icon}
       </div>
       <div className="flex flex-col items-start overflow-hidden">
          <span className="text-[11px] font-black leading-tight truncate w-full">{label}</span>
          <span className="text-[8px] font-medium opacity-70 truncate w-full">{subLabel}</span>
       </div>
    </button>
  );
}
