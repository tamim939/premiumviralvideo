import React from 'react';
import { Home, Search, Calendar, Heart, User, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export type TabId = 'home' | 'upcoming' | 'favorite' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  userPhoto?: string;
}

export default function BottomNav({ activeTab, setActiveTab, userPhoto, isAdmin, theme, t }: BottomNavProps & { isAdmin?: boolean, theme?: string, t: any }) {
  const tabs = [
    { id: 'home', icon: Home, label: t.home },
    { id: 'upcoming', icon: Calendar, label: t.upcoming },
    { id: 'favorite', icon: Heart, label: t.favorite },
    { id: 'profile', icon: User, label: t.profile },
  ];

  // If user is admin, we want to allow access to admin panel via Profile or direct check
  // For now let's add a special hidden way or just use profile for admin
  const adminTab = isAdmin ? { id: 'search' as any, icon: ShieldCheck, label: 'Admin' } : null;
  const displayTabs = adminTab ? [...tabs.slice(0, 4), adminTab, tabs[4]] : tabs;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-40 overflow-hidden rounded-[28px] border p-1.5 shadow-2xl backdrop-blur-md transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-900/90 border-white/10 shadow-black' : 'bg-white/95 border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]'}`}>
      <div className="flex items-center justify-around">
        {displayTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 transition-all active:scale-90"
            >
              <div className="relative">
                {tab.id === 'profile' && userPhoto ? (
                  <img src={userPhoto} alt="User" className={`h-6 w-6 rounded-full border-2 transition-all ${isActive ? 'border-red-600 scale-110' : 'border-slate-200'}`} referrerPolicy="no-referrer" />
                ) : (
                  <Icon className={`h-5 w-5 transition-all ${isActive ? 'text-red-500 scale-110' : 'text-slate-400'}`} />
                )}
              </div>
              
              <span className={`text-[9px] font-bold transition-colors ${isActive ? 'text-red-500' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-1 h-1 w-4 rounded-full bg-red-600"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
